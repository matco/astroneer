import {Labels} from './labels';
import {Resources} from './resources';
import {Database} from './database';
import {Router} from './router';
import {Things} from './things';
import {Item} from './types';
import {Utilities} from './draw';

export const Items = {
	DrawImage: Utilities.DrawImage,
	Draw: Utilities.Draw,
	DrawWiki: Utilities.DrawWiki,
	DrawForList: (item: Item): HTMLLIElement => {
		const element = document.createFullElement('li');
		element.appendChild(Items.Draw(item));
		return element;
	},
	Open: (item: Item) => {
		const item_tree = <SVGElement><any>document.getElementById('item_tree');

		//use display block to draw the SVG properly but hide the container while it is not fully loaded
		document.getElementById('item').style.display = 'block';
		document.getElementById('item').style.visibility = 'hidden';
		item_tree.style.display = 'block';

		//update title
		const item_name = document.getElementById('item_name');
		item_name.empty();
		item_name.appendChild(document.createFullElement('button', {title: Labels.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		item_name.appendChild(Items.DrawImage(item));
		item_name.appendChild(document.createTextNode(Labels.Localize(item.label)));

		if(item.printed) {
			//draw resource tree after the container is displayed
			item_tree.style.display = 'block';
			Things.DrawResourceTree(item, item_tree);
		}
		else {
			item_tree.style.display = 'none';
		}

		const item_is_printer = document.getElementById('item_is_printer');
		item_is_printer.style.display = 'none';
		if(item.printer) {
			Database.GetItems()
				.filter(i => i.printed === item.id)
				.sort((i1, i2) => Labels.Localize(i1.label).compareTo(Labels.Localize(i2.label)))
				.map(Items.DrawForList)
				.forEach(Node.prototype.appendChild, document.getElementById('item_printer_items').empty());
			item_is_printer.style.display = 'block';
		}

		const item_is_crafter = document.getElementById('item_is_crafter');
		item_is_crafter.style.display = 'none';
		if(item.crafter) {
			Database.GetResources()
				.filter(r => r.crafted === item.id)
				.map(r => Resources.DrawForList(r))
				.forEach(Node.prototype.appendChild, document.getElementById('item_craft_resources').empty());
			item_is_crafter.style.display = 'block';
		}

		document.getElementById('item').style.visibility = '';
	}
};
