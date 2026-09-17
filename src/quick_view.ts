import {Localization} from './localization';
import {Thing} from './model/thing';
import {Item} from './model/item';
import {Resource} from './model/resource';
import {ThingType} from './model/thing_types';
import {ITEM_DESCRIPTIONS} from './item_descriptions';
import {ResourceDetails} from './resource_details';

const TOOLTIP_ID = 'quick_view_tooltip';
const PRINTER_TIERS: Record<string, number> = {backpack: 1, small_printer: 2, medium_printer: 3, large_printer: 4};
const TIER_SIZES = ['small', 'medium', 'large', 'extra_large'];
const WIKI_PAGES: Record<string, string> = {
	rail_post_bundle: 'Rail_Post',
	tall_rail_post_bundle: 'Tall_Rail_Post',
	rail_junction_bundle: 'Rail_Junction',
	extenders: 'Power_Extenders',
	cole: 'C.O.L.E.'
};

let active_target: Element;
let hide_timer: number;

function create_text(tag: string, class_name: string, text: string): HTMLElement {
	return document.createFullElement(tag, {class: class_name}, text);
}

function get_item_tier_label(item: Item): string {
	const tier = item.tier || PRINTER_TIERS[item.printed];
	return tier ? Localization.GetLabel('item_tier').replace('{tier}', String(tier)).replace('{size}', Localization.GetLabel(`item_size_${TIER_SIZES[tier - 1]}`)) : Localization.GetLabel('built_in_equipment');
}

function draw_resource_summary(resource: Resource, link_planets = false): DocumentFragment {
	const content = document.createDocumentFragment();
	content.appendChild(create_text('p', 'quick-view-meta', ResourceDetails.GetMeta(resource)));
	if(resource.all_planets) {
		content.appendChild(create_text('p', 'quick-view-location', Localization.GetLabel('found_all_planets')));
		const location = ResourceDetails.GetLocation(resource);
		if(location) {
			content.appendChild(create_text('p', 'quick-view-location', location));
		}
	}
	if(resource.crafted) {
		content.appendChild(create_text('p', 'quick-view-location', ResourceDetails.GetCrafterLabel(resource)));
	}
	for(const group of ResourceDetails.GetLocationGroups(resource)) {
		content.appendChild(create_text('p', 'quick-view-location', `${group.label}:`));
		const list = document.createFullElement('ul', {class: 'quick-view-locations'});
		for(const planet of group.planets) {
			const row = document.createElement('li');
			row.appendChild(link_planets ? document.createFullElement('a', {href: `#planet=${planet.id}`}, planet.name) : document.createTextNode(planet.name));
			row.appendChild(document.createTextNode(` – ${group.location}`));
			list.appendChild(row);
		}
		content.appendChild(list);
	}
	return content;
}

function draw_content(thing: Thing): DocumentFragment {
	const content = document.createDocumentFragment();
	if(thing.type === ThingType.Planet) {
		return content;
	}
	content.appendChild(create_text('div', 'quick-view-title', Localization.Localize(thing.label)));
	if(thing.type === ThingType.Item) {
		content.appendChild(create_text('p', 'quick-view-meta', get_item_tier_label(thing)));
		const description = create_text('p', 'quick-view-description', ITEM_DESCRIPTIONS[thing.id]);
		description.lang = 'en';
		content.appendChild(description);
	}
	else {
		content.appendChild(draw_resource_summary(thing));
	}
	return content;
}

function position(element: HTMLElement, target: Element, pointer?: PointerEvent) {
	const gap = 12;
	const target_box = target.getBoundingClientRect();
	const tooltip_box = element.getBoundingClientRect();
	let left = pointer ? pointer.clientX + gap : target_box.left + target_box.width / 2 - tooltip_box.width / 2;
	let top = pointer ? pointer.clientY + gap : target_box.bottom + gap;
	left = Math.max(gap, Math.min(left, window.innerWidth - tooltip_box.width - gap));
	if(top + tooltip_box.height > window.innerHeight - gap) {
		top = (pointer ? pointer.clientY : target_box.top) - tooltip_box.height - gap;
	}
	element.style.left = `${left}px`;
	element.style.top = `${Math.max(gap, top)}px`;
}

function hide() {
	window.clearTimeout(hide_timer);
	const element = document.getElementById(TOOLTIP_ID);
	if(element) {
		element.hidden = true;
	}
	if(active_target) {
		const descriptions = (active_target.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== TOOLTIP_ID);
		if(descriptions.length) {
			active_target.setAttribute('aria-describedby', descriptions.join(' '));
		}
		else {
			active_target.removeAttribute('aria-describedby');
		}
		active_target = undefined;
	}
}

function schedule_hide() {
	window.clearTimeout(hide_timer);
	hide_timer = window.setTimeout(() => {
		if(active_target !== document.activeElement) {
			hide();
		}
	}, 120);
}

function tooltip(): HTMLElement {
	let element = document.getElementById(TOOLTIP_ID);
	if(!element) {
		element = document.createFullElement('div', {id: TOOLTIP_ID, class: 'quick-view-tooltip', role: 'tooltip'});
		element.hidden = true;
		element.addEventListener('pointerenter', () => window.clearTimeout(hide_timer));
		element.addEventListener('pointerleave', schedule_hide);
		document.body.appendChild(element);
	}
	return element;
}

function show(target: Element, thing: Thing, pointer?: PointerEvent) {
	hide();
	if(!target || thing.type === ThingType.Planet) {
		return;
	}
	const element = tooltip();
	element.empty();
	element.appendChild(draw_content(thing));
	element.hidden = false;
	active_target = target;
	const descriptions = target.getAttribute('aria-describedby');
	target.setAttribute('aria-describedby', descriptions ? `${descriptions} ${TOOLTIP_ID}` : TOOLTIP_ID);
	position(element, target, pointer);
}

window.addEventListener('keydown', event => {
	if(event.key === 'Escape') {
		hide();
	}
});
window.addEventListener('blur', hide);
window.addEventListener('resize', hide);
window.addEventListener('scroll', event => {
	if(!(event.target instanceof Element) || !event.target.closest('.quick-view-tooltip')) {
		hide();
	}
}, true);
document.addEventListener('click', hide);

export const QuickView = {
	GetItemDescription: (item: Item): string => ITEM_DESCRIPTIONS[item.id],
	GetItemTierLabel: get_item_tier_label,
	GetItemWikiURL: (item: Item): string => `https://astroneer.fandom.com/wiki/${encodeURIComponent(WIKI_PAGES[item.id] || item.label['en-US'].replaceAll(' ', '_'))}`,
	DrawResourceSummary: draw_resource_summary,
	Show: show,
	Hide: hide,
	Attach: (target: Element, thing: Thing) => {
		if(thing.type === ThingType.Planet) {
			return;
		}
		target.classList.add('has-quick-view');
		target.addEventListener('pointerenter', event => {
			if((event as PointerEvent).pointerType !== 'touch') {
				show(target, thing, event as PointerEvent);
			}
		});
		target.addEventListener('pointerleave', () => {
			if(active_target === target) {
				schedule_hide();
			}
		});
		target.addEventListener('focus', () => show(target, thing));
		target.addEventListener('blur', () => {
			if(active_target === target) {
				hide();
			}
		});
	}
};
