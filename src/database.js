let database;

function find_or_throw(item_type, item_id) {
	const item = Database.GetItems(item_type).find(i => i.id === item_id);
	if(!item) {
		throw new Error(`No ${item_type} with id ${item_id}`);
	}
	return item;
}

const ITEM_TYPE = {
	RESOURCE: {
		name: 'resource',
		plural: 'resources'
	},
	OBJECT: {
		name: 'object',
		plural: 'objects'
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
		//add type to all items
		database.resources.forEach(r => r.type = ITEM_TYPE.RESOURCE);
		database.objects.forEach(o => o.type = ITEM_TYPE.OBJECT);
		database.planets.forEach(p => p.type = ITEM_TYPE.PLANET);
	},
	GetAll: () => {
		return [
			...database.resources,
			...database.objects,
			...database.planets
		];
	},
	GetItems: type => {
		switch(type) {
			case ITEM_TYPE.RESOURCE: return database.resources;
			case ITEM_TYPE.OBJECT: return database.objects;
			case ITEM_TYPE.PLANET: return database.planets;
		}
		//satisfy Typescript compiler
		throw new Error();
	},
	GetItemImage: item => `images/${item.type.plural}/${item.id}.png`,
	GetResources: () => {
		return Database.GetItems(ITEM_TYPE.RESOURCE);
	},
	GetResource: resource_id => {
		return find_or_throw(ITEM_TYPE.RESOURCE, resource_id);
	},
	GetObjects: () => {
		return Database.GetItems(ITEM_TYPE.OBJECT);
	},
	GetObject: object_id => {
		return find_or_throw(ITEM_TYPE.OBJECT, object_id);
	},
	GetPlanets: () => {
		return Database.GetItems(ITEM_TYPE.PLANET);
	},
	GetPlanet: planet_id => {
		return find_or_throw(ITEM_TYPE.PLANET, planet_id);
	}
};

export {Database, ITEM_TYPE};
