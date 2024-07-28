use rocket::{
    form::Form,
    fs::{FileServer, NamedFile},
    http::CookieJar,
    response::Redirect,
};
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

#[get("/admin")]
async fn admin(_admin: zok_website::Admin) -> Template {
    let events = zok_website::get_events().await;

    Template::render("admin", context! {events})
}

#[post("/admin-login", data = "<form>")]
async fn check_login(form: Form<zok_website::AdminLogin>, jar: &CookieJar<'_>) -> Redirect {
    let password_input = &form.password.to_string();
    let is_correct = zok_website::check_password(password_input.to_string()).await;

    if let Some(cookie_value) = is_correct {
        jar.add_private(("password_hash", cookie_value));
        Redirect::to("/admin")
    } else {
        Redirect::to("/admin-login?error=wrong-password")
    }
}

#[catch(401)]
async fn admin_login_catcher() -> Option<NamedFile> {
    NamedFile::open("templates/admin_login.html").await.ok()
}

#[get("/admin-login")]
async fn admin_login() -> Option<NamedFile> {
    NamedFile::open("templates/admin_login.html").await.ok()
}

#[catch(404)]
async fn not_found() -> Option<NamedFile> {
    NamedFile::open("templates/404.html").await.ok()
}

#[launch]
fn rocket() -> _ {
    env!("ROCKET_SECRET_KEY");
    rocket::build()
        .mount(
            "/",
            routes![
                index,
                wie_zijn_wij,
                leden,
                contact,
                lid_worden,
                event_page,
                admin,
                admin_login,
                check_login
            ],
        )
        .register("/", catchers![not_found, admin_login_catcher])
        .mount("/", FileServer::from("public"))
        .attach(Template::fairing())
}
