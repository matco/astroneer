import {Thing} from './thing';

export interface ThingResult {
	readonly thing: Thing;
	readonly label: string;
	readonly tags: string[];
	score: number;
}
