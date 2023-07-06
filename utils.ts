import { App, Stack } from 'aws-cdk-lib'
import { execSync } from 'child_process'
import { CDKContext } from './cdk.context'

export const getCurrentGitBranch = () => {
	// run a shell command to get the current git branch

	return execSync('git symbolic-ref --short HEAD').toString().trim()
}

export const getCDKContext = (scope: App | Stack) => {
	// get the environments and globals from the cdk.context.json file
	const environments = scope.node.tryGetContext('environments')
	const globals = scope.node.tryGetContext('globals')

	// find the current branch in the environments array
	const context = environments.find(
		(env: any) => env.branchName === getCurrentGitBranch()
	)

	// return the context object with the globals merged in
	return { ...globals, ...context } as CDKContext
}
