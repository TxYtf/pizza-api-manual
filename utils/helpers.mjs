// Допоміжна функція для валідації Pizza ID
const MAX_BODY_SIZE = 10_000;

function validateId(pathParams) {
  if (!pathParams || !pathParams.id) {
    return { isValid: false, error: '>>>> ID is required' };
  }
  const id = pathParams.id.toString().trim();
  if (!id || id.length === 0) {
    return { isValid: false, error: '>>>> Invalid ID' };
  }
  return { isValid: true, id };
}

// Допоміжна функція для парсингу тіла запиту (JSON)
function parseRequestBody(event) {
  try {
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'];

    if (!contentType?.includes('application/json')) {
      return { error: '>>>> Invalid content type!' };
    }

    let body = event.body || '';

    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }

    if (body.length > MAX_BODY_SIZE) {
      return { error: '>>>> Request body too large' };
    }

    return JSON.parse(body);

  } catch {
    return { error: '>>>> Invalid JSON format' };
  }
}

// Допоміжна функція для валідації даних піци
// для методів POST та PUT
// function validatePizzaPayload(data) {
//   if (!data.name || typeof data.name !== 'string') {
//     return 'Invalid pizza name';
//   }
//   if (typeof data.price !== 'number' || data.price <= 0) {
//     return 'Invalid pizza price';
//   }
//   return null;
// }

function safeArrayResponse(data, errorMessage) {
  if (!Array.isArray(data)) {
    return { statusCode: 500, error: '>>>> Invalid data format' };
  }

  return data.length > 0
    ? data
    : { statusCode: 404, error: errorMessage };
}

function createResponse(statusCode, bodyObject) {
  return {
    statusCode,
    body: JSON.stringify(bodyObject),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
    }
  };
}

export { validateId, parseRequestBody, safeArrayResponse, createResponse };