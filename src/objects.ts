import {Utils} from './utils';
import {Resources} from './resources';
import {Database} from './database';
import {Router} from './router';
import {Items} from './items';

export const Objects = {
	DrawImage: object => {
		return document.createFullElement('img', {src: Database.GetItemImage(object)});
	},
	Draw: object => {
		const link = document.createFullElement('a', {class: 'item', href: Router.GetURL(object)});
		link.appendChild(Objects.DrawImage(object));
		link.appendChild(document.createTextNode(Utils.Localize(object.label)));
		return link;
	},
	DrawForList: object => {
		const element = document.createFullElement('li');
		element.appendChild(Objects.Draw(object));
		return element;
	},
	Open: object => {
		//use display block to draw the SVG properly but hide the container while it is not fully loaded
		document.getElementById('object').style.display = 'block';
		document.getElementById('object').style.visibility = 'hidden';

		//update title
		const object_name = document.getElementById('object_name');
		object_name.empty();
		object_name.appendChild(document.createFullElement('button', {title: Utils.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		object_name.appendChild(Objects.DrawImage(object));
		object_name.appendChild(document.createTextNode(Utils.Localize(object.label)));

		//draw resource tree after the container is displayed
		if(object.printed) {
			const object_tree = /**@type {SVGElement}*/ (/**@type {unknown}*/ (document.getElementById('object_tree')));
			Items.DrawResourceTree(object, object_tree);
		}

		const object_is_printer = document.getElementById('object_is_printer');
		object_is_printer.style.display = 'none';
		if(object.printer) {
			Database.GetObjects()
				.filter(o => o.printed === object.id)
				.sort((o1, o2) => Utils.Localize(o1.label).compareTo(Utils.Localize(o2.label)))
				.map(Objects.DrawForList)
				.forEach(Node.prototype.appendChild, document.getElementById('object_printer_objects').empty());
			object_is_printer.style.display = 'block';
		}

		const object_is_crafter = document.getElementById('object_is_crafter');
		object_is_crafter.style.display = 'none';
		if(object.crafter) {
			Database.GetResources()
				.filter(o => o.crafted === object.id)
				.map(r => Resources.DrawForList(r))
				.forEach(Node.prototype.appendChild, document.getElementById('object_craft_resources').empty());
			object_is_crafter.style.display = 'block';
		}

		document.getElementById('object').style.visibility = '';
	}
};
