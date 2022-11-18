import {Settings} from './types';

export const Configuration = {
	Init: () => {
		document.getElementById('settings').addEventListener(
			'submit',
			function(event) {
				event.stop();
				const language = (this['language'] as HTMLSelectElement).value;
				const settings: Settings = {language};
				localStorage.setObject('settings', settings);
				//reload the page to refresh the label
				window.location.href = '#';
				window.location.reload();
			}
		);
	},
	Open: () => {
		const settings = localStorage.getObject('settings') as Settings;
		const settings_form = document.getElementById('settings');
		(settings_form['language'] as HTMLSelectElement).value = settings ? settings['language'] : '';
		settings_form.style.display = 'block';
	}
};
