'use strict';

import router from './routes/routes.mjs';
import { parseRequestBody, createResponse } from './utils/helpers.mjs';


export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, {});
    }

    console.log(JSON.stringify({
      method: event.httpMethod,
      path: event.resource
    }));

    // parse body для POST/PUT
    if (['POST', 'PUT'].includes(event.httpMethod)) {
      const parsed = parseRequestBody(event);

      if (parsed.error) {
        return createResponse(400, { error: parsed.error });
      }

      event.parsedBody = parsed;
    }

    // шукаємо запит і маршрут у масиві зареєстрованих запитів з їхніми маршрутами і хендлерами
    const route = router.resolve(event);

    console.log('Route found:', route);

    // якщо не знайшли такий маршрут - повертаємо 404
    if (!route) {
      return createResponse(404, { error: '>>>> Route or request method not found' });
    }

    // викликаємо хендлер, який відповідає нашому запиту і маршруту
    const result = await route.handler(event);

    if (result?.statusCode) {
      return createResponse(
        result.statusCode,
        result.error ? { error: result.error } : result
      );
    }

    return createResponse(200, result);

  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { error: '>>>> Internal server error' });
  }
}