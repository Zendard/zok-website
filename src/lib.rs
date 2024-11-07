use rocket::{
    http::Status,
    request::{self, FromRequest, Request,Outcome},
    serde::{Deserialize, Serialize},
    FromForm,
    fs::TempFile
};
use std::{error::Error, path::PathBuf};

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
    img_path: PathBuf,
    location: Location,
    date: String,
    start: String,
    duration: Option<String>,
    pqk: Option<u32>,
    cost: Option<f32>,
    cost_member: Option<f32>,
}


#[derive(FromForm)]
pub struct EventForm<'a> {
    title: String,
    description: String,
    img: TempFile<'a>,
    location_name: String,
    location_address: Option<String>,
    date: String,
    start: String,
    duration: Option<String>,
    cost: Option<f32>,
    cost_member: Option<f32>,
    pqk: Option<u32>,
}

impl <'a> EventForm<'a>{
    #[allow(clippy::wrong_self_convention)]
    async fn to_event(mut self)->Result<Event, Box<dyn Error>>{
        let id = surrealdb::Uuid::new_v4().to_string();
        let filename=format!("{}_{}",&id,self.img.name().ok_or("No filename")?);
        let img_path=std::path::PathBuf::from(env!("UPLOADS_PATH")).join(filename);
        self.img.persist_to(img_path).await?;
        Ok(Event{
            id,
            title: self.title,
            description: self.description,
            img_path: self.img.path().ok_or("Invalid img path")?.to_path_buf(),
            location: Location{
                name: self.location_name,
                address: self.location_address
            },
            date: self.date,
            start: self.start,
            duration: self.duration,
            pqk: self.pqk,
            cost: self.cost,
            cost_member: self.cost_member,
        })
    }
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
        "SELECT record::id(id) AS id,
        title,
        description,
        img_path,
        location.name,
        location.address,
        date,
        start,
        duration,
        pqk,
        cost,
        cost_member FROM event",
    )
    .await
    .unwrap()
    .take(0).unwrap()
}

pub async fn get_event_info(event_id: String) -> Option<Event> {
    let db = connect_to_db().await;

    db.query(
        "
        SELECT meta::id(id) AS id,
        title,
        description,
        img_path,
        location.name,
        location.address,
        date,
        start,
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

pub async fn delete_id(table: String, id: String) -> Option<String> {
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

pub async fn add_event(event: EventForm<'_>) -> Result<(), Box<dyn Error>>{
    let event = event.to_event().await?;
    
    let db = connect_to_db().await;
    db.query("
        $location = SELECT VALUE id FROM location WHERE 
            name=$event.location.name AND
            address=$event.location.address;

        $location = IF type::is::none($location[0]) {
            CREATE location SET
                name=$event.location.name, address=$event.location.address;
    
            $location = SELECT VALUE id FROM location WHERE
                name=$event.location.name AND
                address=$event.location.address;
    
            $location[0]
        } ELSE {$location[0]};

        CREATE event SET
            id=$event.id,
            title=$event.title,
            description=$event.description,
            img_path=$event.img_path,
            date=$event.date,
            start=$event.start,
            duration=$event.duration,
            location=$location,
            cost=$event.cost,
            cost_member=$event.cost_member,
            pqk=$event.pqk
        ").bind(("event", event)).await.unwrap();

    Ok(())
}
