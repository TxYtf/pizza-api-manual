'use strict';

import getPizzas from './handlers/get-pizzas.mjs';
import getOrders from './handlers/get-orders.mjs';

import addPizza from './handlers/create-pizza.mjs';
import createOrder from './handlers/create-order.mjs';

import editPizza from './handlers/edit-pizza.mjs';
import editOrder from './handlers/edit-order.mjs';

import deletePizza from './handlers/delete-pizza.mjs';
import deleteOrder from './handlers/delete-order.mjs';

import { validateId, parseRequestBody, createResponse } from './utils/helpers.mjs';

import Router from './routes/router.mjs';
import router from './routes/routes.mjs';

const MAX_BODY_SIZE = 10_000;


// =========================================================================
// Основний код обробника Lambda API
// =========================================================================
export async function handler(event) {

  console.log('--> API request event:', {
    method: event.httpMethod,
    path: event.resource,
    pathParameters: event.pathParameters,
    body: event.body,
    headers: event.headers,
    stage: event.requestContext?.stage
  });

  let pizzaItems = null;
  let orderItems = null;
  let statusCode = null;
  let body = null;
  let bodyObject = null; // Змінна для зберігання об'єкта відповіді
  let validated = null; // Змінна для зберігання результату валідації ID

  const method = event.httpMethod;        // GET, POST, PUT, DELETE
  const path = event.resource;            // наприклад "/pizzas" або "/pizza/{id}"
  const pathParams = event.pathParameters; // { id: "2" } якщо URL /pizza/2

  try {
    switch (method) {
      // =========================
      // CORS Preflight - про всяк випадок (насправді налаштування CORS вже є в API Gateway)
      // =========================    
      case 'OPTIONS':
        return createResponse(200, {});

      // =========================
      // 1) GET /, GET /pizzas, GET /pizza/{id}, GET /orders, GET /order/{id}, GET /order-date/{date}
      // =========================
      case 'GET':
        validated = validateId(pathParams);
        switch (path) {
          case '/':
            return createResponse(200, 'Welcome to Pizza API');
          case '/pizzas':
            pizzaItems = await getPizzas('all');
            return createResponse(200, pizzaItems);
          case '/pizza/{id}':
            if (!validated.isValid) {
              return createResponse(400, { error: validated.error });
            } else {
              pizzaItems = await getPizzas(validated.id);
              if (pizzaItems !== null) {
                return createResponse(200, pizzaItems);
              } else {
                return createResponse(404, { error: '>>>> Pizza not found' });
              }
            }
          case '/orders':
            // Всі замовлення
            orderItems = await getOrders('all');
            return createResponse(200, orderItems);
          case '/order/{id}':
            // const validated = validateId(pathParams);
            if (!validated.isValid) {
              return createResponse(400, { error: validated.error });
            } else {
              orderItems = await getOrders(validated.id);
              if (orderItems && !orderItems.errorMessage) {
                return createResponse(200, orderItems);
              } else {
                return createResponse(404, { error: '>>>> Order not found' });
              }
            }
          case '/orders-date/{date}':
            orderItems = await getOrders(null, pathParams.date);
            if (orderItems && orderItems.length > 0) {
              return createResponse(200, orderItems);
            } else {
              return createResponse(404, { error: '>>>> No orders found for this date' });
            }
          case '/orders-phone/{phone}':
            orderItems = await getOrders(null, null, pathParams.phone);
            const hasItems = Array.isArray(orderItems) && orderItems.length > 0;

            statusCode = hasItems ? 200 : 404;
            bodyObject = hasItems ? orderItems : { error: '>>>> No orders found for this phone' };
            return createResponse(statusCode, bodyObject);
          case '/orders-address/{address}':
            orderItems = await getOrders(null, null, null, decodeURIComponent(pathParams.address));
            statusCode = orderItems.length > 0 ? 200 : 404;
            bodyObject = orderItems.length > 0 ? orderItems : { error: '>>>> No orders found for this address' };
            return createResponse(statusCode, bodyObject);

          case '/orders-customer/{customerName}':
            orderItems = await getOrders(null, null, null, null, decodeURIComponent(pathParams.customerName));
            statusCode = orderItems.length > 0 ? 200 : 404;
            bodyObject = orderItems.length > 0 ? orderItems : { error: '>>>> No orders found for this customer' };
            return createResponse(statusCode, bodyObject);

          case '/orders-pizza/{pizzaID}':
            const pizzaId = parseInt(pathParams.pizzaID);
            if (isNaN(pizzaId)) {
              return createResponse(400, { error: '>>>> Invalid pizza ID' });
            } else {
              orderItems = await getOrders(null, null, null, null, null, pizzaId);
              statusCode = orderItems.length > 0 ? 200 : 404;
              bodyObject = orderItems.length > 0 ? orderItems : { error: '>>>> No orders found for this pizza' };
            }
            break;

          case '/orders-status/{status}':
            const statusValue = pathParams.status;
            if (statusValue !== 'pending' && statusValue !== 'completed') {
              return createResponse(400, { error: '>>>> Invalid status value' });
            } else {
              orderItems = await getOrders(null, null, null, null, null, null, statusValue);
              statusCode = orderItems.length > 0 ? 200 : 404;
              bodyObject = orderItems.length > 0
                              ? orderItems
                              : { error: '>>>> No orders found for this status' };
            }
            return createResponse(statusCode, bodyObject);

          default:
            return createResponse(404, { error: '>>>> Order not Found' });
        }
        break;

      // =========================
      // 2) POST /pizza, POST /order
      // =========================
      case 'POST':
        switch (path) {
          case '/pizza':
            const newPizzaData = parseRequestBody(event);
            if (newPizzaData.error) {
              return createResponse(400, { error: newPizzaData.error });
            } else {
              const newPizza = await addPizza(newPizzaData);
              if (newPizza.errorMessage) {
                return createResponse(400, { error: newPizza.errorMessage });
              } else {
                return createResponse(201, { message: 'Pizza created successfully', pizza: newPizza });
              }
            }
            break;
          case '/order':
            const orderData = parseRequestBody(event);
            if (orderData.error) {
              return createResponse(400, { error: orderData.error });
            } else {
              const newOrder = await createOrder(orderData);
              if (newOrder.errorMessage) {
                return createResponse(400, { error: newOrder.errorMessage });
              } else {
                return createResponse(201, { message: 'Order created successfully', order: newOrder });
              }
            }
            break;
          default:
            return createResponse( 404, { error: '>>>> Unknown resource for POST method' });
        }
        break;

      // =========================
      // 3) PUT /pizza/{id}
      // =========================
      //      event.resource === "/pizza/{id}" під час налаштування в API Gateway
      case 'PUT':
        validated = validateId(pathParams);
        if (path === '/pizza/{id}') {
          // validated = validateId(pathParams);
          if (!validated.isValid) {
            return createResponse(400, { error: validated.error });
          } else {
            const updatedData = parseRequestBody(event);

            if (updatedData.error) {
              return createResponse(400, { error: updatedData.error });
            } else {
              const existingPizza = await editPizza(validated.id, updatedData);

              if (existingPizza === -1) {
                return createResponse(404, { error: '>>>> Pizza not found' });
              } else {
                return createResponse(200, { message: 'Pizza updated successfully', pizza: existingPizza });
              }
            }
          }
        }  else if (path === '/order/{id}') {
          // validated = validateId(pathParams);
          if (!validated.isValid) {
            return createResponse(400, { error: validated.error });
          } else {
            const updatedData = parseRequestBody(event);

            if (updatedData.error) {
              return createResponse(400, { error: updatedData.error });
            } else {
              const existingOrder = await editOrder(validated.id, updatedData);

              if (existingOrder === -1) {
                return createResponse(404, { error: '>>>> Order not found' });
              } else {
                return createResponse(200, { message: 'Order updated successfully', order: existingOrder });
              }
            }
          }
        }
        break;

      // =========================
      // 4) DELETE /pizza/{id}
      // =========================
      case 'DELETE':
        validated = validateId(pathParams);
        if (path === '/pizza/{id}') {
          //validated = validateId(pathParams);
          if (!validated.isValid) {
            return createResponse(400, { error: validated.error });
          } else {
            const deletedPizza = await deletePizza(validated.id);

            if (deletedPizza === -1) {
              return createResponse(404, { error: '>>>> Pizza not found' });
            } else {
              return createResponse(200, { message: 'Pizza deleted successfully', pizza: deletedPizza });
            }
          }
        } else if (path === '/order/{id}') {
          //validated = validateId(pathParams);
          if (!validated.isValid) {
            return createResponse(400, { error: validated.error });
          } else {
            const deletedOrder = await deleteOrder(validated.id);

            if (deletedOrder === -1) {
              return createResponse(404, { error: '>>>> Order not found' });
            } else {
              return createResponse(200, { message: 'Order deleted successfully', order: deletedOrder });
            }
          }
        }
        break;

      // =========================
      // Якщо жоден із маршрутів не спрацював:
      // =========================
      default:
        if (!statusCode && !body) {
          return createResponse(405, { error: '>>>> Unknown method' });
        }
    }
  } catch (error) {
    console.error('>>>> Handler error:', error);
    return createResponse(500, { error: '>>>> Internal server error' });

  }

  return createResponse(statusCode, bodyObject);
}
