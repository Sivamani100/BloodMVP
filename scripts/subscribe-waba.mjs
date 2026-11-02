const token = process.env.WHATSAPP_ACCESS_TOKEN;
const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function subscribeApp() {
  const url = `https://graph.facebook.com/v23.0/${wabaId}/subscribed_apps`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Subscribe app response:', res.status, JSON.stringify(data, null, 2));
}

subscribeApp();

