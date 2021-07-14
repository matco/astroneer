import '@matco/basic-tools/extension.js';
import '@matco/basic-tools/dom_extension.js';

import {Forms} from './tools/forms.js';
import {MOBILE_MEDIA} from './mobile';
import {Labels} from './labels';
import {Router} from './router';
import {Database, ThingType} from './database';
import {Resources} from './resources';
import {Items} from './items';
import {Planets} from './planets';
import {Things} from './things';
import {Thing} from './types';
import {Settings} from './settings';

let things;

function normalize_text(text: string): string {
	return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function provide_thing(input: string): Thing[] {
	const text = normalize_text(input);
	const matching_things = [];
	let other_things = [];
	//find things that start with the input
	things.forEach(t => t.tag.startsWith(text) ? matching_things.push(t) : other_things.push(t));
	//return these things if there is enough choice
	if(matching_things.length > 5) {
		return matching_things.slice(0, 10).map(t => t.thing);
	}
	//update rest things
	const rest_things = other_things.slice();
	other_things = [];
	//find things that include with the input
	rest_things.forEach(t => t.tag.includes(text) ? matching_things.push(t) : other_things.push(t));
	//return these things if there is enough choice
	if(matching_things.length > 5) {
		return matching_things.slice(0, 10).map(t => t.thing);
	}
	//fuzzy search
	other_things.forEach(t => t.distance = levenshtein_distance(t.label, text));
	const fuzzy_things = other_things.filter(t => t.distance < 4);
	fuzzy_things.sort((t1, t2) => t1.distance - t2.distance);
	return [...matching_things, ...fuzzy_things].slice(0, 10).map(t => t.thing);
}

function draw_thing(thing: Thing, value: string): HTMLLIElement {
	//retrieve thing label
	const label = thing.type === ThingType.Planet ? thing.name : Labels.Localize(thing.label);
	const thing_li = document.createFullElement('li', {'data-value': label});
	thing_li.appendChild(document.createFullElement('img', {src: Database.GetThingImage(thing)}));
	//prepare regexp to highlight part of ingredient matching the search
	const regexp = new RegExp(`(${value})`, 'gi');
	const thing_label = document.createElement('span');
	thing_label.innerHTML = label.replace(regexp, '<span class="highlight">$1</span>');
	thing_li.appendChild(thing_label);
	return thing_li;
}

function select_thing(thing: Thing) {
	Router.Reset();
	switch(thing.type) {
		case ThingType.Resource: {
			Router.SelectResource(thing);
			break;
		}
		case ThingType.Item: {
			Router.SelectItem(thing);
			break;
		}
		case ThingType.Planet: {
			Router.SelectPlanet(thing);
			break;
		}
	}
}

function levenshtein_distance(source: string, target: string): number {
	if(source.length === 0) {
		return target.length;
	}
	if(target.length === 0) {
		return source.length;
	}
	const matrix = [];
	for(let i = 0; i <= target.length; i++) {
		matrix[i] = [i];
	}
	for(let i = 0; i <= source.length; i++) {
		matrix[0][i] = i;
	}

	for(let i = 1; i <= target.length; i++) {
		for(let j = 1; j <= source.length; j++) {
			const cost = target.charAt(i - 1) === source.charAt(j - 1) ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j - 1] + cost,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j] + 1
			);
		}
	}
	return matrix[target.length][source.length];
}

window.addEventListener(
	'load',
	async function() {
		await Labels.Init();
		await Database.Init();
		Settings.Init();

		Labels.LocalizeLabels();

		//register service workers used to cache application
		const https = window.location.protocol === 'https:';
		//remove "index.html" from path if necessary
		//enable cache worker over HTTPS (the browser will allow a service worker without HTTPS anyway) and in production mode
		if(https) {
			navigator.serviceWorker.register('/service-worker.js')
				.then(registration => {
					if(!registration.active) {
						console.info(`Cache service worker registered successfully with scope ${registration.scope}`);
					}
				}).catch(error => {
					console.error(`Cache service worker registration failed: ${error.message}`);
				});
		}

		//retrieve all things and prepare them for a search
		things = Database.GetAll().map(t => {return {thing: t, label: t.type === ThingType.Planet ? t.name : Labels.Localize(t.label), distance: undefined, tag: undefined};});
		things.forEach(t => t.tag = normalize_text(t.label));

		Forms.Autocomplete(
			document.getElementById('thing')['search'],
			document.getElementById('things'),
			provide_thing,
			draw_thing,
			select_thing
		);

		document.getElementById('thing').addEventListener(
			'submit',
			function(event) {
				//the form is submitted and the autocomplete has not been used
				event.stop();
				const value = this['search'].value;
				//trying to find the thing using the input value
				const enhanced_thing = things.find(t => t.label === value) || things.find(t => t.tag === normalize_text(value));
				if(enhanced_thing) {
					select_thing(enhanced_thing.thing);
				}
			}
		);

		//restore selected state
		Router.Reload();
		MOBILE_MEDIA.addEventListener('change', () => Router.Reload());

		//enable interaction
		document.body.classList.remove('disabled');
	}
);
