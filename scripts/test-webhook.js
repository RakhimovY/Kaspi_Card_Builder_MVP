const crypto = require('crypto');

// Test webhook payload (simplified Lemon Squeezy format)
const testPayload = {
  meta: {
    event_name: 'subscription_created',
    custom_data: {}
  },
  data: {
    id: 'test-sub-123',
    type: 'subscriptions',
    attributes: {
      store_id: 12345,
      customer_id: 67890,
      product_id: 111,
      variant_id: 222,
              product_name: 'Trade Card Builder Pro',
      variant_name: 'Monthly',
      status: 'active',
      status_formatted: 'Active',
      trial_ends_at: null,
      renews_at: '2024-10-02T00:00:00.000000Z',
      ends_at: null,
      created_at: '2024-09-02T00:00:00.000000Z',
      updated_at: '2024-09-02T00:00:00.000000Z',
      test_mode: true
    },
    relationships: {
      store: {
        data: {
          id: '12345',
          type: 'stores'
        }
      },
      customer: {
        data: {
          id: '67890',
          type: 'customers'
        }
      }
    }
  }
};

// Get webhook secret from environment
require('dotenv').config()
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

if (!webhookSecret) {
  console.error('❌ LEMON_SQUEEZY_WEBHOOK_SECRET not set in .env file')
  process.exit(1)
}

console.log('✅ Using webhook secret from .env file')

// Create signature
const body = JSON.stringify(testPayload);
const hmac = crypto.createHmac('sha256', webhookSecret);
hmac.update(body);
const signature = hmac.digest('hex');

console.log('Testing webhook with signature:', signature);
console.log('Payload:', JSON.stringify(testPayload, null, 2));

// Make request to webhook
const fetch = require('node-fetch');

async function testWebhook() {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: body
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);
  } catch (error) {
    console.error('Error testing webhook:', error.message);
  }
}

testWebhook();
