import { defineConfig } from 'vite'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve('./src')
		}
	},
	plugins: [dts()],
	build: {
		outDir: 'dist',
		lib: {
			entry: 'src/index.ts',
			name: 'VitePluginWorkflow',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format}.js`
		},
		rollupOptions: {
			external: ['fs', 'path', 'child_process', 'node-ssh'] // 外部化 Node.js 内置模块
		}
	}
})
