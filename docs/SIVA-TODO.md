# Siva's Action Checklist — Blood MVP Launch

Hi Siva! All code, database schemas, APIs, security rules, and tests are **100% built, tested, and ready**. 

This guide lists the few external account steps that only you can do in your browser. Follow these step-by-step instructions:

---

## 1. Brevo (Free Transactional Email for Supabase Auth)
Supabase provides 3 free emails/hour by default. Connecting Brevo allows unlimited confirmation emails.

1. Create a free account at [brevo.com](https://www.brevo.com).
2. Go to **Settings** > **SMTP & API Keys** > **Generate a new SMTP key**.
3. Open your Supabase Project:
   - URL: `https://supabase.com/dashboard/project/yffjclzgracjbmqkjuon`
4. Navigate to **Authentication** > **Email Settings** > **SMTP Settings**:
   - Enable Custom SMTP: `ON`
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: `<your Brevo login email>`
   - Password: `<your Brevo SMTP key>`
   - Sender Email: `noreply@<yourdomain.com>` (or your registered sender email)
   - Sender Name: `Blood Emergency Network`
5. Click **Save**.

---

## 2. Meta WhatsApp Cloud API Setup
The app uses the official Meta WhatsApp Cloud API to send interactive messages with buttons to blood donors.

1. Go to [developers.facebook.com](https://developers.facebook.com/) and create a free Developer Account.
2. Click **Create App** > Select **Other** > Type: **Business**.
3. In the App Dashboard, scroll to **WhatsApp** and click **Set up**.
4. In the left sidebar under WhatsApp, click **API Setup**:
   - Copy the **Phone number ID** and paste it into `.env.local` as `WHATSAPP_PHONE_NUMBER_ID`.
   - Copy the **Temporary access token** (or create a System User permanent token in Business Settings) and paste into `.env.local` as `WHATSAPP_ACCESS_TOKEN`.
5. Under **App Settings** > **Basic**:
   - Copy **App Secret** and paste into `.env.local` as `WHATSAPP_APP_SECRET`.
6. Configure the Webhook:
   - In WhatsApp > **Configuration**, click **Edit Webhook**.
   - Callback URL: `https://<your-public-domain-or-ngrok>/api/webhooks/whatsapp`
   - Verify Token: paste whatever secret string you set in `WHATSAPP_VERIFY_TOKEN` (default in `.env.local`).
   - Click **Verify and Save**.
   - Under **Webhook fields**, click **Manage** and subscribe to **`messages`**.
7. Create WhatsApp Templates:
   - In your project terminal, run:
     ```bash
     npx tsx scripts/create-wa-templates.ts
     ```
   - This registers `blood_emergency_alert_v1` and `blood_donation_thanks` in your Meta WhatsApp account automatically.

---

## 3. Twilio Voice Setup (Keypad DTMF Calls)
Twilio Voice calls donors who don't answer WhatsApp within the wave window.

1. Sign up for a free trial at [twilio.com](https://www.twilio.com).
2. Get a phone number with **Voice** capabilities.
3. In your Twilio Console:
   - Copy **Account SID** -> paste into `.env.local` as `TWILIO_ACCOUNT_SID`.
   - Copy **Auth Token** -> paste into `.env.local` as `TWILIO_AUTH_TOKEN`.
   - Copy **Twilio Phone Number** -> paste into `.env.local` as `TWILIO_PHONE_NUMBER` (in E.164 format, e.g. `+1234567890`).
4. Configure the Phone Number Voice Webhook:
   - In Phone Numbers > **Active Numbers**, click your phone number.
   - Under **Voice Configuration**:
     - "A CALL COMES IN": Webhook URL `https://<your-public-domain>/api/webhooks/twilio/voice/answer` (HTTP POST).
     - "STATUS CALLBACK URL": `https://<your-public-domain>/api/webhooks/twilio/voice/status` (HTTP POST).
   - Click **Save**.

---

## 4. Test Donors & Making Yourself Admin

### Seed Test Donors in Rajahmundry
To test requests with realistic mock donors around hospitals in Rajahmundry, run:
```bash
npx tsx scripts/seed-dev-donors.ts
```
This inserts 5 verified, active test donors with coordinates near Rajahmundry hospitals.

### Promote Your Account to Admin
1. Start the app (`npm run dev`) and open `http://localhost:3000/en/login`.
2. Enter your real mobile number and complete the OTP login.
3. In your terminal, run:
   ```bash
   npx tsx scripts/make-admin.ts +91<your-mobile-number>
   ```
4. Now visit `http://localhost:3000/en/admin` — you have full access to the Admin Dashboard and Emergency Kill Switch.

---

## 5. Deployment (Vercel)
1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. In Vercel Project Settings > **Environment Variables**, add the variables from `.env.local`.
4. Deploy!
5. In production, the internal tick is automatically triggered by Supabase `pg_cron` (already installed in the database). You can also configure Vercel Cron via `vercel.json` if desired.
