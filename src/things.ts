import {SVG} from '@matco/basic-tools/svg.js';
import {Utils} from './utils';
import {Database, ThingType} from './database';
import {Router} from './router';
import {MOBILE_MEDIA} from './mobile';
import {Item, Resource, Thing} from './types';

const DIMENSIONS = {
	thing: undefined,
	module: undefined,
	x_margin: undefined,
	y_margin: undefined
};

function update_dimensions() {
	DIMENSIONS.thing = MOBILE_MEDIA.matches ? 30 : 45;
	DIMENSIONS.module = DIMENSIONS.thing / 2;
	DIMENSIONS.x_margin = DIMENSIONS.thing;
	DIMENSIONS.y_margin = DIMENSIONS.thing * (MOBILE_MEDIA.matches ? 3 : 2.5);
}

function get_level(thing: Resource|Item): number {
	if(!thing.dependencies) {
		return 0;
	}
	return thing.dependencies
		.map(d => Database.GetResource(d.id))
		.reduce((value, resource) => Math.max(1 + get_level(resource), value), 0);
}

/**
 *
 * @param {Resource|Item} thing the thing (resource of item) used to perform the calculation
 * @returns the number of natural resources required to build the thing
 */
function get_natural_resources_number(thing: Resource|Item): number {
	if(!thing.dependencies) {
		return 1;
	}
	return thing.dependencies
		.map(d => Database.GetResource(d.id))
		.map(get_natural_resources_number)
		.reduce((total, value) => total + value, 0);
}

/**
 *
 * @param {SVGElement} svg the SVG element where drawing will be made
 * @param {number} x the x position in the SVG
 * @param {number} y the y position in the SVG
 * @param {Resource|Item} thing the thing (item or resource) to draw
 * @param {number} quantity
 * Pay attention to the coordinates:
 * x is important because it is relative to the previous thing
 * y is a useless parameter (it has been kept because it could be used for an alternative representation)
 * the y-axis coordinate is absolute and is calculated according to the thing level
 */
function draw_resource_tree(svg: SVGElement, x: number, y: number, thing: Resource|Item, quantity?: number) {
	//create a group at the thing position
	const group = SVG.Group({transform: `translate(${x},${y + DIMENSIONS.thing / 2})`});
	svg.appendChild(group);
	//dram thing
	const link = SVG.Link(Router.GetURL(thing));
	group.appendChild(link);
	link.appendChild(SVG.ImageCentered(0, 0, DIMENSIONS.thing, DIMENSIONS.thing, Database.GetThingImage(thing)));
	link.appendChild(SVG.Text(0, DIMENSIONS.thing / 2 + 15, Utils.Localize(thing.label), {'text-anchor': 'middle'}));
	//draw quantity
	if(quantity) {
		const quantity_circle = SVG.Circle(DIMENSIONS.thing / 2 - 10, DIMENSIONS.thing / 2 - 10, 10, {style: 'opacity: 0.8; fill: red;'});
		link.appendChild(quantity_circle);
		const quantity_text = SVG.Text(DIMENSIONS.thing / 2 - 10, DIMENSIONS.thing / 2 - 5, quantity, {'text-anchor': 'middle', style: 'font-size: 1rem; fill: white;'});
		link.appendChild(quantity_text);
	}
	//draw dependencies
	if(thing.dependencies) {
		const resource_width = get_natural_resources_number(thing) * (DIMENSIONS.thing + DIMENSIONS.x_margin);
		let dependency_offset = x - resource_width / 2;
		const module_y = -DIMENSIONS.y_margin / 2 -DIMENSIONS.thing / 2;
		thing.dependencies.forEach(dependency => {
			const resource = Database.GetResource(dependency.id);
			const dependency_dependencies_number = get_natural_resources_number(resource);
			const dependency_width = (dependency_dependencies_number || 1) * (DIMENSIONS.thing + DIMENSIONS.x_margin);
			const dependency_x = dependency_offset + dependency_width / 2;
			dependency_offset += dependency_width;

			const dependency_y = get_level(resource) * (DIMENSIONS.thing + DIMENSIONS.y_margin);
			//draw paths between current resource and its dependencies
			svg.appendChild(SVG.Path(x, y + module_y + DIMENSIONS.thing / 2, `H ${dependency_x} V ${dependency_y + DIMENSIONS.thing + 25}`));
			draw_resource_tree(svg, dependency_x, dependency_y, resource, dependency.quantity);
		});
		//draw module
		const module = thing.type === ThingType.Item ? Database.GetItem(thing.printed) : Database.GetItem(thing.crafted);
		const module_link = SVG.Link(Router.GetURL(module));
		group.appendChild(module_link);
		module_link.appendChild(SVG.ImageCentered(0, module_y, DIMENSIONS.module, DIMENSIONS.module, Database.GetThingImage(module)));
		const module_text = SVG.Text(0, module_y + DIMENSIONS.module / 2 + 15, Utils.Localize(module.label), {'text-anchor': 'middle'});
		module_link.appendChild(module_text);
		SVG.TextWrap(module_text, DIMENSIONS.thing + DIMENSIONS.x_margin / 2);
		const module_text_box = module_text.getBBox();
		group.appendChild(SVG.Path(0, -DIMENSIONS.thing / 2, `V ${module_text_box.y + module_text_box.height}`));
		svg.appendChild(group);
	}
}

export const Things = {
	Sort: (thing1: Thing, thing2: Thing): number => thing1.id.compareTo(thing2.id),
	DrawResourceTree: (thing: Resource|Item, svg: SVGElement) => {
		update_dimensions();
		//find selected item level
		const item_level = get_level(thing);
		const item_resources_number = get_natural_resources_number(thing);

		//calculate position of the root thing
		const item_width = item_resources_number * (DIMENSIONS.thing + DIMENSIONS.x_margin);
		const item_height = item_level * (DIMENSIONS.thing + DIMENSIONS.y_margin);

		svg.empty();
		//add a margin to width to let some room for bordered things
		svg.style.width = `${item_width + 20}px`;
		//add a margin to height to let some room for the root thing and its caption
		svg.style.height = `${item_height + DIMENSIONS.thing + 20}px`;
		//it is necessary to redraw the svg so the browser adapts the size of the container
		svg.style.display = 'none';
		svg.style.display = 'block';

		draw_resource_tree(svg, item_width / 2 + 10, item_height, thing);
	}
};
