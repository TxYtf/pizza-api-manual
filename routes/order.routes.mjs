"use strict";

import { validateId, safeArrayResponse } from "../utils/helpers.mjs";

import getOrders from "../handlers/get-orders.mjs";
import createOrder from "../handlers/create-order.mjs";
import editOrder from "../handlers/edit-order.mjs";
import deleteOrder from "../handlers/delete-order.mjs";

export default function orderRoutes(router) {
  // ==============================
  // GET
  // ==============================
  router.get('/orders', async () => {
    try {
      return await getOrders('all');
    } catch (e) {
      return { statusCode: 500, error: '>>>> Failed to fetch orders' };
    }
  });

  router.get("/order/{id}", async (event) => {
    const validated = validateId(event.pathParameters);

    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const order = await getOrders(validated.id);

    if (!order || order.errorMessage) {
      return { statusCode: 404, error: ">>>> Order not found" };
    }

    return order;
  });

  router.get("/orders-date/{date}", async (event) => {
    const date = event.pathParameters?.date;
    const data = await getOrders(null, date);
    return safeArrayResponse(data, ">>>> No orders found for this date");
  });

  router.get("/orders-phone/{phone}", async (event) => {
    const data = await getOrders(null, null, event.pathParameters.phone);
    return safeArrayResponse(data, ">>>> No orders found for this phone");
  });

  router.get("/orders-address/{address}", async (event) => {
    let address;

    try {
      address = decodeURIComponent(event.pathParameters.address);
    } catch {
      return { statusCode: 400, error: '>>>> Invalid address encoding' };
    }
    const data = await getOrders(null, null, null, address);
    return safeArrayResponse(data, ">>>> No orders found for this address");
  });

  router.get("/orders-customer/{customerName}", async (event) => {
    const name = decodeURIComponent(event.pathParameters.customerName);
    const data = await getOrders(null, null, null, null, name);
    return safeArrayResponse(data, ">>>> No orders found for this customer");
  });

  router.get("/orders-pizza/{pizzaID}", async (event) => {
    const pizzaId = Number(event.pathParameters.pizzaID);

    if (!Number.isInteger(pizzaId)) {
      return { statusCode: 400, error: ">>>> Invalid pizza ID" };
    }

    const data = await getOrders(null, null, null, null, null, pizzaId);
    return safeArrayResponse(data, ">>>> No orders found for this pizza");
  });

  router.get("/orders-status/{status}", async (event) => {
    const status = event.pathParameters.status;

    if (!["pending", "completed"].includes(status)) {
      return { statusCode: 400, error: ">>>> Invalid status value" };
    }

    const data = await getOrders(null, null, null, null, null, null, status);
    return safeArrayResponse(data, ">>>> No orders found for this status");
  });

  // ==============================
  // POST
  // ==============================
  router.post("/order", async (event) => {
    const data = event.parsedBody;

    const order = await createOrder(data);

    if (order.errorMessage) {
      return { statusCode: 400, error: order.errorMessage };
    }

    return {
      statusCode: 201,
      message: "Order created successfully",
      order,
    };
  });

  // ==============================
  // PUT
  // ==============================
  router.put("/order/{id}", async (event) => {
    const validated = validateId(event.pathParameters);
    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const updated = await editOrder(validated.id, event.parsedBody);

    if (updated === -1) {
      return { statusCode: 404, error: ">>>> Order not found" };
    }

    return { message: "Order updated successfully", order: updated };
  });

  // ==============================
  // DELETE
  // ==============================
  router.delete("/order/{id}", async (event) => {
    const validated = validateId(event.pathParameters);
    if (!validated.isValid) {
      return { statusCode: 400, error: validated.error };
    }

    const deleted = await deleteOrder(validated.id);

    if (deleted === -1) {
      return { statusCode: 404, error: ">>>> Order not found" };
    }

    return { message: "Order deleted successfully", order: deleted };
  });
}
