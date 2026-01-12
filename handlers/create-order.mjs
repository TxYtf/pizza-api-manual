// handlers/create-order.mjs
import { orders } from '../stores/order.store.mjs';

function createOrder(order) {
  if(!order || !order.pizzaID  || !order.address)
    return { "errorMessage": 'Invalid order' }; //throw new Error("Invalid order");

    // Простимухою: автоматично призначаємо новий id
  const newId = orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1;
  const newOrder = {
    id: newId,
    pizzaID: order.pizzaID,
    address: order.address,
    customerName: order.customerName || `Customer ${newId}`,
    phone: order.phone || '',
    orderDate: new Date().toISOString()
  };
  orders.push(newOrder);
  return newOrder;
}

export default createOrder;