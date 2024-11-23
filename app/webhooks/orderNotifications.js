// app/webhooks/orderNotifications.js
import { sendWhatsAppMessage, formatMessage, logNotification, getTemplateForEvent, formatProductList } from "../services/notificationService";

export async function handleOrderPlaced(shop, order) {
  const template = await getTemplateForEvent(shop.id, 'order_placed');
  if (!template) return;

  const variables = {
    NAME: order.customer?.firstName || 'Valued Customer',
    ORDER_NUMBER: order.name,
    CURRENCY: order.currency,
    AMOUNT: order.totalPrice,
    PRODUCT_LIST: await formatProductList(order.lineItems),
    SHOP_NAME: shop.name
  };

  const message = await formatMessage(template.template, variables);
  const success = await sendWhatsAppMessage(order.customer.phone, message);

  await logNotification({
    event: 'order_placed',
    recipient: order.customer.phone,
    orderId: order.id,
    shopId: shop.id,
    status: success ? 'success' : 'failed',
    message
  });
}

export async function handleOrderFulfilled(shop, order, fulfillment) {
  const template = await getTemplateForEvent(
    shop.id,
    fulfillment.trackingNumber ? 'order_fulfilled' : 'order_fulfilled_no_tracking'
  );
  if (!template) return;

  const variables = {
    NAME: order.customer?.firstName || 'Valued Customer',
    ORDER_NUMBER: order.name,
    PRODUCT_LIST: await formatProductList(order.lineItems),
    TRACKING_NUMBER: fulfillment.trackingNumber || ''
  };

  const message = await formatMessage(template.template, variables);
  const success = await sendWhatsAppMessage(order.customer.phone, message);

  await logNotification({
    event: 'order_fulfilled',
    recipient: order.customer.phone,
    orderId: order.id,
    shopId: shop.id,
    status: success ? 'success' : 'failed',
    message
  });
}

// Similar handlers for other events...