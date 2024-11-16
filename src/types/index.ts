export interface ServerOptions {
	host: string // 服务器地址
	port: number // 端口号,默认22
	username: string // 用户名
	password?: string // 密码
	privateKey?: string // 私钥路径
	remotePath: string // 远程部署路径
	localPath?: string // 本地打包路径,默认 dist
	backup?: boolean // 是否备份,默认 false
}

export interface NpmOptions {
	defaultRegistry?: string // 默认源
	publishRegistry?: string // 发布源
	publishScope?: string // 发布范围
}
