import type { Plugin } from 'vite'
import type { NpmOptions } from '@/types'
import { execCommand } from '@/utils'

async function checkNpmLogin() {
	try {
		const { stdout } = await execCommand('npm whoami')
		return stdout.trim() !== ''
	} catch (error) {
		return false
	}
}

async function deploy(options: NpmOptions) {
	// 切换发布源
	const { defaultRegistry, publishRegistry, publishScope } = options
	await execCommand(`npm config set registry=${publishRegistry}`)
	console.log('🔗 切换NPM发布源')

	// 检测登录状态
	const isLogin = await checkNpmLogin()
	if (!isLogin) {
		await execCommand('npm login')
		console.log('🔑 登录NPM成功')
	}

	// 发布
	try {
		const publishCmd = publishScope ? `npm publish --access ${publishScope}` : 'npm publish'
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

export function deployToNpm(options: NpmOptions): Plugin {
	return {
		name: 'vite-plugin-workflow-deploy-to-npm',
		apply: 'build',
		closeBundle: async () => {
			await deploy(options)
		}
	}
}
