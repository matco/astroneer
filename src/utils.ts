const DEFAULT_LANGUAGE = 'en-US';

//manage navigator language hazardously
const language = navigator.language.includes('fr') ? 'fr-FR' : 'us-US';

let labels;

export const Utils = {
	Init: async () => {
		const response = await fetch('/labels.json');
		labels = await response.json();
	},
	Localize: label => label[language] || label[DEFAULT_LANGUAGE],
	GetLabel: label_id => {
		//check that label exist
		const label = labels[label_id];
		if(!label) {
			throw new Error(`No label with id ${label_id}`);
		}
		return Utils.Localize(label);
	}
};
