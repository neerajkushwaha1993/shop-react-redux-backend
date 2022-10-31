import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { db, ProductsTableName, StocksTableName } from 'src/utils/dynamoDB';
import { DEFAULT_HEADERS } from 'src/utils/common';


const getProduct = async (id:string) => {
  return await db
    .get({
      TableName: ProductsTableName,
      Key: {
        id,
      },
    })
    .promise();
};

const getStock = async (product_id:string) => {
  return await db
    .get({
      TableName: StocksTableName,
      Key: {
        product_id,
      },
    })
    .promise();
};

const getProductListById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const id = event.pathParameters.id;

  const [product, stock] = await Promise.all([getProduct(id), getStock(id)]);

  if (product.Item && stock.Item) {
    const item = { ...product.Item, count: stock.Item.count || 0 };
    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(item),
    };
  } else {
    return {
      statusCode: 404,
      headers: DEFAULT_HEADERS,
      body: 'Product not found',
    };
  }
};

export const main = middyfy(getProductListById);
