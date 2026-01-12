// handlers/delete-order.mjs
import { orders } from '../stores/order.store.mjs';

function deleteOrder(orderID) {
  const orderIndex = orders.findIndex(order => order.id === orderID);
  if (orderIndex === -1) {
    return -1;
  }
  orders.splice(orderIndex, 1);
  return orders;
}

export default deleteOrder;