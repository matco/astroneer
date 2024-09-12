import {Repository} from './repository';
import {Planet} from './model/planet';
import {Localization} from './localization';
import {Things} from './things';

export const Planets = {
	Open: (planet: Planet) => {
		//update title
		const planet_name = document.getElementById('planet_name');
		planet_name.empty();
		planet_name.appendChild(document.createFullElement('button', {title: Localization.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		planet_name.appendChild(Things.DrawImage(planet));
		planet_name.appendChild(document.createTextNode(planet.name));

		planet.primary_resources
			.map(Repository.GetResource)
			.map(r => Things.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_primary_resources').empty());
		planet.secondary_resources
			.map(Repository.GetResource)
			.map(r => Things.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_secondary_resources').empty());
		planet.at_core
			.map(Repository.GetResource)
			.map(r => Things.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_at_core').empty());
		planet.atmospheric_resources
			.map(Repository.GetResource)
			.map(r => Things.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('planet_atmospheric_resources').empty());
		document.getElementById('planet').style.display = 'block';
	}
};
