import {Hash} from '@matco/basic-tools/hash.js';
import {Database} from './database';
import {Resources} from './resources';
import {Items} from './items';
import {Labels} from './labels';
import {Planets} from './planets';
import {Item, Planet, Resource, Thing} from './types';
import {Home} from './home';

const STATE_PREFIX = 'Astroneer Helper';

export const Router = {
	Reset: () => {
		document.getElementById('home').style.display = 'none';
		document.querySelectorAll('section').forEach(i => i.style.display = 'none');
		document.getElementById('thing')['search'].value = '';
	},
	GetURL: (thing: Thing): string => `#${thing.type}=${thing.id}`,
	Reload: () => {
		const event = new UIEvent('hashchange', {bubbles: true, cancelable: true, detail: 1});
		window.dispatchEvent(event);
	},
	DisplayHome: () => {
		Home.Open();
	},
	SelectResource: (resource: Resource) => {
		Resources.Open(resource);

		//generate state
		const state = {resource: resource.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Labels.Localize(resource.label)}`, hash);
		}
	},
	SelectItem: (item: Item) => {
		Items.Open(item);

		//generate state
		const state = {item: item.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Labels.Localize(item.label)}`, hash);
		}
	},
	SelectPlanet: (planet: Planet) => {
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
			return;
		}
		if(data.hasOwnProperty('item')) {
			//retrieve ingredient
			const printer = Database.GetItem(data.item);
			Router.SelectItem(printer);
			return;
		}
		if(data.hasOwnProperty('planet')) {
			//retrieve ingredient
			const planet = Database.GetPlanet(data.planet);
			Router.SelectPlanet(planet);
			return;
		}
		Router.DisplayHome();
	}
);
