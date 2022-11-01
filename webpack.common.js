import * as path from 'path';
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	context: path.resolve(__dirname, 'src'),
	entry: [
		'./index.ts',
		'./index.css'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			inject: 'head',
			xhtml: true,
			favicon: './images/favicon/favicon.png'
		}),
		new CopyPlugin({
			patterns: [
				{from: '*.json'},
				{from: './images', to: 'images'}
			],
		})
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(png|svg|ttf)$/,
				type: 'asset/resource'
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
};
