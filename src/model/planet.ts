import {ThingProperties} from './thing_properties';
import {ThingType} from './thing_types';

export interface Planet extends ThingProperties {
	type: ThingType.Planet;
	readonly name: string;
	readonly primary_resources: string[];
	readonly secondary_resources: string[];
	readonly at_core: string[];
	readonly atmospheric_resources: string[];
}
