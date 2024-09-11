import {Repository} from './repository';
import {Things} from './things';

export const Home = {
	Open: () => {
		Repository.GetResources()
			.sort(Things.Sort)
			.map(r => Things.DrawForList(r))
			.forEach(Node.prototype.appendChild, document.getElementById('home_resources').empty());
		Repository.GetItems()
			.sort(Things.Sort)
			.map(i => Things.DrawForList(i))
			.forEach(Node.prototype.appendChild, document.getElementById('home_items').empty());
		Repository.GetPlanets()
			.sort(Things.Sort)
			.map(p => Things.DrawForList(p))
			.forEach(Node.prototype.appendChild, document.getElementById('home_planets').empty());
		document.getElementById('home').style.display = 'block';
	}
};
