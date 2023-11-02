const form = document.querySelector('form');
form.onsubmit = function () {
	var about = document.querySelector('input[name=descr]');
	about.value = quill.root.innerHTML;
};
var quill = new Quill('#editor', {
	theme: 'snow'
});