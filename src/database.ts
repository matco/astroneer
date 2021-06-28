let database;

function find_or_throw(thing_type, thing_id) {
	const thing = Database.GetThings(thing_type).find(t => t.id === thing_id);
	if(!thing) {
		throw new Error(`No ${thing_type} with id ${thing_id}`);
	}
	return thing;
}

const THING_TYPE = {
	RESOURCE: {
		name: 'resource',
		plural: 'resources'
	},
	ITEM: {
		name: 'item',
		plural: 'items'
	},
	PLANET: {
		name: 'planet',
		plural: 'planets'
	}
};

const Database = {
	Init: async () => {
		const response = await fetch('/data.json');
		database = await response.json();
		//add type to all things
		database.resources.forEach(r => r.type = THING_TYPE.RESOURCE);
		database.items.forEach(i => i.type = THING_TYPE.ITEM);
		database.planets.forEach(p => p.type = THING_TYPE.PLANET);
	},
	GetAll: () => [...database.resources, ...database.items, ...database.planets],
	GetThings: type => {
		switch(type) {
			case THING_TYPE.RESOURCE: return database.resources;
			case THING_TYPE.ITEM: return database.items;
			case THING_TYPE.PLANET: return database.planets;
		}
		//satisfy Typescript compiler
		throw new Error();
	},
	GetThingImage: thing => `images/${thing.type.plural}/${thing.id}.png`,
	GetResources: () => Database.GetThings(THING_TYPE.RESOURCE),
	GetResource: resource_id => find_or_throw(THING_TYPE.RESOURCE, resource_id),
	GetItems: () => Database.GetThings(THING_TYPE.ITEM),
	GetItem: item_id => find_or_throw(THING_TYPE.ITEM, item_id),
	GetPlanets: () => Database.GetThings(THING_TYPE.PLANET),
	GetPlanet: planet_id => find_or_throw(THING_TYPE.PLANET, planet_id)
};

export {Database, THING_TYPE};
