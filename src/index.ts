import '@matco/basic-tools/extension.js';
import '@matco/basic-tools/dom_extension.js';

import {Forms} from './tools/forms.js';
import {MOBILE_MEDIA} from './mobile';
import {Localization} from './localization';
import {Router} from './router';
import {Database, ThingType} from './database';
import {Thing} from './types';
import {Configuration} from './configuration';
import {Things} from './things';

let things;

function normalize_text(text: string): string {
	return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function provide_thing(search: string): Thing[] {
	const inputs = normalize_text(search).split(' ');
	//reset scores from previous searches
	things.forEach(t => t.score = 0);
	const matching_things = [];
	let other_things = [];
	//find things that have a tag that starts with one of the inputs
	for(const thing of things) {
		for(const input of inputs) {
			if(thing.tags.some(t => t.startsWith(input))) {
				//sharing the same prefix increases the score by 100
				thing.score += 100;
			}
		}
		thing.score > 0 ? matching_things.push(thing) : other_things.push(thing);
	}
	//continue searching if there is not enough options
	if(matching_things.length < 5) {
		//update rest things
		const rest_things = other_things.slice();
		other_things = [];
		//find things that have a tag that includes one of the inputs
		for(const thing of rest_things) {
			for(const input of inputs) {
				if(thing.tags.some(t => t.includes(input))) {
					//sharing some characters increases the score by 10
					thing.score += 10;
				}
			}
			thing.score > 0 ? matching_things.push(thing) : other_things.push(thing);
		}
		//continue searching if here is not enough options and user's search is more than 3 characters
		const word_inputs = inputs.filter(i => i.length > 3);
		if(matching_things.length < 5 && word_inputs.length > 0) {
			//fuzzy search
			for(const thing of other_things) {
				let min_distance = 10;
				for(const input of word_inputs) {
					min_distance = Math.min(...thing.tags.map(t => levenshtein_distance(t.substring(0, input.length), input)));
					//continue calculating the distance with other inputs to find the minimal distance
				}
				if(min_distance < 3) {
					thing.score += 10 - min_distance;
					matching_things.push(thing);
				}
			}
		}
	}
	//sort matching things according to their score
	matching_things.sort((t1, t2) => t2.score - t1.score);
	return matching_things.slice(0, 10).map(t => t.thing);
}

function draw_thing(thing: Thing, value: string): HTMLLIElement {
	//retrieve thing label
	const label = thing.type === ThingType.Planet ? thing.name : Localization.Localize(thing.label);
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

async function initialize() {
	await Localization.Init();
	await Database.Init();
	Configuration.Init();

	Localization.LocalizeLabels();

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

	//retrieve all things and prepare them for a search, building a list of tags for each thing
	things = Database.GetAll().map(thing => {
		const label = Things.GetLabel(thing);
		return {
			thing,
			label,
			score: 0,
			//keep only words with more than 2 characters
			tags: normalize_text(label).split(' ').filter(t => t.length > 2)
		};
	});

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
			const enhanced_thing = things.find(t => t.label === value) || things.find(t => t.tags.some(t => t === normalize_text(value)));
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

window.addEventListener(
	'load',
	function() {
		initialize().catch(() => console.error('Unable to initialize application'));
	}
);
