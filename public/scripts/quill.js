const quill = new Quill("#editor", {
  theme: "snow"
})

const form = document.querySelector('form');
  // Append Quill content before submitting
form.addEventListener('formdata', (event) => {
  event.formData.append('description', quill.getSemanticHTML());
});

//document.getElementById('test').addEventListener('click', ()=>{
//  console.log(quill.getSemanticHTML())
//})

document.querySelector("#editor>.ql-editor").innerHTML=(document.getElementById('description').value)
