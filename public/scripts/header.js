const nav = document.querySelector('nav');
const hamburgerButton = document.getElementById('nav-button');

hamburgerButton.addEventListener('click', () => {
  nav.classList.toggle('nav-open');
});
