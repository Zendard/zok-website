use rocket::fs::FileServer;
use rocket_dyn_templates::{context, Template};

#[macro_use]
extern crate rocket;

#[get("/")]
fn index() -> Template {
    Template::render("index", context! {})
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index])
        .mount("/", FileServer::from("public"))
        .attach(Template::fairing())
}
