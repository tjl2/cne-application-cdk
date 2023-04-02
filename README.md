# AWS CDK (Typescript) - React App

This repo contains the CDK code for deploying my React app ([tjl2/cne-application](https://github.com/tjl2/cne-application)) to AWS.

It also contains the JS code for the Lambda function that communicates with OpenAI for Black Library synopsis generation (`src/openai-lambda`).

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npm run build-react-app` grab the latest version of the React app from GitHub and build it
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
