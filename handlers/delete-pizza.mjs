import { pizzas } from '../stores/pizza.store.mjs';

// Видалення піци
function deletePizza(pizzaID) {
  const pizzaIndex = pizzas.findIndex(pizza => Number(pizza.id, 10) === Number(pizzaID, 10));
  if (pizzaIndex === -1) {
    return -1;
  }
  pizzas.splice(pizzaIndex, 1);

  return pizzas;
}

export default deletePizza;