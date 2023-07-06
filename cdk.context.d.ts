export type CDKContext = {
	account: string
	appName: string
	appDescription: string
	stage: envNameContext
	branchName: branchNameContext
	region: string
	github: githubContext
}

export type envNameContext = 'prod' | 'dev'
export type githubContext = { username: string; repo: string }
export type branchNameContext = 'main' | 'develop'
