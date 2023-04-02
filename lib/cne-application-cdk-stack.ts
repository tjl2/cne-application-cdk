import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_secretsmanager as sm } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CneApplicationCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CneApplicationCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const openaiSecret = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
      secretCompleteArn:
        "arn:aws:secretsmanager:eu-west-2:876736351564:secret:OpenAI-API-VP9BIQ"
    });

    // Create the BlackLibrarySYnopsis (Elixir) lambda function
    const lambdaFunction = new lambda.Function(this, 'BlackLibrarySynopsisLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/openai-lambda')),
      handler: 'index.handler',
      environment: {
        OPENAI_API_KEY: openaiSecret.secretValue.unsafeUnwrap()
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Create a function URL for the lambda function
    const lambdaFunctionUrl = new lambda.FunctionUrl(this, 'BlackLibrarySynopsisLambdaUrl', {
      function: lambdaFunction,
      authType: lambda.FunctionUrlAuthType.NONE
    });

  }
}
