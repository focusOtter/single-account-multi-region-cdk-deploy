# AWS CDK Deployments: Single Account, Multi-Region Starter
![Screenshot 2023-07-06 at 8 05 33 PM](https://github.com/focusOtter/single-account-multi-region-cdk-deploy/assets/5106417/d92dd143-401b-427f-bac3-253e80415b51)

AWS says it's a best practice to use SSO, deploy to multiple accounts, each account have different resources across different regions, use IaC etc...but let's face it, not everyone is there yet.

At each stage of your learning, AWS has options for you so that you can focus on building your applications with the tools you have available.

The purpose of this repo is to showcase how to deploy your CDK application to a single AWS account. When on the `develop` branch the resources will be named with a `-dev` suffix and deployed in one region, and when on the `main` branch resources will be named with a `-prod` suffix and deployed in a different region.

## Prereqs

This project uses Github Actions to deploy your application. However, instead of storing an AWS Access Key and Secret Key as a GitHub secret, GitHub is setup as a trusted OIDC provider.

0. [Setup an AWS account](https://youtu.be/FAfhMXUiLuU) and [secure it](https://youtu.be/UnqxiSJEZAk)
1. Install the AWS CDK (or use `npx`)
2. Bootstrap the regions you want to use: `npx aws-cdk bootstrap`
3. [Setup GitHub as an OIDC provider](https://github.com/focusOtter/github-aws-oidc-provider-cdk)
4. Deploy your multi-region AWS app 👈 **You are here**
   - update the context file (see context section)
   - manually deploy the `DeployGitHubRoleStack` (see Role Deployment section)
   - update the `.github/workflows/aws.yml` file (see GitHub Action section)
   - create a dev branch and deploy the stack

## Application Overview

### Context File

The heart of the repo is in the `cdk.context.json` file. You'll want to update this file with your specific project and AWS values.

> 🗒️ If you're wondering which AWS regions to deploy to, I do the following: the `dev` stage is where I deploy close to me and `prod` is where I deploy close to my customers. That is unless my customers are primarily based in us-east-1. Then I pick a different region since that one is typically the most volatile.

### Role Deployment

In `bin/single-account-multi-region-cdk-deploy.ts` you'll notice only the `DeployGitHubRoleStack` is set to be deployed. This stack creates the role needed to authorize GitHub to deploy on our behalf. Because of this, it has to be deployed manually so that when we deploy based on a commit message, GitHub can find the role.

`npx aws-cdk deploy --exclusively DeployGitHubRoleStack`

> 🗒️ The `--exclusively DeployGitHubRoleStack` flag is optional but ensures we only deploy the stacks we specify.

During the deployment, the stack uses the `utils.ts` file to get the current branch, and from there create a context object that contains the values we specified in the `cdk.context.d.ts` file.

A part to take note of is that when we deployed the role, the ARN of the role is printed in your terminal after completion

### GitHub Action

With the role created, we can now deploy our actual application stack(s). This project only comes with one Application stack that deploys and SQS queue, but this specific to you and the app your building.

All that needs to be done in this section is to update the `.github/workflows/aws.yml` file with the ARN of the newly created role and the region it was deployed in:

```yml
- name: Assume role using OIDC
  uses: aws-actions/configure-aws-credentials@master
  with:
    role-to-assume: arn:aws:iam::1234567890:role/REPO-NAME-github-ci-role
    aws-region: us-east-1
```

## FAQs

- Stacks are scope to a region. So as long as the regions are different, you're good.
- Most services are region specific, however some (like S3 buckets are global), be sure that the name of these resources contains a dynamic value to avoid overwriting resources
- Branch protection rules in GitHub go a long way. The easiest is to go to the repo settings and make sure no one can directly commit to the `main` branch.
