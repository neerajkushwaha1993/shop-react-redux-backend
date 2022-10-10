import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { products } from '../../mocks/data';
import schema from './schema';

const getProductListById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(products.filter((product) => product.id === event.pathParameters.productId))
  }
};

export const main = middyfy(getProductListById);
