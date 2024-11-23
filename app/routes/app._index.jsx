// app/routes/app._index.jsx (Homepage)
import { Page, Card, Layout, Text, BlockStack, Button } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  
  // Fetch analytics data
  const analytics = {
    totalNotifications: 0,
    customerNotifications: 0,
    adminNotifications: 0,
    // Add more metrics as needed
  };
  
  return json({ analytics });
};

export default function Index() {
  const { analytics } = useLoaderData();

  return (
    <Page
      title="WhatsApp Order Notifications"
      primaryAction={
        <Button primary as={Link} to="/app/notifications">
          Configure Notifications
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="5">
              <Text variant="headingMd">
                Analytics Overview
              </Text>
              <Layout>
                <Layout.Section oneThird>
                  <Card>
                    <Text variant="headingLg" alignment="center">
                      {analytics.totalNotifications}
                    </Text>
                    <Text alignment="center">Total Notifications</Text>
                  </Card>
                </Layout.Section>
                <Layout.Section oneThird>
                  <Card>
                    <Text variant="headingLg" alignment="center">
                      {analytics.customerNotifications}
                    </Text>
                    <Text alignment="center">Customer Notifications</Text>
                  </Card>
                </Layout.Section>
                <Layout.Section oneThird>
                  <Card>
                    <Text variant="headingLg" alignment="center">
                      {analytics.adminNotifications}
                    </Text>
                    <Text alignment="center">Admin Notifications</Text>
                  </Card>
                </Layout.Section>
              </Layout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="4">
              <Text variant="headingMd">Quick Start Guide</Text>
              <BlockStack gap="2">
                <Text>1. Configure your WhatsApp Business API credentials</Text>
                <Text>2. Set up notification templates for different order events</Text>
                <Text>3. Enable/disable notifications for specific events</Text>
                <Text>4. Test your notification setup</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}