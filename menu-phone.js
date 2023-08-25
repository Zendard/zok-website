const burgerButton = document.querySelector("#burger-menu-button");
const menu = document.querySelector("nav");

burgerButton.addEventListener("click", (e) => {
	menu.classList.toggle("menu-open");
});
