import {Hash} from '@matco/basic-tools/hash.js';
import {Database} from './database';
import {Resources} from './resources';
import {Items} from './items';
import {Localization} from './localization';
import {Planets} from './planets';
import {Item, Planet, Resource, Thing} from './types';
import {Configuration} from './configuration';
import {Home} from './home';

const STATE_PREFIX = 'Astroneer Helper';
const WIKI_URI = 'https://astroneer.fandom.com/wiki/';

export const Router = {
	Reset: () => {
		document.getElementById('home').style.display = 'none';
		document.getElementById('settings').style.display = 'none';
		document.querySelectorAll('section').forEach((s: HTMLElement) => s.style.display = 'none');
		document.getElementById('thing').style.display = 'none';
		(document.getElementById('thing')['search'] as HTMLInputElement).value = '';
		window.scrollTo(0, 0);
	},
	GetURL: (thing: Thing): string => `#${thing.type}=${thing.id}`,
	GetWikiUrl: (thing: Thing): string => {
		// wiki url structure requires every other word to start capitalized
		// "some id" will be used as url slug and turned into "Some_Id"
		const id = thing.id.split("_").map((slug) => {
			if(["xl", "exo", "rtg", "vtol"].includes(slug)) {
				slug = slug.toUpperCase()
			}
			return slug.charAt(0).toUpperCase() + slug.slice(1)
		}).join("_");
		return `${WIKI_URI}${id}`;
	},
	Reload: () => {
		const event = new UIEvent('hashchange', {bubbles: true, cancelable: true, detail: 1});
		window.dispatchEvent(event);
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

window.addEventListener(
	'hashchange',
	function() {
		Router.Reset();
		//retrieve data encoded in hash
		if(location.hash === '#settings') {
			Router.DisplaySettings();
			return;
		}
		const data = Hash.Decode(location.hash) as {[key: string]: string};
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
