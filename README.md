# Pizza API

Lambda-based REST API for pizza ordering system built with AWS Lambda and API Gateway.

## Features

- **Pizza Management**: Create, read, update, delete pizzas
- **Order Management**: Create, read, update, delete orders
- **CORS Support**: Cross-origin requests enabled
- **Input Validation**: Security checks for all inputs
- **Error Handling**: Comprehensive error responses

## Project Structure
pizza-api-manual/
├── api.mjs # Main Lambda handler
├── handlers/ # Handler functions
│ ├── get-pizzas.mjs
│ ├── create-pizza.mjs
│ ├── edit-pizza.mjs
│ ├── delete-pizza.mjs
│ ├── get-orders.mjs
│ ├── create-order.mjs
│ ├── edit-order.mjs
│ └── delete-order.mjs
├── stores/ # Data stores
│ ├── pizza.store.mjs
│ └── order.store.mjs
└── README.md

## API Endpoints

### Pizzas
- `GET /pizzas` - Get all pizzas
- `GET /pizza/{id}` - Get pizza by ID
- `POST /pizza` - Create new pizza
- `PUT /pizza/{id}` - Update pizza
- `DELETE /pizza/{id}` - Delete pizza

### Orders
- `GET /orders` - Get all orders
- `GET /order/{id}` - Get order by ID
- `GET /order-date/{date}` - Get orders by date
- `POST /order` - Create new order
- `PUT /order/{id}` - Update order
- `DELETE /order/{id}` - Delete order

## Deployment

Deploy to AWS Lambda using SAM or AWS CLI:

```bash
sam deploy
```

Testing
Test with curl:
# Get all pizzas
```bash
curl https://<api-url>/pizza-api/pizzas
```
# Create order
```bash
curl -X POST https://<api-url>/pizza-api/order \
  -H "Content-Type: application/json" \
  -d '{"pizzaID":1,"address":"вул. Хрещатик, 10, Київ","customerName":"Іван Петренко","phone":"+380501234567"}'
```
Technologies
AWS Lambda

AWS API Gateway

Node.js (ES6 modules)

JavaScript

License
MIT
