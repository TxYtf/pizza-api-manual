import Router from './router.mjs';
import pizzaRoutes from './pizza.routes.mjs';
import orderRoutes from './order.routes.mjs';

const router = new Router();

router.get('/', async () => {
  return 'Welcome to Pizza API';
});

pizzaRoutes(router);
orderRoutes(router);

export default router;