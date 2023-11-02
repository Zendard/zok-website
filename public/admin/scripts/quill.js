const form = document.querySelector('form');
const descr = document.querySelector('input[name=descr]');

document.querySelector('#editor').innerHTML=descr.value

const quill = new Quill('#editor', {
	theme: 'snow'
});


form.onsubmit = function () {
	descr.value = quill.root.innerHTML;
};