// handlers/edit-order.mjs
import { orders } from '../stores/order.store.mjs';

function editOrder(orderID, orderData) {
  const orderIndex = orders.findIndex(order => order.id === orderID);
    if (orderIndex === -1) {
        return -1;
    }

    const existingOrder = orders[orderIndex];
    const updatedOrder = {
        ...existingOrder,
        ...orderData,
        id: existingOrder.id // Забезпечуємо, що ID не зміниться
    };

    orders[orderIndex] = updatedOrder;
    return updatedOrder;
}

export default editOrder;