use rocket::request::{self, FromRequest, Request};
use rocket::FromForm;
use rocket::{
    http::Status,
    request::Outcome,
    serde::{Deserialize, Serialize},
};
use surrealdb::sql::{Duration, Number};

#[derive(Debug, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Lid {
    name: String,
    address: Option<String>,
    email: Option<String>,
    phone: Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct Event {
    id: String,
    title: String,
    description: String,
    location: Location,
    date: String,
    start: String,
    end: Option<String>,
    pqk: Option<u16>,
    cost: Option<Number>,
    cost_member: Option<Number>,
    duration: Option<Duration>,
}

#[derive(FromForm)]
pub struct AdminLogin {
    pub password: String,
}

pub struct Admin;
#[derive(Debug)]
pub struct AuthorizationError;

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Admin {
    type Error = AuthorizationError;
    async fn from_request(req: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let password = env!("ADMIN_PASSWORD");

        let cookie = req.cookies().get_private("password_hash");

        if cookie.is_none() {
            return Outcome::Error((Status::Unauthorized, AuthorizationError));
        }

        if cookie.unwrap().value() == password {
            Outcome::Success(Admin)
        } else {
            return Outcome::Error((Status::Unauthorized, AuthorizationError));
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct Location {
    name: String,
    address: Option<String>,
}

pub async fn fetch_leden() -> Option<Vec<Lid>> {
    let response =
        minreq::get("https://axxon.be/kringsite/35-zuid-oost-vlaamse-kinesitherapeuten/leden/")
            .send();
    let leden = response
        .ok()?
        .as_str()
        .ok()?
        .lines()
        .find(|line| line.trim().starts_with("<h1>Leden</h1><ul><li>"))?
        .trim()
        .trim_start_matches("<h1>Leden</h1><ul><li>")
        .trim_end_matches("</li></ul>")
        .split("</li><li>")
        .map(|lid| lid.split(" - ").collect::<Vec<&str>>())
        .map(|lid| Lid {
            name: lid.first().unwrap().to_string(),
            address: lid.get(1).map(|str| {
                if str.trim() == "," {
                    return String::new();
                }

                str.to_string()
            }),
            email: lid.get(2).map(|str| str.to_string()),
            phone: lid
                .get(3)
                .map(|str| str.trim_start_matches("T ").to_string()),
        })
        .collect::<Vec<Lid>>();

    Some(leden)
}

pub async fn connect_to_db() -> surrealdb::Surreal<surrealdb::engine::remote::ws::Client> {
    let db = surrealdb::Surreal::new::<surrealdb::engine::remote::ws::Ws>("localhost:5000")
        .await
        .unwrap();

    db.signin(surrealdb::opt::auth::Root {
        username: "root",
        password: env!("DB_PASSWORD"),
    })
    .await
    .unwrap();

    db.use_ns("zok").use_db("main").await.unwrap();

    db
}

pub async fn get_events() -> Vec<Event> {
    let db = connect_to_db().await;

    db.query(
        "SELECT meta::id(id) AS id,
        title,
        description,
        location.name,
        location.address,
        time::format(start, '%d/%m/%y') AS date,
        time::format(start, '%k:%M') AS start,
        duration,
        pqk,
        cost,
        cost_member FROM event",
    )
    .await
    .unwrap()
    .take(0)
    .unwrap()
}

pub async fn get_event_info(event_id: &str) -> Option<Event> {
    let db = connect_to_db().await;

    db.query(
        "SELECT 
        meta::id(id) AS id,
        title,
        description,
        location.name,
        location.address,
        time::format(start, '%d/%m/%y') AS date,
        time::format(start, '%k:%M') AS start,
        duration,
        pqk,
        cost,
        cost_member
        FROM ONLY type::thing('event', $event_id)",
    )
    .bind(("event_id", event_id))
    .await
    .unwrap()
    .take(0)
    .ok()?
}

pub async fn check_password(password_input: String) -> Option<String> {
    let correct_password = env!("ADMIN_PASSWORD");

    if password_input == correct_password {
        Some(password_input)
    } else {
        None
    }
}

pub async fn delete_id(table: &str, id: &str) -> Option<String> {
    let db = connect_to_db().await;

    let mut result = db
        .query("(DELETE ONLY type::thing($table,$id) RETURN BEFORE).title")
        .bind(("table", table))
        .bind(("id", id))
        .await
        .ok()?;

    dbg!(&result);

    result.take(0).ok()?
}
