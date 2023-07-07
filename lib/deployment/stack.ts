import * as cdk from 'aws-cdk-lib'
import {
	Effect,
	OpenIdConnectPrincipal,
	OpenIdConnectProvider,
	PolicyDocument,
	PolicyStatement,
	Role,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import { getCDKContext } from '../../utils'

export class DeployGitHubRoleStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)
		const context = getCDKContext(this)

		const provider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
			this,
			'GithubProvider',
			`arn:aws:iam::${context.account}:oidc-provider/token.actions.githubusercontent.com`
		)

		const ghUsername = context?.github.username!
		const repoName = context?.github.repo!

		const GitHubPrincipal = new OpenIdConnectPrincipal(provider).withConditions(
			{
				StringLike: {
					'token.actions.githubusercontent.com:sub': `repo:${ghUsername}/${repoName}:*`,
				},
			}
		)

		const gitHubActionsRole = new Role(this, 'GitHubActionsRole', {
			assumedBy: GitHubPrincipal,
			description:
				'Role assumed by GitHubPrincipal for deploying from CI using aws cdk',
			// this name is what gets referenced in the github action
			roleName: `${context?.github.repo}-github-ci-role`,
			maxSessionDuration: cdk.Duration.hours(1),
			inlinePolicies: {
				CdkDeploymentPolicy: new PolicyDocument({
					assignSids: true,
					statements: [
						new PolicyStatement({
							effect: Effect.ALLOW,
							actions: ['sts:AssumeRole'],
							resources: [`arn:aws:iam::${context.account}:role/cdk-*`],
						}),
					],
				}),
			},
		})

		new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
			value: gitHubActionsRole.roleArn,
		})
	}
}
