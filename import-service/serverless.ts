import type { AWS } from '@serverless/typescript';
import importFileParser from '@functions/importFileParser';
import importProductsFile from '@functions/importProductsFile';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SQS_URL: 'https://sqs.us-east-1.amazonaws.com/691449872622/catalogItemsQueue',
    },
    stage: 'dev',
    region: 'us-east-1',
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: "arn:aws:s3:::import-service-aws-bucket"
          },
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject","s3:DeleteObject"],
            Resource: "arn:aws:s3:::import-service-aws-bucket"
          },
          {
            Effect: "Allow",
            Action: "s3:*",
            Resource: "arn:aws:s3:::import-service-aws-bucket/*"
          },
          {
            Effect: 'Allow',
            Action: 'sqs:*',
            Resource: 'arn:aws:sqs:us-east-1:691449872622:catalogItemsQueue',
          },
        ],
      },
    }
  },
  // import the function via paths
  functions: {
    importFileParser: { ...importFileParser },
    importProductsFile
  },

  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
