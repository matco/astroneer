import {Database} from './database';
import {Resources} from './resources';
import {Router} from './router';
import {Utils} from './utils';

export const Planets = {
	DrawImage: planet => {
		return document.createFullElement('img', {src: Database.GetThingImage(planet)});
	},
	Draw: planet => {
		const link = document.createFullElement('a', {class: 'thing', href: Router.GetURL(planet)});
		link.appendChild(Planets.DrawImage(planet));
		link.appendChild(document.createTextNode(planet.name));
		return link;
	},
	DrawForList: planet => {
		const element = document.createFullElement('li');
		element.appendChild(Planets.Draw(planet));
		return element;
	},
	Open: planet => {
		//update title
		const planet_name = document.getElementById('planet_name');
		planet_name.empty();
		planet_name.appendChild(document.createFullElement('button', {title: Utils.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		planet_name.appendChild(Planets.DrawImage(planet));
		planet_name.appendChild(document.createTextNode(planet.name));

		planet.primary_resources
			.map(Database.GetResource)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_primary_resources').empty());
		planet.secondary_resources
			.map(Database.GetResource)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_secondary_resources').empty());
		planet.at_core
			.map(Database.GetResource)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_at_core').empty());
		planet.atmospheric_resources
			.map(Database.GetResource)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_atmospheric_resources').empty());
		document.getElementById('planet').style.display = 'block';
	}
};
