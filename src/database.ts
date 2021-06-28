let database;

function find_or_throw(thing_type, thing_id) {
	const thing = Database.GetThings(thing_type).find(t => t.id === thing_id);
	if(!thing) {
		throw new Error(`No ${thing_type} with id ${thing_id}`);
	}
	return thing;
}

enum ThingType {
	Resource = 'resource',
	Item = 'item',
	Planet = 'planet'
};

const Database = {
	Init: async () => {
		const response = await fetch('/data.json');
		database = await response.json();
		//add type to all things
		database.resources.forEach(r => r.type = ThingType.Resource);
		database.items.forEach(i => i.type = ThingType.Item);
		database.planets.forEach(p => p.type = ThingType.Planet);
	},
	GetAll: () => [...database.resources, ...database.items, ...database.planets],
	GetThings: type => {
		switch(type) {
			case ThingType.Resource: return database.resources;
			case ThingType.Item: return database.items;
			case ThingType.Planet: return database.planets;
		}
		//satisfy Typescript compiler
		throw new Error();
	},
	GetThingImage: thing => `images/${thing.type}/${thing.id}.png`,
	GetResources: () => Database.GetThings(ThingType.Resource),
	GetResource: resource_id => find_or_throw(ThingType.Resource, resource_id),
	GetItems: () => Database.GetThings(ThingType.Item),
	GetItem: item_id => find_or_throw(ThingType.Item, item_id),
	GetPlanets: () => Database.GetThings(ThingType.Planet),
	GetPlanet: planet_id => find_or_throw(ThingType.Planet, planet_id)
};

export {Database, ThingType};
