import {ThingType} from './model/thing_types';
import {Database} from './model/database';
import {Item} from './model/item';
import {Planet} from './model/planet';
import {Resource} from './model/resource';
import {Thing} from './model/thing';

let database: Database;

//recursively freeze an object and all of its nested objects and arrays
function deep_freeze<T>(value: T): T {
	//only objects (including arrays) can be frozen; skip primitives and null
	if(value !== null && typeof value === 'object') {
		//freeze children before freezing the object itself
		Object.values(value).forEach(deep_freeze);
		Object.freeze(value);
	}
	return value;
}

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
		database = (await response.json()) as Database;
		//add type to all things
		database.resources.forEach(r => r.type = ThingType.Resource);
		database.items.forEach(i => i.type = ThingType.Item);
		database.planets.forEach(p => p.type = ThingType.Planet);
		//deep freeze the database once it is fully initialized to prevent any further mutations
		deep_freeze(database);
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
