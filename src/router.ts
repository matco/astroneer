import {Hash} from '@matco/basic-tools/hash.js';
import {Database} from './database';
import {Resources} from './resources';
import {Items} from './items';
import {Utils} from './utils';
import {Planets} from './planets';

const STATE_PREFIX = 'Astroneer Helper';

export const Router = {
	Reset: () => {
		document.getElementById('home').style.display = 'none';
		document.querySelectorAll('section').forEach(i => i.style.display = 'none');
		document.getElementById('thing')['search'].value = '';
	},
	GetURL: thing => `#${thing.type}=${thing.id}`,
	Reload: () => {
		const event = new UIEvent('hashchange', {bubbles: true, cancelable: true, detail: 1});
		window.dispatchEvent(event);
	},
	DisplayHome: () => {
		document.getElementById('home').style.display = 'block';
	},
	SelectResource: resource => {
		Resources.Open(resource);

		//generate state
		const state = {resource: resource.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Utils.Localize(resource.label)}`, hash);
		}
	},
	SelectItem: item => {
		Items.Open(item);

		//generate state
		const state = {item: item.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Utils.Localize(item.label)}`, hash);
		}
	},
	SelectPlanet: planet => {
		Planets.Open(planet);

		//generate state
		const state = {planet: planet.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${planet.name}`, hash);
		}
	}
};

window.addEventListener(
	'hashchange',
	function() {
		Router.Reset();
		//retrieve data encoded in hash
		const data = Hash.Decode(location.hash);
		if(data.hasOwnProperty('resource')) {
			//retrieve ingredient
			const resource = Database.GetResource(data.resource);
			Router.SelectResource(resource);
		}
		else if(data.hasOwnProperty('item')) {
			//retrieve ingredient
			const printer = Database.GetItem(data.item);
			Router.SelectItem(printer);
		}
		else if(data.hasOwnProperty('planet')) {
			//retrieve ingredient
			const planet = Database.GetPlanet(data.planet);
			Router.SelectPlanet(planet);
		}
		else {
			Router.DisplayHome();
		}
	}
);
