let dialog = document.getElementById("message")
let close_button = dialog.querySelector("button")
let message = new URLSearchParams(window.location.search).get("message")

dialog.querySelector("h1").innerText = message

if (message) {
  dialog.showModal()
}

close_button.addEventListener("click", () => { dialog.close() })
