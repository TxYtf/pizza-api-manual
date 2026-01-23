// handlers/get-pizzas.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

/**
  * Отримує піци з DynamoDB
  * @param {string|null} pizzaId - ID конкретної піци
  * @param {string|null} name - Назва піци
  * @param {number|null} price - Ціна піци
  * @param {Array|null} ingredients - Інгредієнти піци
  *   @returns {Promise<Object|Array|null>} Піца або масив піц
*/

async function getPizzas(pizzaID) {
  console.log('--> Getting pizzas with params:', { pizzaID });

  try {
    if(!pizzaID) 
      return { "errorMessage": 'The pizza ID has not correct value' };

    // Пошук конкретної піци за ID
    if (pizzaID && pizzaID !== 'all') {
      const result = await docClient.send(new GetCommand({
        TableName: 'pizza-store',
        Key: { pizzaId: pizzaID.toString() }
      }));

      return result.Item || null;
    }

    // Пошук всіх піц
    const result = await docClient.send(new ScanCommand({
      TableName: 'pizza-store'
    }));

    // Сортуємо за назвою піци
    const sortedPizzas = result.Items.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameB.localeCompare(nameA);
    });

    console.log(`--> Found ${sortedPizzas.length} pizzas`);
    return sortedPizzas;

  } catch (error) {
    console.error('--> Error getting pizzas:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }

    return { errorMessage: 'Failed to get pizzas' };
  }
}

export default getPizzas;



// amazonq-ignore-next-line
// import { pizzas } from '../stores/pizza.store.mjs';

// function getPizzas(pizzaID) {
//   if(!pizzaID) 
//     return { "errorMessage": 'The pizza ID has not correct value' }; //pizzas;

//   if (pizzaID === 'all') return pizzas;

//   const pizza = pizzas.find(pizza => Number(pizza.id, 10) === Number(pizzaID, 10));

//   if (pizza)
//     return pizza;
//   else
//     return { "errorMessage": 'The pizza you requested was not found' };

//   //throw new Error('The pizza you requested was not found');
// }

// export default getPizzas;
