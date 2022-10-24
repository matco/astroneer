import {Database} from './database';
import {Resources} from './resources';
import {Router} from './router';
import {Planet} from './types';
import {Labels} from './labels';
import {Utilities} from './draw';


export const Planets = {
	DrawImage: Utilities.DrawImage,
	Draw: Utilities.Draw,
	DrawWiki: Utilities.DrawWiki,
	DrawForList: (planet: Planet): HTMLLIElement => {
		const element = document.createFullElement('li');
		element.appendChild(Planets.Draw(planet));
		element.appendChild(Planets.DrawWiki(planet));
		return element;
	},
	Open: (planet: Planet) => {
		//update title
		const planet_name = document.getElementById('planet_name');
		planet_name.empty();
		planet_name.appendChild(document.createFullElement('button', {title: Labels.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
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
