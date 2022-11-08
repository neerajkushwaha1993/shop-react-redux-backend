import type { AWS } from '@serverless/typescript';
import getProductList from '@functions/getProductList';
import getProductListById from '@functions/getProductListById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from "@functions/catalogBatchProcess";

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
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SQS_URL: {
        Ref: "SQSQueue",
      },
      SNS_ARN: {
        Ref: "CreateProductTopic"
      }
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
        },
        {
          Effect: "Allow",
          Action: "sqs:*",
          Resource: { "Fn::GetAtt": ["SQSQueue", "Arn"] },
        },
        {
          Effect: "Allow",
          Action: ["sns:*"],
          Resource: {
            Ref: "CreateProductTopic",
          },
        }],
      },
    }
  },


  // import the function via paths
  functions: { getProductList, getProductListById, createProduct, catalogBatchProcess },
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
      },
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "CatalogItemsQueue",
        },
      },
      CreateProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "CreateProductTopic",
        },
      },
      CreateProductSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "neeraj_kushwaha@epam.com",
          Protocol: "email",
          TopicArn: {
            Ref: "CreateProductTopic"
          },
        }
      }
    }

  }
};

module.exports = serverlessConfiguration;
