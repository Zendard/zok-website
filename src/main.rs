use rocket::fs::{FileServer, NamedFile};
use rocket_dyn_templates::{context, Template};

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index() -> Template {
    Template::render("index", context! {})
}

#[get("/wie-zijn-wij")]
async fn wie_zijn_wij() -> Option<NamedFile> {
    NamedFile::open("templates/wie_zijn_wij.html").await.ok()
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

#[catch(404)]
async fn not_found() -> Option<NamedFile> {
    NamedFile::open("templates/404.html").await.ok()
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, wie_zijn_wij, leden, contact])
        .register("/", catchers![not_found])
        .mount("/", FileServer::from("public"))
        .attach(Template::fairing())
}
