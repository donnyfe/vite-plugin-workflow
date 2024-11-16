import * as childProcess from 'child_process'

export const execCommand = async (command: string): Promise<{ stdout: string; stderr: string }> => {
	return new Promise((resolve, reject) => {
		let stdout = ''
		let stderr = ''

		const pro = childProcess.exec(command, err => {
			if (err) reject(err)
		})

		pro.stdout?.on('data', data => {
			stdout += data
			process.stdout.write(data)
		})

		pro.stderr?.on('data', data => {
			stderr += data
			process.stderr.write(data)
		})

		pro.on('exit', code => {
			if (code === 0) {
				resolve({ stdout, stderr })
			} else {
				reject(new Error(`命令执行失败,退出码: ${code}`))
			}
		})
	})
}
