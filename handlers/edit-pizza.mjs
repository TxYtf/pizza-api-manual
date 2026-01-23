// handlers/edit-pizza.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

async function editPizza(pizzaID, pizzaData) {
  if (!pizzaID || !pizzaData) {
    return { errorMessage: 'Invalid pizzaID or data' };
  }

  console.log('--> Editing pizza:', pizzaID, pizzaData);

  try {
    // Отримуємо існуючу піцу
    const getResult = await docClient.send(new GetCommand({
      TableName: 'pizza-store',
      Key: { pizzaId: pizzaID.toString() }
    }));

    if (!getResult.Item) {
      return { errorMessage: 'Pizza not found' };
    }

    // Оновлюємо піцу
    const updatedPizza = {
      ...getResult.Item,    // Зберігаємо ВСІ існуючі поля
      ...pizzaData,         // Оновлюємо тільки передані поля
      pizzaId: getResult.Item.pizzaId // Зберігаємо оригінальний ID
    };

    await docClient.send(new PutCommand({
      TableName: 'pizza-store',
      Item: updatedPizza
    }));

    console.log('--> Pizza updated successfully');
    return updatedPizza;
  } catch (error) {
    console.error('--> Error editing pizza:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to edit pizza' };
  }
}

// ---------------------------------------------------------------
// Альтернативний підхід з використанням UpdateCommand
// ---------------------------------------------------------------
// import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

// async function editPizza(pizzaID, pizzaData) {
//   const updateExpression = [];
//   const expressionAttributeValues = {};
//   const expressionAttributeNames = {};

//   Object.keys(pizzaData).forEach((key, index) => {
//     updateExpression.push(`#${key} = :val${index}`);
//     expressionAttributeNames[`#${key}`] = key;
//     expressionAttributeValues[`:val${index}`] = pizzaData[key];
//   });

//   try {
//     const result = await docClient.send(new UpdateCommand({
//       TableName: 'pizza-store',
//       Key: { pizzaId: pizzaID.toString() },
//       UpdateExpression: `SET ${updateExpression.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     }));

//     return result.Attributes;
//   } catch (error) {
//     // обробка помилок
//   }
// }
// ---------------------------------------------------------------

export default editPizza;


// ---------------------------------------------------------------
// Старий варіант з використанням локального масиву
// ---------------------------------------------------------------
// import { pizzas } from '../stores/pizza.store.mjs';

// // Редагування існуючої піци
// function editPizza(pizzaID, pizzaData) {
//   const pizzaIndex = pizzas.findIndex(pizza => pizza.id === pizzaID);
//   if (pizzaIndex === -1) {
//     return -1;
//   }
//   // Оновлюємо поля піци
//   pizzas[pizzaIndex].name = pizzaData.name !== undefined ? pizzaData.name : pizzas[pizzaIndex].name;
//   pizzas[pizzaIndex].ingredients = pizzaData.ingredients !== undefined ? pizzaData.ingredients : pizzas[pizzaIndex].ingredients;

//   return pizzas[pizzaIndex];
// }

// export default editPizza;
// ---------------------------------------------------------------