import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { db,ProductsTableName,StocksTableName } from 'src/utils/dynamoDB';
import { DEFAULT_HEADERS } from 'src/utils/common';


const getProducts = async () => {
  return await db
      .scan({
          TableName: ProductsTableName,
      })
      .promise();
};


const getStocks = async () => {
  return await db
      .scan({
          TableName: StocksTableName,
      })
      .promise();
};

const mergeResults = (productItems, stockItems) => {
  const productsMap = new Map();

  productItems.forEach((product) => {
      const id = product.id;
      productsMap.set(id, product);
  });

  stockItems.forEach((stock) => {
      const id = stock.product_id;
      const item = productsMap.get(id);
      if (item) {
          item.count = stock.count;
          productsMap.set(id, item);
      }
  });

  return Array.from(productsMap.values());
};

const getProductList:ValidatedEventAPIGatewayProxyEvent<
typeof schema> = async () => {

  const [products, stocks] = await Promise.all([getProducts(), getStocks()]);
  const items = mergeResults(products.Items, stocks.Items);

  return {
    statusCode: 200,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(items)
  }
};

export const main = middyfy(getProductList);
