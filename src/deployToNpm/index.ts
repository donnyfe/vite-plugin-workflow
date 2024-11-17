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
			try {
				// 1. 切换发布源
				await execCommand(`npm config set registry=${registry}`)
				console.log('🔗 切换NPM发布源成功')
			} catch (error) {
				console.log('🚨 切换NPM发布源失败')
				console.log(error)
				throw error
			}

			try {
				// 2. 检测登录状态
				const { stdout } = await execCommand('npm whoami')
				const username = stdout.trim()
				if (!username) {
					await execCommand('npm login')
					console.log('🔑 登录NPM成功')
				} else {
					console.log(`👤 当前登录用户: ${username}`)
				}
			} catch (error) {
				console.log('🚨 NPM登录失败')
			}

			// 3. 发布
			try {
				const publishCmd = access ? `npm publish --access ${access}` : 'npm publish'
				await execCommand(publishCmd)
				console.log('🎉 NPM发布成功')
			} catch (error) {
				console.log('🚨 NPM发布失败')
				console.log(error)
				throw error
			}

			// 切换回默认源
			await execCommand(`npm config set registry=${defaultRegistry}`)
			console.log('🔗 切换回默认NPM源')
		}
	}
}
