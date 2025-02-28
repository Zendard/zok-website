let wrong_password = document.getElementById("wrong-password")

if (new URLSearchParams(window.location.search).get('error') == 'wrong-password') {
  wrong_password.style.display = 'initial'
}
