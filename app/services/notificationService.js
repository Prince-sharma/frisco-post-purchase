// app/services/notificationService.js
import prisma from "../db.server";

export async function sendWhatsAppMessage(to, message) {
  // Implement WhatsApp API call here using your preferred WhatsApp Business API provider
  // This is a placeholder implementation
  try {
    const response = await fetch('YOUR_WHATSAPP_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        to,
        message,
        messaging_product: "whatsapp"
      })
    });
    return response.ok;
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return false;
  }
}

export async function formatMessage(template, variables) {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`%${key}%`, 'g'), value);
  }
  return message;
}

export async function logNotification(data) {
  return prisma.notificationLog.create({
    data
  });
}

export async function getTemplateForEvent(shopId, event) {
  return prisma.notificationTemplate.findFirst({
    where: {
      shopId,
      event,
      isEnabled: true
    }
  });
}

export async function formatProductList(lineItems) {
  return lineItems
    .map(item => `${item.quantity}x ${item.title}`)
    .join(', ');
}