//recursively freeze an object and all of its nested objects and arrays
//this guarantees deep immutability, unlike Object.freeze/Object.seal which only apply to the top level
export function deep_freeze<T>(value: T): T {
	//only objects (including arrays) can be frozen; skip primitives and null
	if(value !== null && typeof value === 'object') {
		//freeze children before freezing the object itself
		Object.values(value).forEach(deep_freeze);
		Object.freeze(value);
	}
	return value;
}
