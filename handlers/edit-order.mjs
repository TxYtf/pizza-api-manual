// handlers/edit-order.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

async function editOrder(orderID, orderData) {
  if (!orderID || !orderData) {
    return { errorMessage: 'Invalid order ID or data' };
  }

  console.log('--> Editing order:', orderID, orderData);

  try {
    // Отримуємо існуюче замовлення
    const getResult = await docClient.send(new GetCommand({
      TableName: 'pizza-orders',
      Key: { orderId: orderID.toString() }
    }));

    if (!getResult.Item) {
      return { errorMessage: 'Order not found' };
    }

    // Оновлюємо замовлення
    const updatedOrder = {
      ...getResult.Item,    // Зберігаємо ВСІ існуючі поля
      ...orderData,         // Оновлюємо тільки передані поля
      orderId: getResult.Item.orderId // Зберігаємо оригінальний ID
    };

    await docClient.send(new PutCommand({
      TableName: 'pizza-orders',
      Item: updatedOrder
    }));

    console.log('--> Order updated successfully');
    return updatedOrder;
  } catch (error) {
    console.error('--> Error editing order:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to edit order' };
  }
}

export default editOrder;


// ---------------------------------------------------------------
// Старий підхід з використанням локального масиву
// ---------------------------------------------------------------
// import { orders } from '../stores/order.store.mjs';

// function editOrder(orderID, orderData) {
//   const orderIndex = orders.findIndex(order => order.id === orderID);
//   if (orderIndex === -1) {
//     return -1;
//   }

//   const existingOrder = orders[orderIndex];
//   const updatedOrder = {
//     ...existingOrder,
//     ...orderData,
//     id: existingOrder.id // Забезпечуємо, що ID не зміниться
//   };

//   orders[orderIndex] = updatedOrder;
//   return updatedOrder;
// }

// export default editOrder;
// ---------------------------------------------------------------