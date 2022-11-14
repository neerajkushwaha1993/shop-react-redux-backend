import * as AWS from "aws-sdk";
import { Product } from "src/utils/types";

const { SNS_ARN } = process.env;

export const publish = async (product: Product) => {
  const sns = new AWS.SNS({ region: "eu-east-1" });

  await sns.publish(
    {
      Subject: 'New product was added.',
      Message: JSON.stringify(product),
      TopicArn: SNS_ARN,
    },() => {
      console.log("Email has been successfully sent");
    }
  ).promise();
}