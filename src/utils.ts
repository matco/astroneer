const DEFAULT_LANGUAGE = 'en-US';
const REGEXP = /{{ *([a-z_-]+) *}}/gi;

//manage navigator language hazardously
const language = navigator.language.includes('fr') ? 'fr-FR' : 'us-US';

let labels;

export const Utils = {
	Init: async () => {
		const response = await fetch('/labels.json');
		labels = await response.json();
	},
	Localize: (label: {[key: string]: string}): string => label[language] || label[DEFAULT_LANGUAGE],
	GetLabel: (label_id: string): string => {
		//check that label exist
		const label = labels[label_id];
		if(!label) {
			throw new Error(`No label with id ${label_id}`);
		}
		return Utils.Localize(label);
	},
	LocalizeLabels: () => {
		//replace placeholders in text nodes
		//do not use querySelectorAll because this function is not able to find text nodes
		//using querySelectorAll(*) and replacing the textContent on the resulting nodes does not work properly
		//this is because textContent returns the text in the node and in its descendants
		//see https://stackoverflow.com/questions/2579666/getelementsbytagname-equivalent-for-textnodes for the best solution to find text nodes in the DOM
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		let node;
		while(node = walker.nextNode()) {
			node.nodeValue = node.nodeValue.replaceAll(REGEXP, (_, part) => Utils.GetLabel(part));
		}
		//replace placeholders in attributes
		document.querySelectorAll('*').forEach(node => {
			const attributes = node.attributes;
			for(let i = 0; i < attributes.length; i++) {
				const attribute = attributes[i];
				if(attribute.value.startsWith('{{') && attribute.value.endsWith('}}')) {
					attribute.value = attribute.value.replace(REGEXP, (_, part) => Utils.GetLabel(part));
				}
			}
		});
	}
};
