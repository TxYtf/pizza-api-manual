import { pizzas } from '../stores/pizza.store.mjs';

function getPizzas(pizzaID) {
  if(!pizzaID) 
    return { "errorMessage": 'The pizza ID has not correct value' }; //pizzas;
  
  if (pizzaID === 'all') return pizzas;

  const pizza = pizzas.find(pizza => Number(pizza.id, 10) === pizzaID);

  if (pizza)
    return pizza;
  else
    return { "errorMessage": 'The pizza you requested was not found' };

  //throw new Error('The pizza you requested was not found');
}

//------------------------------ test -------------------------------------
//let item = getPizzas(1);
//console.log(`{ id: "${item.id}", name: "${item.name}", ingredients: [${item.ingredients}]         errorMessage: "${item.errorMessage}"`);
//-------------------------------------------------------------------------

export default getPizzas;
