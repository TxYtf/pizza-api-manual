'use strict';

import { validateId, safeArrayResponse } from '../utils/helpers.mjs';

import getPizzas from '../handlers/get-pizzas.mjs';
import addPizza from '../handlers/create-pizza.mjs';
import editPizza from '../handlers/edit-pizza.mjs';
import deletePizza from '../handlers/delete-pizza.mjs';

export default function pizzaRoutes(router) {
  // ==============================
  // GET
  // ==============================
  router.get('/pizzas', async () => {
    return await getPizzas('all');
  });

  router.get('/pizza/{id}', async (event) => {
    const validated = validateId(event.pathParameters);

    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const pizza = await getPizzas(validated.id);

    if (!pizza) {
      return { statusCode: 404, error: '>>>> Pizza not found' };
    }

    return pizza;
  });

  // ==============================
  // POST
  // ==============================
  router.post('/pizza', async (event) => {
    const data = event.parsedBody;

    const pizza = await addPizza(data);

    if (pizza.errorMessage) {
      return { statusCode: 400, error: pizza.errorMessage };
    }

    return {
      statusCode: 201,
      message: 'Pizza created successfully',
      pizza
    };
  });

  // ==============================
  // PUT
  // ==============================
  router.put('/pizza/{id}', async (event) => {
    const validated = validateId(event.pathParameters);
    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const updated = await editPizza(validated.id, event.parsedBody);

    if (updated === -1) {
      return { statusCode: 404, error: '>>>> Pizza not found' };
    }

    return { message: 'Pizza updated successfully', pizza: updated };
  });

  // ==============================
  // DELETE
  // ==============================

  router.delete('/pizza/{id}', async (event) => {
    const validated = validateId(event.pathParameters);
    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const deleted = await deletePizza(validated.id);

    if (deleted === -1) {
      return { statusCode: 404, error: '>>>> Pizza not found' };
    }

    return { message: 'Pizza deleted successfully', pizza: deleted };
  });
}