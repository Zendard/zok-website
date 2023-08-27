const header = document.createElement("header");
const footer = document.createElement("footer");

header.innerHTML = `
		<div class="logo"><span>Z</span><small>OK</small></div>
		<nav>
			<a class="menu-button" href="./index.html">Home</a>
			<a class="menu-button" href="./zok.html">ZOK</a>
			<a class="menu-button" href="./onze-kines.html">Onze kine's</a>
			<a class="menu-button" href="./contact.html">Contact</a>
			<a class="menu-button" href="./lid-worden.html">Lid worden</a>
		</nav>
		<img src="./burger-menu-icon.svg" alt="burger menu" id="burger-menu-button" class="menu-button">
`;

footer.innerHTML = `
<div class="sponsors">
			<h4 class="footer-title">Onze sponsors</h4>
			<div class="sponsors-photos">
				<img src="./images/sponsors/gymna.png" alt="gymna logo">
				<img src="./images/sponsors/trenker.jpg" alt="trenker laboratories logo">
			</div>
		</div>
		<div class="contact">
			<h4 class="footer-title">Zuid-Oost-Vlaamse kinekring</h4>
			<div class="adress">
				<p class="contact-text">Groendal 67</p>
				<p class="contact-text">9500 Geraardsbergen</p>
			</div>
			<p class="contact-text">email: ZOKKinekring@gmail.com</p>
			<p class="contact-text">tel: 054/33.43.41</p>
			<a class="disclaimer-link" href="./disclaimer">Disclaimer & privacy</a>
		</div>
`;
document.body.insertBefore(header, document.body.firstChild);
document.body.appendChild(footer);

//menu phone
const burgerButton = document.querySelector("#burger-menu-button");
const menu = document.querySelector("nav");

burgerButton.addEventListener("click", (e) => {
	menu.classList.toggle("menu-open");
});

//color current page
const buttonsList = document.getElementsByClassName("menu-button");
for (i = 0; i < buttonsList.length; i++) {
	if (buttonsList[i].getAttribute("href") == "." + window.location.pathname) {
		buttonsList[i].setAttribute(
			"style",
			"background-color:#46B1E1; color:white"
		);
	}
}
