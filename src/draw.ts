import {Item, Planet, Resource, Thing} from './types';
import {Router} from './router';
import {Database} from './database';
import {Labels} from './labels';
import {ThingType} from './database';

export const Utilities = {
    DrawWiki: (thing: Thing): HTMLElement => {
        const wiki = document.createFullElement('div', {class: 'wiki'});
        const link = document.createFullElement('a', {href: Router.GetWikiUrl(thing)});
        if(thing.type === ThingType.Item || thing.type === ThingType.Resource) {
            link.appendChild(document.createTextNode(`${Labels.GetLabel('wiki_link')} "${Labels.Localize(thing.label)}"`));
        }
        if(thing.type === ThingType.Planet) {
            link.appendChild(document.createTextNode(`${Labels.GetLabel('wiki_link')} "${thing.name}"`));
        }
        wiki.appendChild(link)
        return wiki;
    },
    DrawForList: (thing: Thing): HTMLLIElement => {
        const element = document.createFullElement('li');
        element.appendChild(Utilities.Draw(thing));
        return element;
    },
    Draw: (thing: Thing): HTMLAnchorElement => {
        const link = document.createFullElement('a', {class: 'thing', href: Router.GetURL(thing)});
        link.appendChild(Utilities.DrawImage(thing));
        if(thing.type === ThingType.Item || thing.type === ThingType.Resource) {
            link.appendChild(document.createTextNode(Labels.Localize(thing.label)));
        }
        if(thing.type === ThingType.Planet) {
            link.appendChild(document.createTextNode(thing.name));
        }
        return link;
    },
    DrawImage: (thing: Thing): HTMLImageElement => {
        return document.createFullElement('img', {src: Database.GetThingImage(thing)});
    },
}