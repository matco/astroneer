import {Database} from './database';
import {Items} from './items';
import {Planets} from './planets';
import {Resources} from './resources';
import {Things} from './things';

export const Home = {
	Open: () => {
		Database.GetResources()
			.sort(Things.Sort)
			.map(r => Resources.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('home_resources'));
		Database.GetItems()
			.sort(Things.Sort)
			.map(Items.DrawForList)
			.forEach(Node.prototype.appendChild, document.getElementById('home_items'));
		Database.GetPlanets()
			.sort(Things.Sort)
			.map(Planets.DrawForList)
			.forEach(Node.prototype.appendChild, document.getElementById('home_planets'));
		document.getElementById('home').style.display = 'block';
	}
};
