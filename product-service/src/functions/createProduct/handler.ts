import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { AWS,db,ProductsTableName,StocksTableName } from 'src/utils/dynamoDB';
import { DEFAULT_HEADERS } from 'src/utils/common';
import { Product, Stock } from 'src/utils/types';

export const putProduct = async (item: Product) => {
    await db
        .put({
            TableName: ProductsTableName,
            Item: item,
        })
        .promise();
    return item.id
};

export const putStock = async (item: Stock) => {
    return await db
        .put({
            TableName: StocksTableName,
            Item: item,
        })
        .promise();
};

const isDataValid = (data) => {
    if (!data) return false;
    if (!data.title || typeof data.title !== 'string') return false;
    if (typeof data.description !== 'string') return false;
    if (typeof data.price !== 'number') return false;
    if (typeof data.count !== 'number') return false;

    return true;
};

const createProduct:ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event:any) => {
    const data = JSON.parse(event.body);

    if (!isDataValid(data)) {
        return {
            statusCode: 400,
            body: 'Product data is invalid.',
        };
    }

    const id = AWS.util.uuid.v4();

    const product = {
        id: id,
        price: data.price,
        title: data.title,
        description: data.description,
    };

    const stock = {
        product_id: id,
        count: data.count,
    };

    await Promise.all([putProduct(product), putStock(stock)]);

    return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ ...product, count: stock.count }),
    };
};

export const main = middyfy(createProduct);
