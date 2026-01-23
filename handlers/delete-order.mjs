// handlers/delete-order.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

async function deleteOrder(orderID) {
  if (!orderID) {
    return { errorMessage: 'Invalid order ID' };
  }

  console.log('--> Deleting order:', orderID);

  try {
    await docClient.send(new DeleteCommand({
      TableName: 'pizza-orders',
      Key: { orderId: orderID.toString() }
    }));

    console.log('--> Order deleted successfully');
    return { message: 'Order with ID:' + orderID + ' deleted successfully' };
  } catch (error) {
    console.error('--> Error deleting order:', error);

    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }

    return { errorMessage: 'Failed to delete order' };
  }
}

export default deleteOrder;


// ----------------------------------------------------------------
// Старий код для видалення замовлення з локального сховища
// ----------------------------------------------------------------
// import { orders } from '../stores/order.store.mjs';

// function deleteOrder(orderID) {
//   const orderIndex = orders.findIndex(order => order.id === orderID);
//   if (orderIndex === -1) {
//     return -1;
//   }
//   orders.splice(orderIndex, 1);
//   return orders;
// }

// export default deleteOrder;