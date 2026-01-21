#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';

function usage() {
  console.error(`
Usage:
  node tests/test-pizzas.mjs get-all              # GET /pizzas
  node tests/test-pizzas.mjs get --id=1           # GET /pizza/{id}
  node tests/test-pizzas.mjs create --name="Pizza" --price=15.5 --ingredients="cheese,tomato"
  node tests/test-pizzas.mjs update --id=1 --name="New Pizza" --price=20
  node tests/test-pizzas.mjs delete --id=1        # DELETE /pizza/{id}
  `);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

const command = args[0];
let payload = {};

// Парсинг аргументів
function getArg(name) {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
}

// Формування payload залежно від команди
switch (command) {
  case 'get-all':
    payload = {
      httpMethod: 'GET',
      resource: '/pizzas',
      pathParameters: null,
      body: null
    };
    break;

  case 'get':
    const id = getArg('id');
    if (!id) {
      console.error('Error: --id required for get command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/pizza/{id}',
      pathParameters: { id: id },
      body: null
    };
    break;

  case 'create':
    const name = getArg('name');
    const price = getArg('price');
    const ingredients = getArg('ingredients');
    
    if (!name || !price) {
      console.error('Error: --name and --price required for create command');
      usage();
    }

    const createBody = {
      name: name,
      price: parseFloat(price),
      ingredients: ingredients ? ingredients.split(',') : []
    };

    payload = {
      httpMethod: 'POST',
      resource: '/pizza',
      pathParameters: null,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody)
    };
    break;

  case 'update':
    const updateId = getArg('id');
    const updateName = getArg('name');
    const updatePrice = getArg('price');
    const updateIngredients = getArg('ingredients');

    if (!updateId) {
      console.error('Error: --id required for update command');
      usage();
    }

    const updateBody = {};
    if (updateName) updateBody.name = updateName;
    if (updatePrice) updateBody.price = parseFloat(updatePrice);
    if (updateIngredients) updateBody.ingredients = updateIngredients.split(',');

    payload = {
      httpMethod: 'PUT',
      resource: '/pizza/{id}',
      pathParameters: { id: updateId },
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody)
    };
    break;

  case 'delete':
    const deleteId = getArg('id');
    if (!deleteId) {
      console.error('Error: --id required for delete command');
      usage();
    }
    payload = {
      httpMethod: 'DELETE',
      resource: '/pizza/{id}',
      pathParameters: { id: deleteId },
      body: null
    };
    break;

  default:
    console.error(`Unknown command: ${command}`);
    usage();
}

// Виконання Lambda функції
const cmdArgs = [
  'lambda', 'invoke',
  '--function-name', 'pizza-api-manual-handler',
  '--payload', JSON.stringify(payload),
  '--cli-binary-format', 'raw-in-base64-out',
  'tests/response.json'
];

try {
  console.log(`Testing: ${command.toUpperCase()} ${payload.resource}`);
  const res = spawnSync('aws', cmdArgs, { stdio: 'inherit' });
  if (res.error) throw res.error;
  
  const response = JSON.parse(readFileSync('tests/response.json', 'utf8'));
  console.log('\nResponse:');
  console.log(JSON.stringify(response, null, 2));
} catch (err) {
  console.error('Error:', err && err.message ? err.message : err);
  process.exit(1);
}
