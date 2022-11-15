import type { S3Event } from "aws-lambda";
import * as AWS from 'aws-sdk';

const importFileParser = async (event: S3Event) => {

  const S3 = require('aws-sdk/clients/s3');
  const BUCKET = 'import-service-aws-bucket';
  const csvParser = require('csv-parser');
  const s3 = new S3({ region: 'us-east-1' });
  const sqs = new AWS.SQS({ region: 'us-east-1' });

  for (const record of event.Records) {

    //Create read stream
    const params = {
      Bucket: BUCKET,
      Key: record.s3.object.key
    }
    console.log("Streaming File");
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream.pipe(csvParser()).on('data', (row) => {
      console.log("Parsed Data", row);
      const message = JSON.stringify(row);
      sqs.sendMessage(
        {
          QueueUrl: process.env.SQS_URL,
          MessageBody: message
        }, () => {
          console.log('Send message: ', message)
        }
      )
    }).on('end', () => {
      console.log("Reached End!")
    })

    // Copy object and delete object
    console.log("Copying file",record.s3.object.key);
    const fileName=record.s3.object.key.split('/').pop();
    console.log("file name",fileName);
    await s3.copyObject({
      Bucket: BUCKET,
      CopySource: BUCKET + '/' + record.s3.object.key,
      Key: record.s3.object.key.replace('uploaded', 'parsed')
    }).promise();

    console.log("Deleting file");
    await s3.deleteObject({
      Bucket: BUCKET,
      Key: `parsed/${fileName}`
    }).promise();

    console.log('Parsed file' + record.s3.object.key.split('/')[1] + 'is created')
  }
};

export const main = importFileParser;
