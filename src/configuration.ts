export const Configuration = {
	Init: () => {
		document.getElementById('settings').addEventListener(
			'submit',
			function(event) {
				event.stop();
				const settings = {language: this['language'].value};
				localStorage.setObject('settings', settings);
				//reload the page to refresh the label
				window.location.href = '#';
				window.location.reload();
			}
		);
	},
	Open: () => {
		const settings = localStorage.getObject('settings');
		const settings_form = document.getElementById('settings');
		settings_form['language'].value = settings ? settings['language'] : '';
		settings_form.style.display = 'block';
	}
};
