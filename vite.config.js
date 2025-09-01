import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import inject from '@rollup/plugin-inject'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: tag => ['lottie-player'].includes(tag),
				},
			},
		}),
		nodePolyfills({
			include: ['path', 'stream', 'util'],
			exclude: ['http'],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
			overrides: {
				fs: 'memfs',
			},
			protocolImports: true,
		}),
	],
	base: './',
	server: {
		open: true,
	},
	build: {
		sourcemap: false,
		logLevel: 'info',
		rollupOptions: {
			output: {
				plugins: [
					inject({
						Buffer: ['buffer', 'Buffer'],
					}),
				],
				chunkFileNames: 'static/js/[name].[hash].js',
				entryFileNames: 'static/js/[name].[hash].js',
				assetFileNames: ({ name }) => {
					if (name.endsWith('.js')) {
						return `static/js/[name].[hash].js`
					} else if (name.endsWith('.css')) {
						return 'static/css/[name].[hash].css'
					} else if (
						name.endsWith('.png') ||
						name.endsWith('.svg') ||
						name.endsWith('.jpg')
					) {
						return 'static/images/[name].[hash].[ext]'
					} else if (
						name.endsWith('woff') ||
						name.endsWith('woff2') ||
						name.endsWith('ttf') ||
						name.endsWith('eot')
					) {
						return 'static/fonts/[name].[hash].[ext]'
					} else {
						return 'static/[name].[hash].[ext]'
					}
				},
				manualChunks(id) {
					const chunks = [
						{
							name: 'ton-ui',
							data: ['vue-tg', 'ton-ui-vue', '@tonconnect/ui'],
						},
						{ name: 'ton-pay', data: ['ton-core'] },
						{ name: 'socket-io', data: ['socket.io-client'] },
						{
							name: 'apollo',
							data: [
								'@apollo/client',
								'@vue/apollo-composable',
								'@vue/apollo-util',
							],
						},
						{
							name: 'stable',
							data: [
								'vue-uuid',
								'vue3-circle-progress',
								'vue-countup-v3',
								'odometer_countup',
							],
						},
					]
					if (id.includes('/node_modules/')) {
						for (const chunkData of chunks) {
							if (chunkData.data.some(chunk => id.includes(chunk))) {
								return chunkData.name
							}
						}
					}
				},
			},
		},
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, './src'),
		},
	},
})
