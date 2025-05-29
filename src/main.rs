use rocket::{
    form::Form,
    fs::{FileServer, NamedFile},
    http::CookieJar,
    response::Redirect,
    serde::json::Json,
};
use rocket_dyn_templates::{context, Template};

#[macro_use]
extern crate rocket;

#[get("/")]
async fn index() -> Option<NamedFile> {
    NamedFile::open("templates/index.html").await.ok()
}

#[get("/api/events")]
async fn get_events() -> Json<Vec<zok_website::Event>> {
    let events = zok_website::get_events().await;
    return Json(events);
}

#[get("/api/berichten")]
async fn get_berichten() -> Json<Vec<zok_website::Bericht>> {
    let berichten = zok_website::get_berichten().await;
    return Json(berichten);
}

#[get("/wie-zijn-wij")]
async fn wie_zijn_wij() -> Option<NamedFile> {
    NamedFile::open("templates/wie_zijn_wij.html").await.ok()
}

#[get("/kalender/<event_id>")]
async fn event_page(event_id: &str) -> Option<Template> {
    let event = zok_website::get_event_info(event_id.to_string()).await?;
    Some(Template::render("event", context! {event}))
}

#[get("/berichten/<bericht_id>")]
async fn bericht_page(bericht_id: &str) -> Option<Template> {
    let bericht = zok_website::get_bericht_info(bericht_id.to_string()).await?;
    Some(Template::render("bericht", context! {bericht}))
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
    let berichten = zok_website::get_berichten().await;

    Template::render("admin", context! {events, berichten})
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
    dbg!(&result);

    match result {
        Ok(()) => Redirect::to("/admin?message=Event%20succesfully%20deleted"),
        Err(error) => Redirect::to(format!(
            "/admin?message=Error:%20{}",
            error.to_string().replace(" ", "%20")
        )),
    }
}

#[get("/admin/add-event")]
async fn add_event_page(_admin: zok_website::Admin) -> Template {
    Template::render("add_event", context! {})
}

#[get("/admin/edit-event/<id>")]
async fn edit_event_page(_admin: zok_website::Admin, id: String) -> Option<Template> {
    let event = zok_website::get_event_info(id).await?;
    let mut date = event.date.split("/").collect::<Vec<&str>>();
    date.reverse();
    let date = date.join("-");
    Some(Template::render("edit_event", context! {event, date}))
}

#[get("/admin/add-bericht")]
async fn add_bericht_page(_admin: zok_website::Admin) -> Template {
    Template::render("add_bericht", context! {})
}

#[get("/admin/edit-bericht/<id>")]
async fn edit_bericht_page(_admin: zok_website::Admin, id: String) -> Option<Template> {
    let bericht = zok_website::get_bericht_info(id).await?;
    Some(Template::render("edit_bericht", context! {bericht}))
}

#[post("/admin/add-event", data = "<form>")]
async fn add_event(_admin: zok_website::Admin, form: Form<zok_website::EventForm<'_>>) -> Redirect {
    let form: zok_website::EventForm = form.into_inner();
    let result = zok_website::add_event(form).await;
    if result.is_ok() {
        Redirect::to("/admin?message=Added%20event")
    } else {
        eprintln!("{:#?}", result);
        let error = result.unwrap_err().to_string().replace(" ", "%20");
        Redirect::to(format!("/admin?message=Error:%20{error}"))
    }
}

#[post("/admin/add-bericht", data = "<form>")]
async fn add_bericht(
    _admin: zok_website::Admin,
    form: Form<zok_website::BerichtForm<'_>>,
) -> Redirect {
    let form: zok_website::BerichtForm = form.into_inner();
    let result = zok_website::add_bericht(form).await;
    if result.is_ok() {
        Redirect::to("/admin?message=Added%20bericht")
    } else {
        eprintln!("{:#?}", result);
        let error = result.unwrap_err().to_string().replace(" ", "%20");
        Redirect::to(format!("/admin?message=Error:%20{error}"))
    }
}

#[post("/admin/edit-event/<id>", data = "<form>")]
async fn edit_event(
    _admin: zok_website::Admin,
    form: Form<zok_website::EditEventForm>,
    id: &str,
) -> Redirect {
    let form: zok_website::EditEventForm = form.into_inner();
    let result = zok_website::edit_event(form, id).await;
    if result.is_ok() {
        Redirect::to("/admin?message=Edited%20event")
    } else {
        eprintln!("{:#?}", result);
        let error = result.unwrap_err().to_string().replace(" ", "%20");
        Redirect::to(format!("/admin?message=Error:%20{error}"))
    }
}

#[post("/admin/edit-bericht/<id>", data = "<form>")]
async fn edit_bericht(
    _admin: zok_website::Admin,
    form: Form<zok_website::EditBerichtForm>,
    id: &str,
) -> Redirect {
    let form: zok_website::EditBerichtForm = form.into_inner();
    let result = zok_website::edit_bericht(form, id).await;
    if result.is_ok() {
        Redirect::to("/admin?message=Edited%20bericht")
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
                get_events,
                get_berichten,
                wie_zijn_wij,
                leden,
                contact,
                lid_worden,
                event_page,
                bericht_page,
                admin,
                admin_login,
                check_login,
                delete_item,
                add_event_page,
                add_bericht_page,
                add_event,
                add_bericht,
                edit_bericht_page,
                edit_event_page,
                edit_bericht,
                edit_event,
            ],
        )
        .register("/", catchers![not_found, admin_login_catcher])
        .mount("/", FileServer::from("public"))
        .mount(
            "/uploads/img",
            FileServer::from(env!("UPLOADS_PATH")).rank(0),
        )
        .attach(Template::fairing())
}
