#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { getCDKContext } from '../utils'
import { AppStack } from '../lib/app/stack'
import { DeployGitHubRoleStack } from '../lib/deployment/stack'

const app = new cdk.App()
const context = getCDKContext(app)

//* Where the role will live. region doesnt matter since roles are global
//! This stack has to be manually deployed before the GitHub action can deploy the AppStack

new DeployGitHubRoleStack(app, 'DeployGitHubRoleStack', {
	env: {
		account: context.account,
		region: 'us-east-1',
	},
})

// todo: uncomment this stack after the role is manually deployed
// new AppStack(
// 	app,
// 	`AppStack`,
// 	{
// 		env: {
// 			account: context.account,
// 			region: context.region,
// 		},
// 	},
// 	context
// )
