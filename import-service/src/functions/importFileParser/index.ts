import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: 'import-service-aws-bucket',
        event: 's3:ObjectCreated:*',
        rules: [{
          prefix: "uploaded/"
        }],
        existing: true
      },
    },
  ],
};
