import {Item, Planet, Resource} from './types';
import {Router} from './router';
import {Database} from './database';
import {Labels} from './labels';
import {ThingType} from './database';

export const Utilities = {
    DrawWiki: (item: Item): HTMLElement => {
        const wiki = document.createFullElement('div', {class: "wiki", href: Router.GetWikiUrl(item)});
        return wiki;
    },
    DrawForList: (thing: Item | Planet): HTMLLIElement => {
        const element = document.createFullElement('li');
        element.appendChild(Utilities.Draw(thing));
        return element;
    },
    Draw: (thing: Item | Planet | Resource): HTMLAnchorElement => {
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
    DrawImage: (thing: Item | Planet | Resource): HTMLImageElement => {
        return document.createFullElement('img', {src: Database.GetThingImage(thing)});
    },
}