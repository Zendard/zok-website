const nav = document.querySelector('nav');
const hamburgerButton = document.getElementById('nav-button');

hamburgerButton.addEventListener('click', () => {
  nav.classList.toggle('nav-open');
});

async function check_admin() {
  const response = await fetch("/api/is-admin")

  if (response.ok) {
    const admin_anchor = document.createElement("a")
    admin_anchor.classList.add("nav-button")
    admin_anchor.href = "/admin"
    admin_anchor.innerText = "Admin"

    nav.appendChild(admin_anchor)
  }
}

check_admin()
