import {Dependency} from './dependency';
import {ThingProperties} from './thing_properties';
import {ThingType} from './thing_types';

export interface Resource extends ThingProperties {
	type: ThingType.Resource;
	readonly label: Record<string, string>;
	readonly crafted?: string;
	readonly dependencies: Dependency[];
}
