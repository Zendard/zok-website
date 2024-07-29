let dialog = document.getElementById("message")
let close_button = dialog.querySelector("button")
let deleted_param = new URLSearchParams(window.location.search).get("deleted")

console.log(dialog)

dialog.querySelector("h1").innerText = "Deleted " + deleted_param

// if (deleted_param) {
dialog.showModal()
// }

close_button.addEventListener("click", () => { dialog.close() })
