const nav = document.querySelector('nav');
const hamburgerButton = document.getElementById('nav-button');

hamburgerButton.addEventListener('click', (e) => {
	hamburgerButton.style.display = 'none';
	nav.classList.toggle('nav-open');
	setTimeout(() => { hamburgerButton.style.display = 'initial'; }, 1000);
});