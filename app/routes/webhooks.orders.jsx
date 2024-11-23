// app/routes/webhooks.orders.jsx
import { authenticate } from "../shopify.server";
import {
  handleOrderPlaced,
  handleOrderFulfilled,
  handleOrderCancelled,
  handlePaymentReceived,
  handleOrderVerified
} from "../webhooks/orderNotifications";

export const action = async ({ request }) => {
  const { topic, shop, admin, payload } = await authenticate.webhook(request);
  
  try {
    switch (topic) {
      case "orders/create":
        await handleOrderPlaced(shop, payload);
        break;
      case "orders/fulfilled":
        await handleOrderFulfilled(shop, payload, payload.fulfillments[0]);
        break;
      case "orders/cancelled":
        await handleOrderCancelled(shop, payload);
        break;
      case "orders/paid":
        await handlePaymentReceived(shop, payload);
        break;
      // Add additional webhook handlers as needed
    }
    
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(null, { status: 500 });
  }
};