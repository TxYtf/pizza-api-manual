import { pizzas } from '../stores/pizza.store.mjs';

// Редагування існуючої піци
function editPizza(pizzaID, pizzaData) {
  const pizzaIndex = pizzas.findIndex(pizza => pizza.id === pizzaID);
  if (pizzaIndex === -1) {
    return -1;
  }
  // Оновлюємо поля піци
  pizzas[pizzaIndex].name = pizzaData.name !== undefined ? pizzaData.name : pizzas[pizzaIndex].name;
  pizzas[pizzaIndex].ingredients = pizzaData.ingredients !== undefined ? pizzaData.ingredients : pizzas[pizzaIndex].ingredients;

  return pizzas[pizzaIndex];
}

export default editPizza;