import {Dependency} from './dependency';
import {ThingProperties} from './thing_properties';
import {ThingType} from './thing_types';

export interface Resource extends ThingProperties {
	type: ThingType.Resource;
	readonly label: Record<string, string>;
	readonly crafted?: string;
	readonly material?: string;
	readonly all_planets?: boolean;
	readonly location?: string;
	readonly primary_location?: string;
	readonly secondary_location?: string;
	readonly dependencies: Dependency[];
}
