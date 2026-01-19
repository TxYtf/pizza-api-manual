import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

/**
  * Отримує замовлення з DynamoDB за різними критеріями
  * @param {string|null} orderId - ID конкретного замовлення
  * @param {string|null} orderDate - Дата для пошуку (YYYY-MM-DD або ISO string)
  * @param {string|null} phone - Номер телефону замовника
  * @param {string|null} address - Адреса замовника
  * @param {string|null} customerName - Ім'я замовника
  * @param {number|null} pizzaID - ID піци
  * @param {string|null} status - Статус замовлення ('pending', 'completed', etc.)
  *   @returns {Promise<Object|Array|null>} Замовлення або масив замовлень
*/
async function getOrders(orderId = null, orderDate = null, phone = null, address = null, customerName = null, pizzaID = null, status = null) {
  console.log('--> Getting orders with params:', { orderId, orderDate, phone, address, customerName, pizzaID, status });

  try {
    // Пошук конкретного замовлення за ID
    if (orderId && orderId !== 'all') {
      const result = await docClient.send(new GetCommand({
        TableName: 'pizza-orders',
        Key: { orderId: orderId.toString() }
      }));
      
      return result.Item || null;
    }

    // Сканування всіх замовлень з фільтрацією
    const scanParams = {
      TableName: 'pizza-orders'
    };

    // Будуємо фільтр для сканування
    const filterExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Створюємо масив параметрів для обробки
    const filterParams = [
      { value: orderDate, type: 'orderDate' },
      { value: phone, type: 'phone' },
      { value: address, type: 'address' },
      { value: customerName, type: 'customerName' },
      { value: pizzaID, type: 'pizzaID' },
      { value: status, type: 'status' }
    ];

    // Обробляємо кожен параметр через switch-case
    filterParams.forEach(param => {
      if (!param.value) return;

      switch (param.type) {
        case 'orderDate':
          const targetDate = param.value.includes('T') ? param.value.split('T')[0] : param.value;
          filterExpressions.push('begins_with(orderDate, :orderDate)');
          expressionAttributeValues[':orderDate'] = targetDate;
          break;

        case 'phone':
          filterExpressions.push('phone = :phone');
          expressionAttributeValues[':phone'] = param.value;
          break;

        case 'address':
          filterExpressions.push('contains(address, :address)');
          expressionAttributeValues[':address'] = param.value;
          break;

        case 'customerName':
          filterExpressions.push('contains(customerName, :customerName)');
          expressionAttributeValues[':customerName'] = param.value;
          break;

        case 'pizzaID':
          filterExpressions.push('pizzaID = :pizzaID');
          expressionAttributeValues[':pizzaID'] = parseInt(param.value);
          break;

        case 'status':
          filterExpressions.push('#status = :status');
          expressionAttributeNames['#status'] = 'status';
          expressionAttributeValues[':status'] = param.value;
          break;

        default:
          console.warn(`Unknown filter type: ${param.type}`);
      }
    });

    // Додаємо фільтри до запиту
    if (filterExpressions.length > 0) {
      scanParams.FilterExpression = filterExpressions.join(' AND ');
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
      
      if (Object.keys(expressionAttributeNames).length > 0) {
        scanParams.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    console.log('--> Scan params:', scanParams);

    const result = await docClient.send(new ScanCommand(scanParams));
    
    // Сортуємо за датою створення (найновіші спочатку)
    const sortedOrders = result.Items.sort((a, b) => 
      new Date(b.orderDate) - new Date(a.orderDate)
    );

    console.log(`--> Found ${sortedOrders.length} orders`);
    return sortedOrders;

  } catch (error) {
    console.error('--> Error getting orders:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to get orders' };
  }
}

export default getOrders;

/**
// -> Всі замовлення
const allOrders = await getOrders('all');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders",
  "pathParameters": null,
  "headers": {},
  "body": null
}


// -> Конкретне замовлення за ID
const order = await getOrders('1768781883233');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/order/{id}",
  "pathParameters": {
    "id": "1768781883233"
  },
  "headers": {},
  "body": null
}


// -> Замовлення за датою
const todayOrders = await getOrders(null, '2026-01-19');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-date/{date}",
  "pathParameters": {
    "date": "2026-01-19"
  },
  "headers": {},
  "body": null
}


// -> Замовлення за телефоном
const phoneOrders = await getOrders(null, null, '+380501234567');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-phone/{phone}",
  "pathParameters": {
    "phone": "+380501234567"
  },
  "headers": {},
  "body": null
}


// -> Замовлення за адресою
const addressOrders = await getOrders(null, null, null, 'Хрещатик');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-address/{address}",
  "pathParameters": {
    "address": "Хрещатик"
  },
  "headers": {},
  "body": null
}


// -> Замовлення за іменем
const customerOrders = await getOrders(null, null, null, null, 'Іван');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-customer/{customerName}",
  "pathParameters": {
    "customerName": "Іван"
  },
  "headers": {},
  "body": null
}


// -> Всі замовлення конкретної піци
const pizzaOrders = await getOrders(null, null, null, null, null, 1);

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-pizza/{pizzaID}",
  "pathParameters": {
    "pizzaID": "1"
  },
  "headers": {},
  "body": null
}


// -> Всі замовлення конкретної піци зі статусом 'pending'
const pendingPizzaOrders = await getOrders(null, null, null, null, null, 1, 'pending');

// -> Event JSON for Test event in AWS Lambda:
{
  "httpMethod": "GET",
  "resource": "/orders-status/{status}",
  "pathParameters": {
    "status": "pending"
  },
  "headers": {},
  "body": null
}
*/


// // Previous in-memory implementation (commented out)
// import { orders } from '../stores/order.store.mjs';
//
// function getOrders(orderID, orderDate) {
//   if(!orderID) 
//     return { "errorMessage": 'The order ID has not correct value' }; //orders;
//
//   if (orderID === 'all') return orders;
//
//   let order = null;
//   if (orderID && !orderDate)
//     order = orders.find(order => Number(order.id) === orderID);
//   else if (!orderID && orderDate)
//     order = orders.filter(order => order.date === orderDate);
//   else if (orderID && orderDate)
//     order = orders.find(order => Number(order.id) === orderID && order.date === orderDate);
//
//   if (order)
//     return order;
//   else
//     return { "errorMessage": 'The order you requested was not found' };
// }
//
// export default getOrders;