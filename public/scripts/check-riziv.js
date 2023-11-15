const rizivInput = document.querySelector('input[name=riziv]');

rizivInput.addEventListener('input', (e) => {
	if (rizivInput.value.length == 5 && e.inputType == 'insertText') {
		rizivInput.value = rizivInput.value + '-';
	}

	if (97 - ((5 + rizivInput.value.split('-')[0]) % 97) != rizivInput.value.split('-')[1]) {
		rizivInput.style.borderColor = 'red';
	} else {
		rizivInput.style.borderColor = 'green';
	}
}); 