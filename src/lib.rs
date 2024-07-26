use rocket::serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Lid {
    name: String,
    address: Option<String>,
    email: Option<String>,
    phone: Option<String>,
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
