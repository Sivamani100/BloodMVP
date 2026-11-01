import { getEnv } from '../src/server/env';

const TEMPLATES = [
  {
    name: 'blood_request_alert',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Urgent blood request near you.\n\nPatient: {{1}}\nBlood group: {{2}}\nUnits needed: {{3}}\nHospital: {{4}}, {{5}}\nNeeded within: {{6}}\n\nCan you help? Blood never asks for money or OTP. The final health check is done by the doctor.',
        example: {
          body_text: [
            ['Ravi', 'O+', '2', 'Government General Hospital', 'Rajahmundry', '2 hours'],
          ],
        },
      },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'QUICK_REPLY', text: 'Yes, I can come' },
          { type: 'QUICK_REPLY', text: 'Not now' },
          { type: 'QUICK_REPLY', text: 'Stop alerts' },
        ],
      },
    ],
  },
  {
    name: 'blood_donor_details',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Thank you, {{1}}. You are confirmed.\n\nDonation code: {{2}}\nHospital: {{3}}, {{4}}\nWard / room: {{5}}\nFamily contact: {{6}}, {{7}}\n\nPlease tell the code at the hospital. The final health check is done by the doctor. Blood never asks for money.',
        example: {
          body_text: [
            ['Anil', '482197', 'GGH', 'Rajahmundry', 'Room 204', 'Suresh', '+919876543210'],
          ],
        },
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Open details',
            url: 'https://blood.arkiolabs.com/d/{{1}}',
            example: ['c_123456'],
          },
        ],
      },
    ],
  },
  {
    name: 'blood_donor_accepted',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Good news: a donor has agreed to help for {{1}}. Open the request to see who is coming and to call them.',
        example: {
          body_text: [['Ravi']],
        },
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Open request',
            url: 'https://blood.arkiolabs.com/r/{{1}}',
            example: ['r_123456'],
          },
        ],
      },
    ],
  },
  {
    name: 'blood_request_closed',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'The blood request near {{1}} is now closed. Thank you for being ready to help. You do not need to travel.',
        example: {
          body_text: [['Rajahmundry']],
        },
      },
    ],
  },
  {
    name: 'blood_donation_thanks',
    category: 'UTILITY',
    components: [
      {
        type: 'BODY',
        text: 'Thank you, {{1}}, for donating blood. You helped a family in need. You can donate again after {{2}}.',
        example: {
          body_text: [['Anil', '12 Feb 2027']],
        },
      },
    ],
  },
];

async function syncTemplates() {
  const env = getEnv();
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!token || !wabaId) {
    console.error('Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_BUSINESS_ACCOUNT_ID in environment.');
    console.log('Skipping API registration.');
    return;
  }

  const checkStatusOnly = process.argv.includes('--status');
  const baseUrl = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${wabaId}/message_templates`;

  if (checkStatusOnly) {
    const res = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log('Current WhatsApp templates on Meta:');
    console.dir(data, { depth: null });
    return;
  }

  for (const tpl of TEMPLATES) {
    console.log(`Submitting template: ${tpl.name}...`);
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: tpl.name,
          category: tpl.category,
          language: 'en',
          components: tpl.components,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✓ Template ${tpl.name} submitted successfully (ID: ${data.id}, status: ${data.status})`);
      } else {
        console.warn(`! Template ${tpl.name} note:`, data?.error?.message);
      }
    } catch (err: any) {
      console.error(`Error submitting ${tpl.name}:`, err.message);
    }
  }
}

syncTemplates().catch(console.error);
