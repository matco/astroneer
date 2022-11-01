import {Database} from './database';
import {Things} from './things';
import {Labels} from './labels';
import {Resource} from './types';
import {Utilities} from './draw';

export const Resources = {
	Open: (resource: Resource) => {
		//use display block to draw the SVG properly but hide the container while it is not fully loaded
		document.getElementById('resource').style.display = 'block';
		document.getElementById('resource').style.visibility = 'hidden';

		//reset ui
		document.getElementById('resource_natural').style.display = 'none';
		document.getElementById('resource_crafted').style.display = 'none';
		document.getElementById('resource_in_atmosphere').style.display = 'none';
		document.getElementById('resource_in_items').style.display = 'none';
		document.getElementById('resource_in_crafted_resources').style.display = 'none';

		//update title
		const resource_name = document.getElementById('resource_name');
		resource_name.empty();
		resource_name.appendChild(document.createFullElement('button', {title: Labels.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		resource_name.appendChild(Things.DrawImage(resource));
		resource_name.appendChild(document.createTextNode(Labels.Localize(resource.label)));

		if(!resource.crafted) {
			//primary planets
			const primary_planets = Database.GetPlanets().filter(p => p.primary_resources.includes(resource.id));
			if(!primary_planets.isEmpty()) {
				primary_planets
					.map(p => Things.DrawForList(p))
					.forEach(Node.prototype.appendChild, document.getElementById('resource_primary_planets').empty());
				document.getElementById('resource_in_primary_planets').style.display = 'block';
			}
			else {
				document.getElementById('resource_in_primary_planets').style.display = 'none';
			}
			//secondary planets
			const secondary_planets = Database.GetPlanets().filter(p => p.secondary_resources.includes(resource.id));
			if(!secondary_planets.isEmpty()) {
				secondary_planets
					.map(p => Things.DrawForList(p))
					.forEach(Node.prototype.appendChild, document.getElementById('resource_secondary_planets').empty());
				document.getElementById('resource_in_secondary_planets').style.display = 'block';
			}
			else {
				document.getElementById('resource_in_secondary_planets').style.display = 'none';
			}
			//at core planets
			const at_core_planets = Database.GetPlanets().filter(p => p.at_core.includes(resource.id));
			if(!at_core_planets.isEmpty()) {
				at_core_planets
					.map(p => Things.DrawForList(p))
					.forEach(Node.prototype.appendChild, document.getElementById('resource_at_core').empty());
				document.getElementById('resource_in_at_core').style.display = 'block';
			}
			else {
				document.getElementById('resource_in_at_core').style.display = 'none';
			}
			document.getElementById('resource_natural').style.display = 'block';
		}
		else {
			const resource_planets = document.getElementById('resource_planets');
			resource_planets.empty();
			//atmospheric resources are crafted but don't have any dependency
			if(resource.dependencies) {
				//set display block to draw the SVG properly
				document.getElementById('resource_crafted').style.display = 'block';
				const resource_tree = <SVGElement><any>document.getElementById('resource_tree');
				Things.DrawResourceTree(resource, resource_tree);
			}
			else {
				Database.GetPlanets()
					.filter(p => p.atmospheric_resources.includes(resource.id))
					.map(p => Things.DrawForList(p))
					.forEach(Node.prototype.appendChild, resource_planets);
				document.getElementById('resource_in_atmosphere').style.display = 'block';
			}
		}

		//items
		const items = Database.GetItems().filter(i => i.dependencies && i.dependencies.some(d => d.id === resource.id));
		if(!items.isEmpty()) {
			items
				.map(i => Things.DrawForList(i))
				.forEach(Node.prototype.appendChild, document.getElementById('resource_items').empty());
			document.getElementById('resource_in_items').style.display = 'block';
		}

		//crafted resources
		const crafted_resources = Database.GetResources().filter(r => r.dependencies && r.dependencies.some(d => d.id === resource.id));
		if(!crafted_resources.isEmpty()) {
			crafted_resources
				.map(r => Things.DrawForList(r))
				.forEach(Node.prototype.appendChild, document.getElementById('resource_crafted_resources').empty());
			document.getElementById('resource_in_crafted_resources').style.display = 'block';
		}

		document.getElementById('resource').style.visibility = '';
	}
};
