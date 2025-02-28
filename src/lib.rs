use rocket::{
    fs::TempFile,
    http::Status,
    request::{self, FromRequest, Outcome, Request},
    serde::{Deserialize, Serialize},
    FromForm,
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
    pub date: String,
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

impl<'a> EventForm<'a> {
    #[allow(clippy::wrong_self_convention)]
    async fn to_event(mut self) -> Result<Event, Box<dyn Error>> {
        let id = surrealdb::Uuid::new_v4().to_string();

        let img_path = std::path::PathBuf::from(env!("UPLOADS_PATH")).join(id.clone());

        self.img.persist_to(img_path).await?;

        dbg!(&self.date);

        Ok(Event {
            id,
            title: self.title,
            description: self.description,
            img_path: self.img.path().ok_or("Invalid img path")?.to_path_buf(),
            location: Location {
                name: self.location_name,
                address: self.location_address,
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

#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct Bericht {
    id: String,
    title: String,
    pub description: String,
    img_path: PathBuf,
}

#[derive(FromForm)]
pub struct BerichtForm<'a> {
    title: String,
    description: String,
    img: TempFile<'a>,
}

impl<'a> BerichtForm<'a> {
    #[allow(clippy::wrong_self_convention)]
    async fn to_bericht(mut self) -> Result<Bericht, Box<dyn Error>> {
        let id = surrealdb::Uuid::new_v4().to_string();

        let filename = format!("{}_{}", &id, self.img.name().ok_or("No filename")?);
        let img_path = std::path::PathBuf::from(env!("UPLOADS_PATH")).join(filename);

        self.img.persist_to(img_path).await?;

        Ok(Bericht {
            id,
            title: self.title,
            description: self.description,
            img_path: self.img.path().ok_or("Invalid img path")?.to_path_buf(),
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
        date as datetime,
        time::format(date,'%d/%m/%Y') as date,
        start,
        duration,
        pqk,
        cost,
        cost_member FROM event ORDER BY datetime ASC",
    )
    .await
    .unwrap()
    .take(0)
    .unwrap()
}

pub async fn get_berichten() -> Vec<Bericht> {
    let db = connect_to_db().await;

    db.query(
        "SELECT record::id(id) AS id,
        title,
        description,
        img_path FROM bericht",
    )
    .await
    .unwrap()
    .take(0)
    .unwrap()
}

pub async fn get_event_info(event_id: String) -> Option<Event> {
    let db = connect_to_db().await;

    db.query(
        "
        SELECT record::id(id) AS id,
        title,
        description,
        img_path,
        location.name,
        location.address,
        time::format(date, '%d/%m/%Y') as date,
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

pub async fn get_bericht_info(bericht_id: String) -> Option<Bericht> {
    let db = connect_to_db().await;

    db.query(
        "
        SELECT record::id(id) AS id,
        title,
        description,
        img_path
        FROM ONLY type::thing('bericht', $bericht_id)",
    )
    .bind(("bericht_id", bericht_id))
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

pub async fn delete_id(table: String, id: String) -> Result<(), Box<dyn Error>> {
    let db = connect_to_db().await;

    let mut result = db
        .query(
            "
            ((DELETE type::thing($table, $id) RETURN BEFORE)[0]).img_path;
    ",
        )
        .bind(("table", table))
        .bind(("id", id))
        .await?;

    dbg!(&result);
    let img_path: String = result
        .take::<Option<String>>(0)?
        .ok_or("No img path found")?;

    std::fs::remove_file(img_path)?;

    Ok(())
}

pub async fn add_event(event: EventForm<'_>) -> Result<(), Box<dyn Error>> {
    let event = event.to_event().await?;

    let db = connect_to_db().await;
    db.query(
        "
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
            date=type::datetime($event.date),
            start=$event.start,
            duration=$event.duration,
            location=$location,
            cost=$event.cost,
            cost_member=$event.cost_member,
            pqk=$event.pqk
        ",
    )
    .bind(("event", event))
    .await?;

    Ok(())
}

pub async fn add_bericht(bericht: BerichtForm<'_>) -> Result<(), Box<dyn Error>> {
    let db = connect_to_db().await;
    let bericht = bericht.to_bericht().await?;

    db.query(
        "
        CREATE bericht SET
        id=$bericht.id,
        title=$bericht.title,
        description=$bericht.description,
        img_path=$bericht.img_path;
        ",
    )
    .bind(("bericht", bericht))
    .await?;

    Ok(())
}

#[derive(FromForm)]
pub struct EditBerichtForm {
    title: String,
    description: String,
}

pub async fn edit_bericht(bericht: EditBerichtForm, id: &str) -> Result<(), Box<dyn Error>> {
    let db = connect_to_db().await;

    let bericht = Bericht {
        id: id.to_string(),
        title: bericht.title,
        description: bericht.description,
        img_path: PathBuf::new(),
    };

    db.query(
        "
        UPDATE ONLY type::thing('bericht', $bericht.id) SET
        title=$bericht.title,
        description=$bericht.description
    ",
    )
    .bind(("bericht", bericht))
    .await?;

    Ok(())
}

#[derive(FromForm)]
pub struct EditEventForm {
    title: String,
    description: String,
    location_name: String,
    location_address: Option<String>,
    date: String,
    start: String,
    duration: Option<String>,
    cost: Option<f32>,
    cost_member: Option<f32>,
    pqk: Option<u32>,
}

pub async fn edit_event(event: EditEventForm, id: &str) -> Result<(), Box<dyn Error>> {
    let db = connect_to_db().await;

    let event = Event {
        id: id.to_string(),
        title: event.title,
        description: event.description,
        img_path: PathBuf::new(),
        date: event.date,
        start: event.start,
        duration: event.duration,
        location: Location {
            name: event.location_name,
            address: event.location_address,
        },
        cost: event.cost,
        cost_member: event.cost_member,
        pqk: event.pqk,
    };

    db.query(
        "
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

        UPDATE ONLY type::thing('event', $event.id) SET
        title= $event.title,
        description= $event.description,
        date=type::datetime($event.date),
        start= $event.start,
        duration= $event.duration,
        location= $location,
        cost= $event.cost,
        cost_member= $event.cost_member,
        pqk= $event.pqk
    ",
    )
    .bind(("event", event))
    .await?;

    Ok(())
}

pub fn remove_tags(mut string: String) -> String {
    loop {
        let open_tag_index = string.find("<");
        // Return if we don't find a tag opening
        if let None = open_tag_index {
            return string;
        }

        let close_tag_index = string.find(">");
        // Return if we don't find a tag closing
        if let None = open_tag_index {
            return string;
        }

        // Return if < comes after >
        if open_tag_index > close_tag_index {
            return string;
        }

        let range = open_tag_index.unwrap()..(close_tag_index.unwrap() + 1);

        string.replace_range(range, " ");
    }
}
