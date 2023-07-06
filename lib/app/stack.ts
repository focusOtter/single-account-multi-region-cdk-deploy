import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as sqs from 'aws-cdk-lib/aws-sqs'

import { CDKContext } from '../../cdk.context'

export class AppStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		props: cdk.StackProps,
		context: CDKContext
	) {
		super(scope, id, props)

		// The code that defines your stack goes here

		// example resource
		const queue = new sqs.Queue(this, `AppQueue-${context.stage}`, {
			visibilityTimeout: cdk.Duration.seconds(300),
		})
	}
}
