import common from './webpack.common.js';

const development = {
	...common,
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		port: 9000,
		host: '0.0.0.0'
	}
};

export default development;
