// handlers/create-pizza.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

/**
  * Додає нову піцу до DynamoDB
  * @param {Object} pizzaData
  *  @param {string} pizzaData.name - Назва піци
  *  @param {Array} pizzaData.ingredients - Інгредієнти піци
  *  @param {number} pizzaData.price - Ціна піци
*/
async function addPizza(pizzaData) {
  if (!pizzaData || !pizzaData.name) {
    return { errorMessage: 'Invalid pizza data' };
  }

  // const newId = Date.now().toString();
  const newId = randomUUID(); // Приклад: "550e8400-e29b-41d4-a716-446655440000"
  const newPizza = {
    pizzaId: newId,
    name: pizzaData.name,
    price: pizzaData.price || 0,
    ingredients: pizzaData.ingredients || []
  };

  console.log('--> Creating new pizza:', newPizza);

  try {
    await docClient.send(new PutCommand({
      TableName: 'pizza-store',
      Item: newPizza
    }));

    console.log('--> Pizza created successfully');
    return newPizza;
  } catch (error) {
    console.error('--> Error creating pizza:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to create pizza' };
  }
}

export default addPizza;


// import { pizzas } from '../stores/pizza.store.mjs';

// // Додавання нової піци
// function addPizza(pizzaData) {
//   const newID = pizzas.length > 0 ? Math.max(...pizzas.map(pizza => pizza.id)) + 1 : 1;
//   const newPizza = {
//     id: newID,
//     name: pizzaData.name || `Pizza ${newID}`,
//     ingredients: pizzaData.ingredients || []
//   };
//   pizzas.push(newPizza);

//   return newPizza;
// }

// export default addPizza;