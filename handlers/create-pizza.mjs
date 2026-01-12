import { pizzas } from '../stores/pizza.store.mjs';

// Додавання нової піци
function addPizza(pizzaData) {
  const newID = pizzas.length > 0 ? Math.max(...pizzas.map(pizza => pizza.id)) + 1 : 1;
  const newPizza = {
    id: newID,
    name: pizzaData.name || `Pizza ${newID}`,
    ingredients: pizzaData.ingredients || []
  };
  pizzas.push(newPizza);

  return newPizza;
}

export default addPizza;