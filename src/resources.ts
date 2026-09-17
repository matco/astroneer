import {Repository} from './repository';
import {Things} from './things';
import {Localization} from './localization';
import {Resource} from './model/resource';
import {QuickView} from './quick_view';

export const Resources = {
	Open: (resource: Resource) => {
		//use display block to draw the SVG properly but hide the container while it is not fully loaded
		document.getElementById('resource').style.display = 'block';
		document.getElementById('resource').style.visibility = 'hidden';

		//reset ui
		document.getElementById('resource_crafted').style.display = 'none';
		document.getElementById('resource_in_items').style.display = 'none';
		document.getElementById('resource_in_crafted_resources').style.display = 'none';

		//update title
		const resource_name = document.getElementById('resource_name');
		resource_name.empty();
		resource_name.appendChild(document.createFullElement('button', {title: Localization.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		resource_name.appendChild(Things.DrawImage(resource));
		resource_name.appendChild(document.createTextNode(Localization.Localize(resource.label)));

		document.getElementById('resource_summary').replaceChildren(QuickView.DrawResourceSummary(resource, true));

		if(resource.crafted && resource.dependencies) {
			document.getElementById('resource_crafted').style.display = 'block';
			const resource_tree = document.getElementById('resource_tree') as unknown as SVGElement;
			Things.DrawResourceTree(resource, resource_tree);
		}

		//items
		const items = Repository.GetItems().filter(i => i.dependencies?.some(d => d.id === resource.id));
		if(!items.isEmpty()) {
			items
				.map(i => Things.DrawForList(i))
				.forEach(Node.prototype.appendChild, document.getElementById('resource_items').empty());
			document.getElementById('resource_in_items').style.display = 'block';
		}

		//crafted resources
		const crafted_resources = Repository.GetResources().filter(r => r.dependencies?.some(d => d.id === resource.id));
		if(!crafted_resources.isEmpty()) {
			crafted_resources
				.map(r => Things.DrawForList(r))
				.forEach(Node.prototype.appendChild, document.getElementById('resource_crafted_resources').empty());
			document.getElementById('resource_in_crafted_resources').style.display = 'block';
		}

		document.getElementById('resource').style.visibility = '';
	}
};
