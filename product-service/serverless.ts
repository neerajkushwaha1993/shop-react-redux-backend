import type { AWS } from '@serverless/typescript';
import getProductList from '@functions/getProductList';
import getProductListById from '@functions/getProductListById';
import createProduct from '@functions/createProduct';

const serverlessConfiguration: AWS = {
  service: 'product-service',
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
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000'
    },
    stage: 'dev',
    region: 'us-east-1',
    iam: {
      role: {
        statements: [{
          Effect: "Allow",
          Action: [
            "dynamodb:DescribeTable",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          Resource: [
            { "Fn::GetAtt": ['products', 'Arn'] },
            { "Fn::GetAtt": ['stocks', 'Arn'] }
          ]
        }],
      },
    }
  },


  // import the function via paths
  functions: { getProductList, getProductListById, createProduct },
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
  resources: {
    Resources: {
      products: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: 'products',

        }
      },
      stocks: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [{
            AttributeName: "product_id",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "product_id",
            KeyType: "HASH"
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: 'stocks',

        }
      }
    }

  }
};

module.exports = serverlessConfiguration;
