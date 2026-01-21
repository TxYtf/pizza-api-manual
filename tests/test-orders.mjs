#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';

function usage() {
  console.error(`
Usage:
  node tests/test-orders.mjs get-all                    # GET /orders
  node tests/test-orders.mjs get --id=1                 # GET /order/{id}
  node tests/test-orders.mjs get-by-date --date=2024-01-20        # GET /orders-date/{date}
  node tests/test-orders.mjs get-by-phone --phone=+380501234567   # GET /orders-phone/{phone}
  node tests/test-orders.mjs get-by-address --address="Київ"      # GET /orders-address/{address}
  node tests/test-orders.mjs get-by-customer --customer="Іван"    # GET /orders-customer/{customerName}
  node tests/test-orders.mjs get-by-pizza --pizzaID=1            # GET /orders-pizza/{pizzaID}
  node tests/test-orders.mjs get-by-status --status=pending      # GET /orders-status/{status}
  node tests/test-orders.mjs create --pizzaID=1 --address="Київ" --customer="Іван" --phone="+380501234567"
  node tests/test-orders.mjs update --id=1 --status=completed
  node tests/test-orders.mjs delete --id=1              # DELETE /order/{id}
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
      resource: '/orders',
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
      resource: '/order/{id}',
      pathParameters: { id: id },
      body: null
    };
    break;

  case 'get-by-date':
    const date = getArg('date');
    if (!date) {
      console.error('Error: --date required for get-by-date command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-date/{date}',
      pathParameters: { date: date },
      body: null
    };
    break;

  case 'get-by-phone':
    const phone = getArg('phone');
    if (!phone) {
      console.error('Error: --phone required for get-by-phone command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-phone/{phone}',
      pathParameters: { phone: phone },
      body: null
    };
    break;

  case 'get-by-address':
    const address = getArg('address');
    if (!address) {
      console.error('Error: --address required for get-by-address command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-address/{address}',
      pathParameters: { address: encodeURIComponent(address) },
      body: null
    };
    break;

  case 'get-by-customer':
    const customer = getArg('customer');
    if (!customer) {
      console.error('Error: --customer required for get-by-customer command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-customer/{customerName}',
      pathParameters: { customerName: encodeURIComponent(customer) },
      body: null
    };
    break;

  case 'get-by-pizza':
    const pizzaID = getArg('pizzaID');
    if (!pizzaID) {
      console.error('Error: --pizzaID required for get-by-pizza command');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-pizza/{pizzaID}',
      pathParameters: { pizzaID: pizzaID },
      body: null
    };
    break;

  case 'get-by-status':
    const status = getArg('status');
    if (!status || !['pending', 'completed'].includes(status)) {
      console.error('Error: --status required (pending or completed)');
      usage();
    }
    payload = {
      httpMethod: 'GET',
      resource: '/orders-status/{status}',
      pathParameters: { status: status },
      body: null
    };
    break;

  case 'create':
    const pizzaID_create = getArg('pizzaID');
    const address_create = getArg('address');
    const customer_create = getArg('customer');
    const phone_create = getArg('phone');
    
    if (!pizzaID_create || !address_create || !customer_create || !phone_create) {
      console.error('Error: --pizzaID, --address, --customer, and --phone required for create command');
      usage();
    }

    const createBody = {
      pizzaID: parseInt(pizzaID_create),
      address: address_create,
      customerName: customer_create,
      phone: phone_create
    };

    payload = {
      httpMethod: 'POST',
      resource: '/order',
      pathParameters: null,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody)
    };
    break;

  case 'update':
    const updateId = getArg('id');
    const updateStatus = getArg('status');
    const updateAddress = getArg('address');
    const updateCustomer = getArg('customer');
    const updatePhone = getArg('phone');

    if (!updateId) {
      console.error('Error: --id required for update command');
      usage();
    }

    const updateBody = {};
    if (updateStatus) updateBody.status = updateStatus;
    if (updateAddress) updateBody.address = updateAddress;
    if (updateCustomer) updateBody.customerName = updateCustomer;
    if (updatePhone) updateBody.phone = updatePhone;

    payload = {
      httpMethod: 'PUT',
      resource: '/order/{id}',
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
      resource: '/order/{id}',
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
