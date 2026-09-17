import {Localization} from './localization';
import {Repository} from './repository';
import {Things} from './things';
import {Item} from './model/item';
import {QuickView} from './quick_view';

export const Items = {
	Open: (item: Item) => {
		const item_tree = document.getElementById('item_tree') as unknown as SVGElement;

		//use display block to draw the SVG properly but hide the container while it is not fully loaded
		document.getElementById('item').style.display = 'block';
		document.getElementById('item').style.visibility = 'hidden';
		item_tree.style.display = 'block';

		//update title
		const item_name = document.getElementById('item_name');
		item_name.empty();
		item_name.appendChild(document.createFullElement('button', {title: Localization.GetLabel('go_back')}, '←', {click: () => window.history.back()}));
		item_name.appendChild(Things.DrawImage(item));
		item_name.appendChild(document.createTextNode(Localization.Localize(item.label)));

		const item_meta = document.getElementById('item_meta');
		item_meta.textContent = QuickView.GetItemTierLabel(item);
		const item_description = document.getElementById('item_description');
		item_description.textContent = QuickView.GetItemDescription(item);
		(document.getElementById('item_wiki_source') as HTMLAnchorElement).href = QuickView.GetItemWikiURL(item);

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
			Repository.GetItems()
				.filter(i => i.printed === item.id)
				.sort((i1, i2) => Localization.Localize(i1.label).compareTo(Localization.Localize(i2.label)))
				.map(i => Things.DrawForList(i))
				.forEach(Node.prototype.appendChild, document.getElementById('item_printer_items').empty());
			item_is_printer.style.display = 'block';
		}

		const item_is_crafter = document.getElementById('item_is_crafter');
		item_is_crafter.style.display = 'none';
		if(item.crafter) {
			Repository.GetResources()
				.filter(r => r.crafted === item.id)
				.map(r => Things.DrawForList(r))
				.forEach(Node.prototype.appendChild, document.getElementById('item_craft_resources').empty());
			item_is_crafter.style.display = 'block';
		}

		document.getElementById('item').style.visibility = '';
	}
};
