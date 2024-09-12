import {ThingType} from './model/thing_types';
import {Database} from './model/database';
import {Item} from './model/item';
import {Planet} from './model/planet';
import {Resource} from './model/resource';
import {Thing} from './model/thing';

let database: Database;

function find_or_throw<T extends Thing>(things: T[], thing_id: string): T {
	const thing = things.find(t => t.id === thing_id);
	if(!thing) {
		throw new Error(`No thing with id ${thing_id}`);
	}
	return thing;
}

const Repository = {
	Init: async() => {
		const response = await fetch('/data.json');
		database = Object.seal((await response.json()) as Database);
		//add type to all things
		database.resources.forEach(r => r.type = ThingType.Resource);
		database.items.forEach(i => i.type = ThingType.Item);
		database.planets.forEach(p => p.type = ThingType.Planet);
	},
	GetAll: (): Thing[] => [...database.resources, ...database.items, ...database.planets],
	GetThings: (type: ThingType): Thing[] => {
		switch(type) {
			case ThingType.Resource: return database.resources;
			case ThingType.Item: return database.items;
			case ThingType.Planet: return database.planets;
		}
		//satisfy Typescript compiler
		throw new Error();
	},
	GetThingImage: (thing: Thing): string => `images/${thing.type}/${thing.id}.png`,
	GetResources: (): Resource[] => database.resources.slice(),
	GetResource: (resource_id: string): Resource => find_or_throw(Repository.GetResources(), resource_id),
	GetItems: (): Item[] => database.items.slice(),
	GetItem: (item_id: string): Item => find_or_throw(Repository.GetItems(), item_id),
	GetPlanets: (): Planet[] => database.planets.slice(),
	GetPlanet: (planet_id: string): Planet => find_or_throw(Repository.GetPlanets(), planet_id)
};

export {Repository, ThingType};
