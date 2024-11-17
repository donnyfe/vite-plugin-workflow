import type { Plugin } from 'vite'
import type { NpmOptions } from '@/types'
import { execCommand } from '@/utils'

/**
 * 发布到NPM
 * @param options - 配置
 * @returns - 插件
 */
export function deployToNpm(options: NpmOptions): Plugin {
	return {
		name: 'vite-plugin-workflow-deploy-to-npm',
		apply: 'build',
		closeBundle: async () => {
			const { defaultRegistry, registry, access } = options
			// 发布源，默认使用 npm 官方镜像源
			const publishRegistry = registry || 'https://registry.npmjs.org'
			try {
				// 1. 切换发布源
				await execCommand(`npm config set registry=${publishRegistry}`)
				console.log(`🔗 切换NPM发布源为: ${publishRegistry}`)

				// 2. 检测登录状态并处理登录
				let isLoggedIn = false
				try {
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
				console.log('🎉 NPM发布成功')
			} catch (error) {
				console.error('🚨 NPM发布流程失败:', error)
				throw error
			} finally {
				// 5. 切换回默认源
				await execCommand(`npm config set registry=${defaultRegistry}`)
				console.log(`🔗 已切换回默认NPM源: ${defaultRegistry}`)
			}
		}
	}
}
