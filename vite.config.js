import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [dts()],
	resolve: {
		alias: {
			'@': path.resolve('./src')
		}
	},
	build: {
		outDir: 'dist',
		lib: {
			entry: 'src/index.ts',
			name: 'VitePluginWorkflow',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format}.js`
		},
		rollupOptions: {
			external: ['fs', 'path', 'child_process', 'node-ssh']
		}
	}
})
