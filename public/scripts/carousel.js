const slideshow = document.querySelector('.carousel');
const slides = slideshow.querySelectorAll('.carousel>img');
let currentSlide = 0;

function showSlide(index) {
	slides.forEach((slide, i) => {
		if (i === index) {
			slide.classList.add('active');
		} else {
			slide.classList.remove('active');
		}
	});
}

function nextSlide() {
	currentSlide = (currentSlide + 1) % slides.length;
	showSlide(currentSlide);
}

setInterval(nextSlide, 3000);
