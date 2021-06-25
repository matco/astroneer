import * as path from 'path';
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	mode: 'development',
	devtool: 'source-map',
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
		new WorkboxPlugin.GenerateSW({
			clientsClaim: true,
			skipWaiting: true,
		}),
		new CopyPlugin({
			patterns: [
				{from: './*.json', to: '[name].json'},
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
				test: /\.(png|svg)$/,
				use: [
					'file-loader',
				]
			},
			{
				test: /\.(ttf)$/i,
				type: 'asset/resource'
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		port: 9000,
		host: '0.0.0.0',
		disableHostCheck: true
	}
};
