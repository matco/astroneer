import {SVG} from '@matco/basic-tools/svg.js';
import {Utils} from './utils';
import {Database} from './database';
import {Router} from './router';
import {MOBILE_MEDIA} from './mobile';

const DIMENSIONS = {
	item: undefined,
	module: undefined,
	x_margin: undefined,
	y_margin: undefined
};

function update_dimensions() {
	DIMENSIONS.item = MOBILE_MEDIA.matches ? 30 : 45;
	DIMENSIONS.module = DIMENSIONS.item / 2;
	DIMENSIONS.x_margin = DIMENSIONS.item;
	DIMENSIONS.y_margin = DIMENSIONS.item * (MOBILE_MEDIA.matches ? 3 : 2.5);
}

function get_level(item) {
	if(!item.dependencies) {
		return 0;
	}
	return item.dependencies
		.map(d => Database.GetResource(d.id))
		.reduce((value, resource) => Math.max(1 + get_level(resource), value), 0);
}

/**
 *
 * @param {*} item the item (resource of object) used to perform the calculation
 * @returns the number of natural resources required to build the item
 */
function get_natural_resources_number(item) {
	if(!item.dependencies) {
		return 1;
	}
	return item.dependencies
		.map(d => Database.GetResource(d.id))
		.map(get_natural_resources_number)
		.reduce((total, value) => total + value, 0);
}

/**
 *
 * @param {SVGElement} svg the SVG element where drawing will be made
 * @param {*} x the x position in the SVG
 * @param {*} y the y position in the SVG
 * @param {*} item the item (object or resource) to draw
 * @param {*} quantity
 * Pay attention to the coordinates:
 * x is important because it is relative to the previous item
 * y is a useless parameter (it has been kept because it could be used for an alternative representation)
 * the y-axis coordinate is absolute and is calculated according to the item level
 */
function draw_resource_tree(svg, x, y, item, quantity?) {
	//create a group at the item position
	const group = SVG.Group({transform: `translate(${x},${y + DIMENSIONS.item / 2})`});
	svg.appendChild(group);
	//dram item
	const link = SVG.Link(Router.GetURL(item));
	group.appendChild(link);
	link.appendChild(SVG.ImageCentered(0, 0, DIMENSIONS.item, DIMENSIONS.item, Database.GetItemImage(item)));
	link.appendChild(SVG.Text(0, DIMENSIONS.item / 2 + 15, Utils.Localize(item.label), {'text-anchor': 'middle'}));
	//draw quantity
	if(quantity) {
		const quantity_circle = SVG.Circle(DIMENSIONS.item / 2 - 10, DIMENSIONS.item / 2 - 10, 10, {style: 'opacity: 0.8; fill: red;'});
		link.appendChild(quantity_circle);
		const quantity_text = SVG.Text(DIMENSIONS.item / 2 - 10, DIMENSIONS.item / 2 - 5, quantity, {'text-anchor': 'middle', style: 'font-size: 1rem; fill: white;'});
		link.appendChild(quantity_text);
	}
	//draw dependencies
	if(item.dependencies) {
		const resource_width = get_natural_resources_number(item) * (DIMENSIONS.item + DIMENSIONS.x_margin);
		let dependency_offset = x - resource_width / 2;
		const module_y = -DIMENSIONS.y_margin / 2 -DIMENSIONS.item / 2;
		item.dependencies.forEach(dependency => {
			const resource = Database.GetResource(dependency.id);
			const dependency_dependencies_number = get_natural_resources_number(resource);
			const dependency_width = (dependency_dependencies_number || 1) * (DIMENSIONS.item + DIMENSIONS.x_margin);
			const dependency_x = dependency_offset + dependency_width / 2;
			dependency_offset += dependency_width;

			const dependency_y = get_level(resource) * (DIMENSIONS.item + DIMENSIONS.y_margin);
			//draw paths between current resource and its dependencies
			svg.appendChild(SVG.Path(x, y + module_y + DIMENSIONS.item / 2, `H ${dependency_x} V ${dependency_y + DIMENSIONS.item + 25}`));
			draw_resource_tree(svg, dependency_x, dependency_y, resource, dependency.quantity);
		});
		//draw module
		const module = item.printed ? Database.GetObject(item.printed) : Database.GetObject(item.crafted);
		const module_link = SVG.Link(Router.GetURL(module));
		group.appendChild(module_link);
		module_link.appendChild(SVG.ImageCentered(0, module_y, DIMENSIONS.module, DIMENSIONS.module, Database.GetItemImage(module)));
		const module_text = SVG.Text(0, module_y + DIMENSIONS.module / 2 + 15, Utils.Localize(module.label), {'text-anchor': 'middle'});
		module_link.appendChild(module_text);
		SVG.TextWrap(module_text, DIMENSIONS.item + DIMENSIONS.x_margin / 2);
		const module_text_box = module_text.getBBox();
		group.appendChild(SVG.Path(0, -DIMENSIONS.item / 2, `V ${module_text_box.y + module_text_box.height}`));
		svg.appendChild(group);
	}
}

export const Items = {
	Sort: (item1, item2) => item1.id.compareTo(item2.id),
	DrawResourceTree: (item, svg) => {
		update_dimensions();
		//find selected object level
		const object_level = get_level(item);
		const object_resources_number = get_natural_resources_number(item);

		//calculate position of the root item
		const object_width = object_resources_number * (DIMENSIONS.item + DIMENSIONS.x_margin);
		const object_height = object_level * (DIMENSIONS.item + DIMENSIONS.y_margin);

		svg.empty();
		//add a margin to width to let some room for bordered items
		svg.style.width = `${object_width + 20}px`;
		//add a margin to height to let some room for the root item and its caption
		svg.style.height = `${object_height + DIMENSIONS.item + 20}px`;
		//it is necessary to redraw the svg so the browser adapts the size of the container
		svg.style.display = 'none';
		svg.style.display = 'block';

		draw_resource_tree(svg, object_width / 2 + 10, object_height, item);
	}
};
