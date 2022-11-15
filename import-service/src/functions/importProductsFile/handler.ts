import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { schema } from './schema';
import { DEFAULT_HEADERS } from 'src/utils/common';


const importProductFile: ValidatedEventAPIGatewayProxyEvent<
  typeof schema> = async (event) => {
    const S3 = require('aws-sdk/clients/s3');
    const BUCKET = 'import-service-aws-bucket';
    const s3 = new S3({ region: 'us-east-1' });

    let { name } = event.queryStringParameters;
    console.log(`uploaded/${name}`);
    let objectKey = `uploaded/${name}`;
    try {
      let params = {
        Bucket: BUCKET,
        Key: objectKey,
        Expires: 100
      }
      const signedUrl = s3.getSignedUrlPromise('putObject', params);
      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: signedUrl
      }
    }
    catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        headers: DEFAULT_HEADERS,
        body: 'Please check the logs'
      }
    }

  };

export const main = middyfy(importProductFile);
