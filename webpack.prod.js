import common from './webpack.common.js';
import WorkboxPlugin from 'workbox-webpack-plugin';

const production = {
	...common,
	mode: 'production'
};

production.plugins.push(
	new WorkboxPlugin.GenerateSW({
		clientsClaim: true,
		skipWaiting: true,
	})
);

export default production;
