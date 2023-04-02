import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_secretsmanager as sm } from 'aws-cdk-lib';
import { aws_route53 as route53 } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_certificatemanager as certmanager } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_route53_targets as targets } from 'aws-cdk-lib';
import { aws_s3_deployment as deploy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');

const WEB_APP_DOMAIN = "hire-me-gw.tjl2.uk";
export class CneApplicationCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {env: { 
      account: "876736351564", 
      region: "eu-west-2" 
    }});

    // The code that defines your stack goes here

    // Import the OpenAI API key from Secrets Manager
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
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*']
      }
    });

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: "tjl2.uk",
    });
    // Deploy the react app to S3\CloudFront

    // Create a new S3 bucket
    const bucket = new s3.Bucket(this, 'ReactAppBucket', {
      bucketName: WEB_APP_DOMAIN,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create a new certificate
    const certificate = new certmanager.DnsValidatedCertificate(this, 'ReactAppCertificate', {
      domainName: WEB_APP_DOMAIN,
      hostedZone: zone,
      region: 'us-east-1', // using deprecated DnsValidatedCertificate, because I don't know how to force regio to us-east-1 otherwise
    });

    // Create CloudFront Distribution
    const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
      originConfigs: [{
          customOriginSource: {
              domainName: bucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
          },
          behaviors: [{
              isDefaultBehavior: true
          }]
      }],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
          aliases: [WEB_APP_DOMAIN],
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          sslMethod: cloudfront.SSLMethod.SNI
      })
    });

    //Create A Record Custom Domain to CloudFront CDN
    new route53.ARecord(this, "SiteRecord", {
      recordName: WEB_APP_DOMAIN,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
      zone
    });
    
    // Deploy the react app from the GitHub repo to the S3 bucket
    
}
