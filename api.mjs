'use strict';

import getPizzas from './handlers/get-pizzas.mjs';
import getOrders from './handlers/get-orders.mjs';

import addPizza from './handlers/create-pizza.mjs';
import createOrder from './handlers/create-order.mjs';

import editPizza from './handlers/edit-pizza.mjs';
import editOrder from './handlers/edit-order.mjs';

import deletePizza from './handlers/delete-pizza.mjs';
import deleteOrder from './handlers/delete-order.mjs';

const MAX_BODY_SIZE = 10_000;

// Допоміжна функція для валідації Pizza ID
function validateId(pathParams) {
  if (!pathParams || !pathParams.id) {
    return { isValid: false, error: 'ID is required' };
  }
  const id = Number(pathParams.id);
  if (isNaN(id)) {
    return { isValid: false, error: 'Invalid ID' };
  }
  return { isValid: true, id };
}

// Допоміжна функція для парсингу тіла запиту (JSON)
function parseRequestBody(event) {
  let response = {};
  try {
    const body = event.body || '{}';
    // Validate content type (case-insensitive)
    let contentTypeValue = '';
    for (const key in event.headers || {}) {
      if (key.toLowerCase() === 'content-type') {
        contentTypeValue = event.headers[key];
        break;
      }
    }

    if (!contentTypeValue.toLowerCase().startsWith('application/json')) {
      return { error: 'Invalid content type!' };
    }
    // Limit body size
    if (body.length > MAX_BODY_SIZE) {
      return { error: 'Request body too large' };
    }
    response = JSON.parse(body);
  } catch (err) {
    console.error('JSON parsing error:', err.message);
    response = { error: 'Invalid JSON format' };
  }

  return response;
}

// Допоміжна функція для валідації даних піци
// для методів POST та PUT
// function validatePizzaPayload(data) {
//   if (!data.name || typeof data.name !== 'string') {
//     return 'Invalid pizza name';
//   }
//   if (typeof data.price !== 'number' || data.price <= 0) {
//     return 'Invalid pizza price';
//   }
//   return null;
// }

// =========================================================================
// Основний код обробника Lambda API
// =========================================================================
export async function handler(event) {
  console.log('--> Method:', event.httpMethod);
  console.log('--> Path:', event.resource);
  console.log('--> Body:', event.body);
  console.log('--> Headers:', event.headers);
  console.log('--> Path Parameters:', event.pathParameters);

  let pizzaItems = null;
  let orderItems = null;
  let statusCode = null;
  let body = null;

  const method = event.httpMethod;        // GET, POST, PUT, DELETE
  const path = event.resource;            // наприклад "/pizzas" або "/pizza/{id}"
  const pathParams = event.pathParameters; // { id: "2" } якщо URL /pizza/2

  switch (method) {
    // =========================
    // CORS Preflight - про всяк випадок (насправді налаштування CORS вже є в API Gateway)
    // =========================    
    case 'OPTIONS':
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        body: ''
      };

    // =========================
    // 1) GET /, GET /pizzas, GET /pizza/{id}, GET /orders, GET /order/{id}, GET /order-date/{date}
    // =========================
    case 'GET':
      switch (path) {
        case '/':
          pizzaItems = 'Welcome to Pizza API';
          statusCode = 200;
          body = JSON.stringify(pizzaItems);
          break;
        case '/pizzas':
          pizzaItems = getPizzas('all');
          statusCode = 200;
          body = JSON.stringify(pizzaItems);
          break;
        case '/pizza/{id}':
          const validatedPizza = validateId(pathParams);
          if (!validatedPizza.isValid) {
            statusCode = 400;
            body = JSON.stringify({ error: validatedPizza.error });
          } else {
            pizzaItems = getPizzas(validatedPizza.id);
            if (pizzaItems !== null) {
              statusCode = 200;
              body = JSON.stringify(pizzaItems);
            } else {
              statusCode = 404;
              body = JSON.stringify({ error: 'Pizza not found' });
            }
          }
          break;
        case '/orders':
          orderItems = getOrders('all');
          statusCode = 200;
          body = JSON.stringify(orderItems);
          break;
        case '/order/{id}':
          const validatedOrder = validateId(pathParams);
          if (!validatedOrder.isValid) {
            statusCode = 400;
            body = JSON.stringify({ error: validatedOrder.error });
          } else {
            orderItems = getOrders(validatedOrder.id, null);
            if (orderItems !== null) {
              statusCode = 200;
              body = JSON.stringify(orderItems);
            } else {
              statusCode = 404;
              body = JSON.stringify({ error: 'Order not found' });
            }
          }
          break;
        case '/order-date/{date}':
          orderItems = getOrders(null, pathParams.date);
          if (orderItems !== null) {
            statusCode = 200;
            body = JSON.stringify(orderItems);
          } else {
            statusCode = 404;
            body = JSON.stringify({ error: 'No orders found for this date' });
          }
          break;
        default:
          statusCode = 404;
          body = JSON.stringify({ error: 'Pizza/Order not Found' });
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
            statusCode = 400;
            body = JSON.stringify({ error: newPizzaData.error });
          } else {
            const newPizza = addPizza(newPizzaData);
            statusCode = 201;
            body = JSON.stringify({ message: 'Елемент створено', pizza: newPizza });
          }
          break;
        case '/order':
          const orderData = parseRequestBody(event);
          if (orderData.error) {
            statusCode = 400;
            body = JSON.stringify({ error: orderData.error });
          } else {
            const newOrder = createOrder(orderData);
            if (newOrder.errorMessage) {
              statusCode = 400;
              body = JSON.stringify({ error: newOrder.errorMessage });
            } else {
              statusCode = 201;
              body = JSON.stringify({ message: 'Замовлення створено', order: newOrder });
            }
          }
          break;
        default:
          statusCode = 404;
          body = JSON.stringify({ error: 'Нерозпізнаний маршрут для POST' });
      }
      break;

    // =========================
    // 3) PUT /pizza/{id}
    // =========================
    //      event.resource === "/pizza/{id}" під час налаштування в API Gateway
    case 'PUT':
      if (path === '/pizza/{id}') {
        const validated = validateId(pathParams);
        if (!validated.isValid) {
          statusCode = 400;
          body = JSON.stringify({ error: validated.error });
        } else {
          const updatedData = parseRequestBody(event);

          if (updatedData.error) {
            statusCode = 400;
            body = JSON.stringify({ error: updatedData.error });
          } else {
            const existingPizza = editPizza(validated.id, updatedData);

            if (existingPizza === -1) {
              statusCode = 404;
              body = JSON.stringify({ error: 'Елемент не знайдено' });
            } else {
              statusCode = 200;
              body = JSON.stringify({ message: 'Елемент оновлено', pizza: existingPizza });
            }
          }
        }
      }  else if (path === '/order/{id}') {
        const validated = validateId(pathParams);
        if (!validated.isValid) {
          statusCode = 400;
          body = JSON.stringify({ error: validated.error });
        } else {
          const updatedData = parseRequestBody(event);

          if (updatedData.error) {
            statusCode = 400;
            body = JSON.stringify({ error: updatedData.error });
          } else {
            const existingOrder = editOrder(validated.id, updatedData);

            if (existingOrder === -1) {
              statusCode = 404;
              body = JSON.stringify({ error: 'Замовлення не знайдено' });
            } else {
              statusCode = 200;
              body = JSON.stringify({ message: 'Замовлення оновлено', order: existingOrder });
            }
          }
        }
      }
      break;

    // =========================
    // 4) DELETE /pizza/{id}
    // =========================
    case 'DELETE':
      if (path === '/pizza/{id}') {
        const validated = validateId(pathParams);
        if (!validated.isValid) {
          statusCode = 400;
          body = JSON.stringify({ error: validated.error });
        } else {
          const deletedPizza = deletePizza(validated.id);

          if (deletedPizza === -1) {
            statusCode = 404;
            body = JSON.stringify({ error: 'Елемент не знайдено' });
          } else {
            statusCode = 200;
            body = JSON.stringify({ message: 'Елемент видалено', pizza: deletedPizza });
          }
        }
      } else if (path === '/order/{id}') {
        const validated = validateId(pathParams);
        if (!validated.isValid) {
          statusCode = 400;
          body = JSON.stringify({ error: validated.error });
        } else {
          const deletedOrder = deleteOrder(validated.id);

          if (deletedOrder === -1) {
            statusCode = 404;
            body = JSON.stringify({ error: 'Замовлення не знайдено' });
          } else {
            statusCode = 200;
            body = JSON.stringify({ message: 'Замовлення видалено', order: deletedOrder });
          }
        }
      }
      break;

    // =========================
    // Якщо жоден із маршрутів не спрацював:
    // =========================
    default:
      if (!statusCode && !body) {
        statusCode = 404;
        body = JSON.stringify({ error: 'Нерозпізнаний запит' });
      }
  }

  return {
    statusCode,
    body,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
    }
  };
}