export const AWS = require('aws-sdk');
export const db = new AWS.DynamoDB.DocumentClient();

export const ProductsTableName = process.env.PRODUCTS_TABLE;
export const StocksTableName = process.env.STOCKS_TABLE;