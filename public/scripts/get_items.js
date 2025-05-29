async function get_data() {
  const response = await fetch("/api/events")
  const events = await response.json()
  console.log(events)

  add_events(events)
}

function add_events(events_json) {
  const events = events_json.map(make_event)
  console.log(events)

  const event_list = document.querySelector(".kalender-items")
  event_list.innerText = ""
  events.forEach(event => {
    event_list.appendChild(event)
  });
}

function make_event(event) {
  const anchor = document.createElement("a")
  anchor.href = `/kalender/${event.id}`

  const div = document.createElement("div")
  div.classList.add("event")

  const header = document.createElement("div")
  header.classList.add("event-header")

  const title = document.createElement("h3")
  title.innerText = event.title

  const img = document.createElement("img")
  img.src = event.img_path

  const chips = document.createElement("div")
  chips.classList.add("chips")

  const date = document.createElement("h3")
  date.classList.add("chip")
  date.innerText = " " + event.date

  const date_symbol = document.createElement("i")
  date_symbol.classList.add("fa-solid")
  date_symbol.classList.add("fa-calendar-days")

  date.prepend(date_symbol)
  chips.appendChild(date)
  header.appendChild(img)
  header.appendChild(chips)
  div.appendChild(header)
  div.appendChild(title)
  anchor.appendChild(div)

  return anchor
}

get_data().await
