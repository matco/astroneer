import '@matco/basic-tools/extension.js';
import '@matco/basic-tools/dom_extension.js';

import {Forms} from './tools/forms.js';
import {MOBILE_MEDIA} from './mobile.js';
import {Utils} from './utils.js';
import {Router} from './router.js';
import {Database, ITEM_TYPE} from './database.js';
import {Resources} from './resources.js';
import {Objects} from './objects.js';
import {Planets} from './planets.js';
import {Items} from './items.js';

const REGEXP = /{{ *([a-z_-]+) *}}/gi;
let items;

function normalize_text(text) {
	return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function provide_item(input) {
	const text = normalize_text(input);
	const matching_items = [];
	let other_items = [];
	//find items that start with the input
	items.forEach(i => i.tag.startsWith(text) ? matching_items.push(i) : other_items.push(i));
	//return these items if there is enough choice
	if(matching_items.length > 5) {
		return matching_items.slice(0, 10).map(i => i.item);
	}
	//update rest items
	const rest_items = other_items.slice();
	other_items = [];
	//find items that include with the input
	rest_items.forEach(i => i.tag.includes(text) ? matching_items.push(i) : other_items.push(i));
	//return these items if there is enough choice
	if(matching_items.length > 5) {
		return matching_items.slice(0, 10).map(i => i.item);
	}
	//fuzzy search
	other_items.forEach(i => i.distance = levenshtein_distance(i.label, text));
	const fuzzy_items = other_items.filter(i => i.distance < 4);
	fuzzy_items.sort((i1, i2) => i1.distance - i2.distance);
	return [...matching_items, ...fuzzy_items].slice(0, 10).map(i => i.item);
}

function draw_item(item, value) {
	//retrieve item label
	const label = item.name || Utils.Localize(item.label);
	const item_li = document.createFullElement('li', {'data-value': label});
	item_li.appendChild(document.createFullElement('img', {src: Database.GetItemImage(item)}));
	//prepare regexp to highlight part of ingredient matching the search
	const regexp = new RegExp(`(${value})`, 'gi');
	const item_label = document.createElement('span');
	item_label.innerHTML = label.replace(regexp, '<span class="highlight">$1</span>');
	item_li.appendChild(item_label);
	return item_li;
}

function select_item(item) {
	Router.Reset();
	switch(item.type) {
		case ITEM_TYPE.RESOURCE: {
			Router.SelectResource(item);
			break;
		}
		case ITEM_TYPE.OBJECT: {
			Router.SelectObject(item);
			break;
		}
		case ITEM_TYPE.PLANET: {
			Router.SelectPlanet(item);
			break;
		}
		default: alert('No match for your search!');
	}
}

function levenshtein_distance(source, target) {
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
		await Utils.Init();
		await Database.Init();

		//localize labels
		document.querySelectorAll('*').forEach(node => {
			if(node.textContent.startsWith('{{') && node.textContent.endsWith('}}')) {
				node.textContent = node.textContent.replace(REGEXP, (_, part) => Utils.GetLabel(part));
			}
			const attributes = node.attributes;
			for(let i = 0; i < attributes.length; i++) {
				const attribute = attributes[i];
				if(attribute.value.startsWith('{{') && attribute.value.endsWith('}}')) {
					attribute.value = attribute.value.replace(REGEXP, (_, part) => Utils.GetLabel(part));
				}
			}
		});

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

		//retrieve all items and prepare them for a search
		items = Database.GetAll().map(i => {return {item: i, label: i.name || Utils.Localize(i.label), distance: undefined, tag: undefined};});
		items.forEach(i => i.tag = normalize_text(i.label));

		Forms.Autocomplete(
			document.getElementById('item')['search'],
			document.getElementById('items'),
			provide_item,
			draw_item,
			select_item
		);

		document.getElementById('item').addEventListener(
			'submit',
			function(event) {
				//the form is submitted and the autocomplete has not been used
				event.stop();
				const value = this['search'].value;
				//trying to find the item using the input value
				const enhanced_item = items.find(i => i.label === value) || items.find(i => i.tag === normalize_text(value));
				if(enhanced_item) {
					select_item(enhanced_item.item);
				}
			}
		);

		Database.GetResources()
			.sort(Items.Sort)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('home_resources'));
		Database.GetObjects()
			.sort(Items.Sort)
			.map(Objects.DrawForList)
			.forEach(Node.prototype.appendChild, document.getElementById('home_objects'));
		Database.GetPlanets()
			.sort(Items.Sort)
			.map(Planets.DrawForList)
			.forEach(Node.prototype.appendChild, document.getElementById('home_planets'));


		//restore selected item
		Router.Reload();
		MOBILE_MEDIA.addEventListener('change', () => Router.Reload());

		//enable interaction
		document.body.classList.remove('disabled');
	}
);
