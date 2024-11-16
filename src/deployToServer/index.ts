import type { Plugin } from 'vite'
import type { ServerOptions } from '@/types'
import { NodeSSH } from 'node-ssh'
import * as fs from 'fs'
import path from 'path'

const ssh = new NodeSSH()

export function deployToServer(options: ServerOptions): Plugin {
	const { host, port, username, password, privateKey } = options

	return {
		name: 'vite-plugin-workflow-deploy-to-server',
		apply: 'build',
		closeBundle: async () => {
			// 读取私钥
			const key = privateKey && fs.readFileSync(privateKey, 'utf8')

			try {
				// 1. 连接服务器
				await ssh.connect({
					host,
					port: port || 22,
					username,
					password,
					privateKey: key
				})

				console.log('🚀 连接服务器成功')

				// 1. 备份
				if (options.backup) {
					const backupDir = `${options.remotePath}_backup_${new Date().toISOString().slice(0, 10)}`
					console.log('📦 备份远程目录:', backupDir)
					await ssh.execCommand(`cp -r ${options.remotePath} ${backupDir}`)
				}

				console.log('📁 本地路径:', options.localPath)
				console.log('📁 远程路径:', options.remotePath)

				// 3. 上传文件
				const localPath = path.resolve(process.cwd(), options.localPath || 'dist')

				// 3.1 确保远程目录存在
				await ssh.execCommand(`mkdir -p ${options.remotePath}`)

				// 3.2 清空远程目录
				await ssh.execCommand(`rm -rf ${options.remotePath}/*`)

				// 3.3 上传文件
				console.log('🚀 上传文件中……')
				await ssh.putDirectory(localPath, options.remotePath, {
					recursive: true,
					concurrency: 10
				})

				console.log('🎉 部署完成')
			} catch (error) {
				console.error('❌ 部署失败:', error)
			} finally {
				ssh.dispose()
			}
		}
	}
}
