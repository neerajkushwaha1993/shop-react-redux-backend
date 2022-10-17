import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../mocks/data';
import schema from './schema';

const getProductList:ValidatedEventAPIGatewayProxyEvent<
typeof schema> = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products)
  }
};

export const main = middyfy(getProductList);
