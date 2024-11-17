import type { Plugin } from 'vite'
import type { NpmOptions } from '@/types'
import { execCommand } from '@/utils'


async function deploy(options: NpmOptions) {
	const { defaultRegistry, registry, access } = options
	// 发布源，默认使用 npm 官方镜像源
	const publishRegistry = registry || 'https://registry.npmjs.org'
	try {
		// 1. 切换发布源
		await execCommand(`npm config set registry=${publishRegistry}`)

		console.log('\n')
		console.log(`🔗 切换NPM发布源为: ${publishRegistry}`)
		/**
		 * 清理缓存, 解决有时候缓存导致的问题，
		 * 会存在成功切换源后，执行npm whoami 引用的还是旧源的问题
		 * @link https://github.com/npm/npm/issues/17722
		 */
		await execCommand('npm cache clean --force')

		// 2. 检测登录状态并处理登录
		let isLoggedIn = false
		try {
			// 未登录前执行 npm whoami 命令会报错, 所以通过捕获错误来判断是否登录
			const { stdout } = await execCommand('npm whoami')
			const username = stdout.trim()
			console.log('\n')
			console.log(`👤 当前登录用户: ${username}`)
			isLoggedIn = true
		} catch (error) {
			console.log('\n')
			console.log('🚨 检测到未登录NPM,正在尝试登录...')

			// 尝试使用新的 web 登录方式
			try {
				await execCommand('npm login --auth-type=web')
				console.log('\n')
				console.log('🔑 NPM登录成功')
				isLoggedIn = true
			} catch (loginError) {
				console.log('\n')
				console.log('🚨 NPM自动登录失败,请手动执行 npm login 进行登录')
				throw loginError
			}
		}

		// 3. 确认登录成功后再执行发布
		if (!isLoggedIn) {
			throw new Error('NPM未登录,无法执行发布')
		}

		// 4. 发布
		const publishCmd = access ? `npm publish --access ${access}` : 'npm publish'
		await execCommand(publishCmd)

		/**
		 * 在 prepublishOnly 钩子执行时强制退出进程, 解决脚本有时候不会自动终止的问题
		 * 因为 prepublishOnly 钩子执行时，vite 的 build 流程已经结束，
		 * 所以需要强制退出进程，否则会导致后续的插件执行流程受到影响
		 * @link https://stackoverflow.com/questions/52861210/node-js-command-line-script-sometimes-does-not-terminate
		 */
		if (process.env.npm_lifecycle_event === 'prepublishOnly') {
			process.exit(0)
		}
		console.log('\n')
		console.log('🎉 NPM发布成功')
	} catch (error) {
		console.error('🚨 NPM发布流程失败:', error)
		throw error
	} finally {
		// 5. 切换回默认源
		const registry = defaultRegistry || 'https://registry.npmmirror.com'
		await execCommand(`npm config set registry=${registry}`)
		console.log(`🔗 已切换回默认NPM源: ${registry}`)
	}
}

/**
 * 发布到NPM
 * @param options - 配置
 * @returns - 插件
 */
export function deployToNpm(options: NpmOptions): Plugin {
	return {
		name: 'vite-plugin-workflow-deploy-to-npm',
		enforce: 'post',
		apply: 'build',
		closeBundle: () => {
			setTimeout(async () => {
				await deploy(options)
			}, 100)
		}
	}
}
