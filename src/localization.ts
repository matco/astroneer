const LANGUAGES = ['en-US', 'fr-FR'];
const DEFAULT_LANGUAGE = LANGUAGES[0];
const REGEXP = /{{ *([a-z_-]+?) *}}/gi;

let selected_language;
let labels;

export const Localization = {
	Init: async () => {
		const response = await fetch('/labels.json');
		labels = await response.json();
		//retrieve language saved in settings
		const settings = localStorage.getObject('settings');
		if(settings && settings['language'] && LANGUAGES.includes(settings['language'])) {
			selected_language = settings['language'];
		}
		//manage navigator language hazardously
		else {
			selected_language = LANGUAGES.find(l => l.includes(navigator.language)) || DEFAULT_LANGUAGE;
		}
	},
	Localize: (label: {[key: string]: string}): string => label[selected_language] || label[DEFAULT_LANGUAGE],
	GetLabel: (label_id: string): string => {
		//check that label exist
		const label = labels[label_id];
		if(!label) {
			throw new Error(`No label with id ${label_id}`);
		}
		return Localization.Localize(label);
	},
	LocalizeLabels: () => {
		//replace placeholders in text nodes
		//do not use querySelectorAll because this function is not able to find text nodes
		//using querySelectorAll(*) and replacing the textContent on the resulting nodes does not work properly
		//this is because textContent returns the text in the node and in its descendants
		//see https://stackoverflow.com/questions/2579666/getelementsbytagname-equivalent-for-textnodes for the best solution to find text nodes in the DOM
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		let node;
		while((node = walker.nextNode()) !== null) {
			node.nodeValue = node.nodeValue.replaceAll(REGEXP, (_, part) => Localization.GetLabel(part));
		}
		//replace placeholders in attributes
		document.querySelectorAll('*').forEach(node => {
			const attributes = node.attributes;
			for(let i = 0; i < attributes.length; i++) {
				const attribute = attributes[i];
				if(attribute.value.startsWith('{{') && attribute.value.endsWith('}}')) {
					attribute.value = attribute.value.replace(REGEXP, (_, part) => Localization.GetLabel(part));
				}
			}
		});
	}
};
