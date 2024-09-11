import {ThingType} from './database';

export interface ThingProperties {
	readonly id: string;
	type: ThingType;
}

export interface Resource extends ThingProperties {
	type: ThingType.Resource;
	readonly label: Record<string, string>;
	readonly crafted?: string;
	readonly dependencies: Dependency[];
}

export interface Item extends ThingProperties {
	type: ThingType.Item;
	readonly label: Record<string, string>;
	readonly printed?: string;
	readonly printer: boolean;
	readonly crafter: boolean;
	readonly dependencies: Dependency[];
}

export interface Planet extends ThingProperties {
	type: ThingType.Planet;
	readonly name: string;
	readonly primary_resources: string[];
	readonly secondary_resources: string[];
	readonly at_core: string[];
	readonly atmospheric_resources: string[];
}

export interface Dependency {
	readonly id: string;
	readonly quantity: number;
}

export type Thing = Resource | Item | Planet;

export interface Database {
	readonly resources: Resource[];
	readonly items: Item[];
	readonly planets: Planet[];
}

export interface ThingResult {
	readonly thing: Thing;
	readonly label: string;
	readonly tags: string[];
	score: number;
}

export interface Settings {
	language: string;
}

export type Label = Record<string, string>;

export type Labels = Record<string, Label>;
