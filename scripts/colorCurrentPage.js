const buttonsList = document.getElementsByClassName("menu-button");
for (i = 0; i < buttonsList.length; i++) {
	if (buttonsList[i].getAttribute("href") == "." + window.location.pathname) {
		buttonsList[i].setAttribute(
			"style",
			"background-color:#46B1E1; color:white"
		);
	}
}
