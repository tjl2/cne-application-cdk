import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CneApplicationCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CneApplicationCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // Create the BlackLibrarySYnopsis (Elixir) lambda function
    const lambdaFunction = new lambda.Function(this, 'CneApplicationCdkLambda', {
      runtime: lambda.Runtime.PROVIDED,
      code: lambda.Code.fromAsset('./elixir-lambda.zip'),
      handler: 'Elixir.BlackLibrarySynopsis:lambda_handler'
    });
  }
}
