// app/routes/app.notifications.jsx
import {
    Page,
    Card,
    Layout,
    FormLayout,
    TextField,
    Select,
    Button,
    Text,
    Toast,
    Frame,
    BlockStack,
  } from "@shopify/polaris";
  import { useState } from "react";
  import { json } from "@remix-run/node";
  import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
  import { authenticate } from "../shopify.server";
  import prisma from "../db.server";
  
  export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    
    // Fetch existing notification settings from database
    const settings = {
      events: [
        {
          id: "order_placed",
          name: "Order Placed",
          enabled: true,
          template: "Hi %NAME%! Your Order %ORDER_NUMBER% of %CURRENCY% %AMOUNT% has been placed we will notify you once its shipped %PRODUCT_LIST% %SHOP_NAME%",
          recipient: "customer",
        },
        {
          id: "order_fulfilled",
          name: "Order Fulfilled/Shipped",
          enabled: true,
          template: "Hi %NAME% Your Order %ORDER_NUMBER% has been dispatched with following items %PRODUCT_LIST%",
          recipient: "customer",
        },
        {
          id: "order_fulfilled_no_tracking",
          name: "Order Fulfilled/Shipped (Without Tracking)",
          enabled: true,
          template: "Hi %NAME%, Your Order %ORDER_NUMBER% has been dispatched. to track your order use number %TRACKING_NUMBER%",
          recipient: "customer",
        },
        {
          id: "order_cancelled",
          name: "Order Cancelled",
          enabled: true,
          template: "Dear %NAME% Your order %ORDER_NUMBER% has been canceled. Reason: %CANCEL_REASON%",
          recipient: "customer",
        },
        {
          id: "payment_received",
          name: "Payment Received",
          enabled: true,
          template: "Dear %NAME% Your payment of %CURRENCY% %AMOUNT% for order number %ORDER_NUMBER% has been paid.Thanks",
          recipient: "customer",
        },
        {
          id: "order_verified",
          name: "Order Verified",
          enabled: true,
          template: "Hi %NAME% Your Order #%ORDER_NUMBER% of %CURRENCY% %AMOUNT% is verified. We will notify you once your order is shipped",
          recipient: "customer",
        }
      ],
    };
    
    return json({ settings });
  };
  
  export const action = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const formData = await request.formData();
    
    try {
      const data = JSON.parse(formData.get('data'));
      
      // Update settings in database for each event
      for (const event of data.events) {
        await prisma.notificationTemplate.upsert({
          where: {
            shopId_event: {
              shopId: session.shop,
              event: event.id
            }
          },
          update: {
            template: event.template,
            isEnabled: event.enabled,
            recipient: event.recipient
          },
          create: {
            shopId: session.shop,
            event: event.id,
            template: event.template,
            isEnabled: event.enabled,
            recipient: event.recipient
          }
        });
      }
      
      return json({ status: "success" });
    } catch (error) {
      console.error("Error saving settings:", error);
      return json({ status: "error", message: error.message }, { status: 500 });
    }
  };
  
  export default function NotificationSettings() {
    const { settings } = useLoaderData();
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState("");
    const [localSettings, setLocalSettings] = useState(settings);
    const submit = useSubmit();
    const navigate = useNavigate();
  
    const handleSave = () => {
      submit({ data: JSON.stringify(localSettings) }, { method: "POST" });
      setToastContent("Settings saved successfully");
      setShowToast(true);
    };
  
    const handleStatusChange = (value, eventId) => {
      setLocalSettings(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, enabled: value === "enabled" }
            : event
        )
      }));
    };
  
    const handleRecipientChange = (value, eventId) => {
      setLocalSettings(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, recipient: value }
            : event
        )
      }));
    };
  
    const handleTemplateChange = (value, eventId) => {
      setLocalSettings(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, template: value }
            : event
        )
      }));
    };
  
    return (
      <Frame>
        <Page
          title="Notification Settings"
          backAction={{ content: "Back", onAction: () => navigate("/app") }}
        >
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="4">
                  <Text variant="headingMd">Event Message Settings</Text>
                  <FormLayout>
                    {localSettings.events.map((event) => (
                      <Card key={event.id}>
                        <BlockStack gap="4">
                          <Layout>
                            <Layout.Section oneThird>
                              <Select
                                label="Status"
                                options={[
                                  { label: "Enabled", value: "enabled" },
                                  { label: "Disabled", value: "disabled" },
                                ]}
                                value={event.enabled ? "enabled" : "disabled"}
                                onChange={(value) => handleStatusChange(value, event.id)}
                              />
                            </Layout.Section>
                            <Layout.Section oneThird>
                              <Select
                                label="Recipient"
                                options={[
                                  { label: "Customer", value: "customer" },
                                  { label: "Admin", value: "admin" },
                                ]}
                                value={event.recipient}
                                onChange={(value) => handleRecipientChange(value, event.id)}
                              />
                            </Layout.Section>
                          </Layout>
                          <TextField
                            label="Message Template"
                            value={event.template}
                            multiline={4}
                            helpText="Use %VARIABLE% format for dynamic content"
                            onChange={(value) => handleTemplateChange(value, event.id)}
                          />
                        </BlockStack>
                      </Card>
                    ))}
                    <Button primary onClick={handleSave}>
                      Save Changes
                    </Button>
                  </FormLayout>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
        {showToast && (
          <Toast
            content={toastContent}
            onDismiss={() => setShowToast(false)}
            duration={4000}
          />
        )}
      </Frame>
    );
  }