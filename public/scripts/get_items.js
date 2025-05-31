async function get_events() {
  const response = await fetch("/api/events")
  const events = await response.json()

  add_events(events)
}

function add_events(events_json) {
  const events = events_json.map(make_event)

  const event_list = document.querySelector(".kalender-items")
  event_list.innerText = ""
  events.forEach(event => {
    event_list.appendChild(event)
  });
}

function make_event(event) {
  // Parent anchor
  const anchor = document.createElement("a")
  anchor.classList.add("event")
  anchor.href = `/kalender/${event.id}`

  // Header
  const header = document.createElement("div")
  header.classList.add("event-header")

  // Title
  const title = document.createElement("h3")
  title.innerText = event.title

  // Image
  const img = document.createElement("img")
  img.src = event.img_path

  // Chips list
  const chips = document.createElement("div")
  chips.classList.add("chips")

  // Date chip
  const date = document.createElement("h3")
  date.classList.add("chip")
  date.innerText = " " + event.date

  // Date chip symbol
  const date_symbol = document.createElement("i")
  date_symbol.classList.add("fa-solid")
  date_symbol.classList.add("fa-calendar-days")

  // Time chip
  const time = document.createElement("h3")
  time.classList.add("chip")
  time.innerText = " " + event.start

  // Time chip symbol
  const time_symbol = document.createElement("i")
  time_symbol.classList.add("fa-solid")
  time_symbol.classList.add("fa-clock")

  // Location chip
  const location = document.createElement("h3")
  location.classList.add("chip")
  location.innerText = " " + event.location.name

  // Location chip symbol
  const location_symbol = document.createElement("i")
  location_symbol.classList.add("fa-solid")
  location_symbol.classList.add("fa-location-dot")

  date.prepend(date_symbol)
  chips.appendChild(date)
  time.prepend(time_symbol)
  chips.appendChild(time)
  location.prepend(location_symbol)
  chips.appendChild(location)
  header.appendChild(img)
  header.appendChild(chips)
  anchor.appendChild(header)
  anchor.appendChild(title)

  return anchor
}

async function get_berichten() {
  const response = await fetch("/api/berichten")
  const berichten = await response.json()

  add_berichten(berichten)
}

function add_berichten(berichten_json) {
  const berichten = berichten_json.map(make_bericht)

  const berichten_list = document.querySelector(".berichten>.list")
  berichten_list.innerText = ""
  berichten.forEach(bericht => {
    berichten_list.appendChild(bericht)
  });
}

function make_bericht(bericht) {
  // Parent anchor
  const anchor = document.createElement("a")
  anchor.classList.add("bericht")
  anchor.href = `/berichten/${bericht.id}`

  // Image
  const img = document.createElement("img")
  img.src = bericht.img_path

  // Text div
  const text = document.createElement("div")
  text.classList.add("text")

  //Title
  const title = document.createElement("h4")
  title.innerText = bericht.title

  // Content
  const content = document.createElement("p")
  content.innerText = remove_html_tags(bericht.description)

  anchor.appendChild(img)
  text.appendChild(title)
  text.appendChild(content)
  anchor.appendChild(text)

  return anchor
}

function remove_html_tags(text) {
  const regex = /<\w*>|<\/\w*>/g
  const output = text.replaceAll(regex, "");
  return output
}

get_events().await
get_berichten().await
