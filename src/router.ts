import {Hash} from '@matco/basic-tools/hash.js';
import {Repository} from './repository';
import {Resources} from './resources';
import {Items} from './items';
import {Localization} from './localization';
import {Planets} from './planets';
import {Thing} from './model/thing';
import {Resource} from './model/resource';
import {Item} from './model/item';
import {Planet} from './model/planet';
import {Configuration} from './configuration';
import {Home} from './home';

const STATE_PREFIX = 'Astroneer Helper';

export const Router = {
	Reset: () => {
		document.getElementById('home').style.display = 'none';
		document.getElementById('settings').style.display = 'none';
		document.querySelectorAll('section').forEach((s: HTMLElement) => s.style.display = 'none');
		const thing_form = document.getElementById('thing') as HTMLFormElement;
		thing_form.style.display = 'none';
		(thing_form.elements.namedItem('search') as HTMLInputElement).value = '';
		window.scrollTo(0, 0);
	},
	GetURL: (thing: Thing): string => `#${thing.type}=${thing.id}`,
	Reload: () => {
		Router.Route();
	},
	Route: () => {
		Router.Reset();
		//retrieve data encoded in hash
		if(location.hash === '#settings') {
			Router.DisplaySettings();
			return;
		}
		//an empty hash means the home page
		if(!location.hash) {
			Router.DisplayHome();
			return;
		}
		const data = Hash.Decode(location.hash) as Record<string, string>;
		if(Object.hasOwn(data, 'resource')) {
			//retrieve resource
			const resource = Repository.GetResource(data['resource']);
			Router.SelectResource(resource);
			return;
		}
		if(Object.hasOwn(data, 'item')) {
			//retrieve item
			const item = Repository.GetItem(data['item']);
			Router.SelectItem(item);
			return;
		}
		if(Object.hasOwn(data, 'planet')) {
			//retrieve planet
			const planet = Repository.GetPlanet(data['planet']);
			Router.SelectPlanet(planet);
			return;
		}
		Router.DisplayHome();
	},
	DisplayHome: () => {
		document.getElementById('thing').style.display = 'block';
		Home.Open();
	},
	DisplaySettings: () => {
		Configuration.Open();
		//push state if necessary
		if(location.hash !== '#settings') {
			history.pushState(undefined, STATE_PREFIX, '#settings');
		}
	},
	SelectResource: (resource: Resource) => {
		document.getElementById('thing').style.display = 'block';
		Resources.Open(resource);

		//generate state
		const state = {resource: resource.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Localization.Localize(resource.label)}`, hash);
		}
	},
	SelectItem: (item: Item) => {
		document.getElementById('thing').style.display = 'block';
		Items.Open(item);

		//generate state
		const state = {item: item.id};
		const hash = Hash.Encode(state);
		//push state if necessary
		if(location.hash !== hash) {
			history.pushState(state, `${STATE_PREFIX} - ${Localization.Localize(item.label)}`, hash);
		}
	},
	SelectPlanet: (planet: Planet) => {
		document.getElementById('thing').style.display = 'block';
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

//route on hash change and on history navigation
window.addEventListener('hashchange', () => Router.Route());
window.addEventListener('popstate', () => Router.Route());
