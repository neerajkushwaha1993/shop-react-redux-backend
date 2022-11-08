import { DEFAULT_HEADERS } from 'src/utils/common';
import { APIGatewayProxyEvent } from "aws-lambda";
import { publish } from "src/utils/helpers";
import { Product } from "src/utils/types";
import { putProduct,putStock } from "@functions/createProduct/handler";

interface ICatalogBatchEvent extends APIGatewayProxyEvent {
  Records: {
    body: string;
  }[];
}

const catalogBatchProcess = async ({ Records }: ICatalogBatchEvent) => {
  try {
    await Promise.all(Records.map(async (record) => {
      const recordBody = JSON.parse(record.body);
      const { title, description, price, count } = recordBody;

      const product = {
        id: '',
        title,
        description,
        price,
      } as Product

      const id = await putProduct(product)

      await putStock({ product_id: id, count })

      await publish(product);
    }));

    console.log('sns queue publish completed');
  } catch (err) {
    return {
      statusCode: 500,
      headers: DEFAULT_HEADERS,
      body: err
    }
  }
}

export const main = catalogBatchProcess;