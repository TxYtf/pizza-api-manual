//import { orders } from '../stores/order.store.mjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
//import { randomUUID } from 'crypto';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

/**
  * @param {Object} order
  *  @param {number} order.pizzaID
  *  @param {string} order.address
  *  @param {string} order.customerName
  *  @param {string} order.phone
  *  @param {string} order.status
*/

async function createOrder(order) {
  if(!order || !order.pizzaID  || !order.address)
    return { "errorMessage": 'Invalid order' }; //throw new Error("Invalid order");

  //const newId = randomUUID(); // Приклад: "550e8400-e29b-41d4-a716-446655440000"
  //const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Приклад: "1705456789123-k2j3h4g5f"
  const newId = Date.now(); // Використовуємо поточний час у мілісекундах як унікальний ID
  const newOrder = {
    orderId: newId.toString(),
    pizzaID: order.pizzaID,
    address: order.address,
    customerName: order.customerName || `Customer ${newId}`,
    phone: order.phone || '',
    orderDate: new Date().toISOString(),
    status: order.status || 'pending'
  };
  //orders.push(newOrder);
  
  console.log(' ---> New order: ', newOrder);
  try {
    await docClient.send(new PutCommand({
      TableName: 'pizza-orders',
      Item: newOrder
    }));

    return newOrder;
  } catch (error) {
    console.error('--> Oops, order is not saved:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to save order(((' };
  }
}

export default createOrder;