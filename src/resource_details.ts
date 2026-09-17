import {Localization} from './localization';
import {Repository} from './repository';
import {Resource} from './model/resource';
import {Planet} from './model/planet';

export interface ResourceLocationGroup {
	label: string;
	planets: Planet[];
	location: string;
}

export const ResourceDetails = {
	GetMeta: (resource: Resource): string => {
		if(resource.material) {
			return Localization.GetLabel('resource_material').replace('{material}', Localization.Localize(Repository.GetResource(resource.material).label));
		}
		const categories: Record<string, string> = {
			smelting_furnace: 'refined_material',
			chemistry_lab: 'composite_material',
			atmospheric_condenser: 'atmospheric_resource'
		};
		return Localization.GetLabel(categories[resource.crafted] || (resource.id === 'exo_chip' ? 'rare_resource' : 'natural_resource'));
	},
	GetLocation: (resource: Resource): string => resource.location ? Localization.GetLabel(resource.location) : '',
	GetLocationGroups: (resource: Resource): ResourceLocationGroup[] => {
		const planets = Repository.GetPlanets();
		if(resource.crafted === 'atmospheric_condenser') {
			return [{label: Localization.GetLabel('resource_planets'), planets: planets.filter(p => p.atmospheric_resources.includes(resource.id)), location: Localization.GetLabel('collected_from_atmosphere')}];
		}
		if(resource.all_planets || resource.crafted) {
			return [];
		}
		return [
			{label: Localization.GetLabel('resource_primary_planets'), planets: planets.filter(p => p.primary_resources.includes(resource.id)), location: Localization.GetLabel(resource.primary_location)},
			{label: Localization.GetLabel('resource_secondary_planets'), planets: planets.filter(p => p.secondary_resources.includes(resource.id)), location: Localization.GetLabel(resource.secondary_location)}
		].filter(group => group.planets.length > 0);
	},
	GetCrafterLabel: (resource: Resource): string => {
		if(!resource.crafted) {
			return '';
		}
		const crafter = Localization.Localize(Repository.GetItem(resource.crafted).label);
		if(resource.crafted === 'smelting_furnace') {
			const ingredients = resource.dependencies.map(dependency => Localization.Localize(Repository.GetResource(dependency.id).label)).join(', ');
			return Localization.GetLabel('refined_from').replace('{resource}', ingredients).replace('{item}', crafter);
		}
		return Localization.GetLabel('made_with').replace('{item}', crafter);
	}
};
