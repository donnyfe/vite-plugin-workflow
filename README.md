# vite-plugin-workflow

一个用于优化工作流的 vite 插件包，提供多种实用 vite 插件

## 功能

- 部署服务器
- 部署 NPM

## 使用

```bash
npm install vite-plugin-workflow -D

# or

pnpm add vite-plugin-workflow -D
```

**vite.config.js**

```js
import { mergeConfig, loadEnv } from 'vite'
import { deployToServer, deployToNpm } from 'vite-plugin-workflow'

const env = loadEnv(process.env.NODE_ENV, process.cwd(), '')

export default defineConfig({
	plugins: [
		// 部署到NPM
		deployToNpm({
			// 默认淘宝镜像源(可选), 设置参数后，npm 发布完成会自动切换到该镜像源
			defaultRegistry: 'https://registry.npmmirror.com',
			// 发布镜像源(可选)
			registry: 'https://registry.npmjs.org',
			// 公开作用域(可选)
			access: 'public'
		}),

		// 部署到服务器
		deployToServer({
			host: env.SSH_HOST,
			port: Number(env.SSH_PORT) || 22,
			username: env.SSH_USERNAME,
			password: env.SSH_PASSWORD,
			remotePath: env.SSH_REMOTE_PATH,
			localPath: env.SSH_LOCAL_PATH
		})
	]
})
```

**.env.production**

敏感信息填写在变量环境`.env.production`中，统一管理，同时将`.env.production`添加到`.gitignore`忽略文件中

```sh
SSH_HOST=127.0.0.1
SSH_PORT=22
SSH_USERNAME=root
SSH_PASSWORD=123456
SSH_REMOTE_PATH=/root/www/app
SSH_LOCAL_PATH=dist
```

**.gitignore**

**注意：敏感信息内容注意添加到忽略文件中，避免上传到外部去**

```sh
.env.production
```
