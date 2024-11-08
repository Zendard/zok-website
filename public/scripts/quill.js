const quill = new Quill("#editor", {
  theme: "snow"
})

const form = document.querySelector('form');
form.addEventListener('formdata', (event) => {
  // Append Quill content before submitting
  event.formData.append('description', quill.getSemanticHTML());
});

document.getElementById('test').addEventListener('click', ()=>{
  console.log(quill.getSemanticHTML())
})
