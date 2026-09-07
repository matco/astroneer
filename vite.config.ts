import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => ({
	root: 'src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: mode === 'development'
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{src: '*.json', dest: '.'},
				{src: 'images', dest: '.'}
			]
		}),
		VitePWA({
			manifest: false,
			injectRegister: false,
			filename: 'service-worker.js',
			workbox: {
				clientsClaim: true,
				skipWaiting: true
			}
		})
	]
}));
