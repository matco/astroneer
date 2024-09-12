import {ThingType} from './thing_types';

export interface ThingProperties {
	readonly id: string;
	type: ThingType;
}
