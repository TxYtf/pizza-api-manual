import { orders } from '../stores/order.store.mjs';

function getOrders(orderID, orderDate) {
  if(!orderID) 
    return { "errorMessage": 'The order ID has not correct value' }; //orders;
  
  if (orderID === 'all') return orders;

  let order = null;
  if (orderID && !orderDate)
    order = orders.find(order => Number(order.id) === orderID);
  else if (!orderID && orderDate)
    order = orders.filter(order => order.date === orderDate);
  else if (orderID && orderDate)
    order = orders.find(order => Number(order.id) === orderID && order.date === orderDate);

  if (order)
    return order;
  else
    return { "errorMessage": 'The order you requested was not found' };
}

//------------------------------ test -------------------------------------
//let item = getOrders(1);
//console.log(`{ id: "${item.id}", date: "${item.date}", orderContent: [${item.content}], errorMessage: "${item.errorMessage}"`);
//-------------------------------------------------------------------------

export default getOrders;