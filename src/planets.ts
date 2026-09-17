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

		const common_resources = Repository.GetResources().filter(resource => resource.all_planets && !planet.at_core.includes(resource.id)).map(resource => resource.id);
		const groups = {common_resources, primary_resources: planet.primary_resources, secondary_resources: planet.secondary_resources, at_core: planet.at_core, atmospheric_resources: planet.atmospheric_resources};
		for(const [group, resources] of Object.entries(groups)) {
			const list = document.getElementById(`planet_${group}`);
			list.replaceChildren(...resources.map(Repository.GetResource).map(resource => Things.DrawForList(resource)));
			list.hidden = resources.length === 0;
			(list.previousElementSibling as HTMLElement).hidden = list.hidden;
		}
		document.getElementById('planet').style.display = 'block';
	}
};
