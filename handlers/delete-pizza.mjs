// handlers/delete-pizza.mjs

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

const docClient = new DynamoDBDocumentClient(new DynamoDBClient());

async function deletePizza(pizzaID) {
  if (!pizzaID) {
    return { errorMessage: 'Invalid pizza ID' };
  }

  console.log('--> Deleting pizza:', pizzaID);

  try {
    await docClient.send(new DeleteCommand({
      TableName: 'pizza-store',
      Key: { pizzaId: pizzaID.toString() }
    }));

    console.log('--> Pizza deleted successfully');
    return { message: 'Pizza with ID:' + pizzaID + ' deleted successfully' };
  } catch (error) {
    console.error('--> Error deleting pizza:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      return { errorMessage: 'Database table not found' };
    }
    
    return { errorMessage: 'Failed to delete pizza' };
  }
}

export default deletePizza;



// ----------------------------------------------------------------
// Старий код для видалення піци з локального сховища
// ----------------------------------------------------------------
// import { pizzas } from '../stores/pizza.store.mjs';

// // Видалення піци
// function deletePizza(pizzaID) {
//   const pizzaIndex = pizzas.findIndex(pizza => Number(pizza.id, 10) === Number(pizzaID, 10));
//   if (pizzaIndex === -1) {
//     return -1;
//   }
//   pizzas.splice(pizzaIndex, 1);

//   return pizzas;
// }

// export default deletePizza;
// ----------------------------------------------------------------