import {Item} from './item';
import {Planet} from './planet';
import {Resource} from './resource';

export interface Database {
	readonly resources: Resource[];
	readonly items: Item[];
	readonly planets: Planet[];
}
