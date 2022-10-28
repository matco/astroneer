import {Item, Planet, Resource, Thing} from './types';
import {Router} from './router';
import {Database} from './database';
import {Labels} from './labels';
import {ThingType} from './database';

export const Utilities = {
    DrawWiki: (thing: Thing): HTMLElement => {
        const wiki = document.createFullElement('div', {class: 'wiki'});
        const link = document.createFullElement('a', {href: Router.GetWikiUrl(thing), target: '_blank'});
        const header = document.createFullElement('span', {class: 'header'});
        const footer = document.createFullElement('span', {class: 'footer'});
        const highlightText = document.createFullElement('strong');
        const normalText = document.createTextNode(`${Labels.GetLabel('wiki_category')}: ${thing.type}`);
        if(thing.type === ThingType.Item || thing.type === ThingType.Resource) {
            highlightText.appendChild(document.createTextNode(Labels.Localize(thing.label)));
            link.appendChild(document.createTextNode(`${Labels.GetLabel('wiki_link')}`));
        }
        if(thing.type === ThingType.Planet) {
            highlightText.appendChild(document.createTextNode(`${thing.name}`));
            link.appendChild(document.createTextNode(`${Labels.GetLabel('wiki_link')}`));
        }
        header.appendChild(highlightText);
        header.appendChild(document.createFullElement('br'))
        header.appendChild(normalText);
        footer.appendChild(link);
        wiki.appendChild(header);
        wiki.appendChild(footer);
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
        let alt = '';
        if(thing.type === ThingType.Item || thing.type === ThingType.Resource) {
            alt = Labels.Localize(thing.label);
        }
        if(thing.type === ThingType.Planet) {
            alt = thing.name;
        }
        return document.createFullElement('img', {src: Database.GetThingImage(thing), alt});
    },
}