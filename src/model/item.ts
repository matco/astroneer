import {Dependency} from './dependency';
import {ThingProperties} from './thing_properties';
import {ThingType} from './thing_types';

export interface Item extends ThingProperties {
	type: ThingType.Item;
	readonly label: Record<string, string>;
	readonly printed?: string;
	readonly printer: boolean;
	readonly crafter: boolean;
	readonly dependencies: Dependency[];
}
