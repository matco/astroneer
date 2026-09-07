import {Settings} from './model/settings';

export const Configuration = {
	Init: () => {
		const settings_form = document.getElementById('settings') as HTMLFormElement;
		settings_form.addEventListener(
			'submit',
			event => {
				event.stop();
				const language = (settings_form.elements.namedItem('language') as HTMLSelectElement).value;
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
		const settings_form = document.getElementById('settings') as HTMLFormElement;
		(settings_form.elements.namedItem('language') as HTMLSelectElement).value = settings ? settings.language : '';
		settings_form.style.display = 'block';
	}
};
