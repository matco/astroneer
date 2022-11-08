import {Item, Planet, Resource, Thing} from './types';

let database;

function find_or_throw<T extends Thing>(things: T[], thing_id: string): T {
	const thing = things.find(t => t.id === thing_id);
	if(!thing) {
		throw new Error(`No thing with id ${thing_id}`);
	}
	return thing;
}

enum ThingType {
	Resource = 'resource',
	Item = 'item',
	Planet = 'planet'
}

const Database = {
	Init: async () => {
		const response = await fetch('/data.json');
		database = Object.seal(await response.json());
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
	GetResource: (resource_id: string): Resource => find_or_throw(Database.GetResources(), resource_id),
	GetItems: (): Item[] => database.items.slice(),
	GetItem: (item_id: string): Item => find_or_throw(Database.GetItems(), item_id),
	GetPlanets: (): Planet[] => database.planets.slice(),
	GetPlanet: (planet_id: string): Planet => find_or_throw(Database.GetPlanets(), planet_id)
};

export {Database, ThingType};
