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
async fn index(jar: &CookieJar<'_>) -> Template {
    let events = zok_website::get_events().await;
    let is_admin = jar.get_private("password_hash").is_some();

    Template::render("index", context! {events, is_admin})
}

#[get("/wie-zijn-wij")]
async fn wie_zijn_wij() -> Option<NamedFile> {
    NamedFile::open("templates/wie_zijn_wij.html").await.ok()
}

#[get("/kalender/<event_id>")]
async fn event_page(event_id: &str) -> Template {
    let event = zok_website::get_event_info(event_id.to_string()).await;
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

#[get("/admin/delete/<table>/<id>")]
async fn delete_item(table: &str, id: &str, _admin: zok_website::Admin) -> Redirect {
    let result = zok_website::delete_id(table.to_string(), id.to_string()).await;

    match result {
        Some(title) => Redirect::to(format!("/admin?deleted={title}")),
        None => Redirect::to("/admin?deleted=none"),
    }
}

#[get("/admin/add-event")]
async fn add_event_page(_admin: zok_website::Admin) -> Template {
    Template::render("add_event", context! {})
}

#[post("/admin/add-event", data = "<form>")]
async fn add_event(_admin: zok_website::Admin, form: Form<zok_website::EventForm<'_>>) -> Redirect {
    let form: zok_website::EventForm = form.into_inner();
    let result = zok_website::add_event(form).await;
    if result.is_ok(){
    Redirect::to("/admin?message=Added%20event")
    } else {
        eprintln!("{:#?}", result);
        let error = result.unwrap_err().to_string().replace(" ", "%20");
        Redirect::to(format!("/admin?message=Error:%20{error}"))
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
                check_login,
                delete_item,
                add_event_page,
                add_event,
            ],
        )
        .register("/", catchers![not_found, admin_login_catcher])
        .mount("/", FileServer::from("public"))
        .attach(Template::fairing())
}
