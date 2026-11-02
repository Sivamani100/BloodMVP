const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function checkSubs() {
  const url = `https://graph.facebook.com/v23.0/${wabaId}/subscribed_apps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Subscribed apps for WABA:', JSON.stringify(data, null, 2));
}

checkSubs();

