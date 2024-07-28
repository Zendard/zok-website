use rocket::fs::{FileServer, NamedFile};
use rocket_dyn_templates::{context, Template};

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index() -> Template {
    let events = zok_website::get_events().await;
    Template::render("index", context! {events})
}

#[get("/wie-zijn-wij")]
async fn wie_zijn_wij() -> Option<NamedFile> {
    NamedFile::open("templates/wie_zijn_wij.html").await.ok()
}

#[get("/kalender/<event_id>")]
async fn event_page(event_id: &str) -> Template {
    let event = zok_website::get_event_info(event_id).await;
    Template::render("event", context! {event})
}

#[get("/leden")]
async fn leden() -> Template {
    let leden = zok_website::fetch_leden().await;
    dbg!(&leden);

    Template::render("leden", context! {leden})
}

#[get("/contact")]
async fn contact() -> Option<NamedFile> {
    NamedFile::open("templates/contact.html").await.ok()
}

#[get("/lid-worden")]
async fn lid_worden() -> Option<NamedFile> {
    NamedFile::open("templates/lid_worden.html").await.ok()
}

#[catch(404)]
async fn not_found() -> Option<NamedFile> {
    NamedFile::open("templates/404.html").await.ok()
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount(
            "/",
            routes![index, wie_zijn_wij, leden, contact, lid_worden, event_page],
        )
        .register("/", catchers![not_found])
        .mount("/", FileServer::from("public"))
        .attach(Template::fairing())
}
