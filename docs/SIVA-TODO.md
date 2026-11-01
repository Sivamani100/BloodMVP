# Siva's Action Guide — External Accounts & API Keys

Hi Siva! Everything inside the code, database schema, PostGIS distance engine, mobile-first UI, and automated tests is **100% completed and verified**.

Here is the exact step-by-step checklist of everything **you** need to do in your browser across external portals. The steps are written according to the **current UI layout of each website**.

---

## Summary of Environment Variables You Will Fill

Once you complete the steps below, you will paste these keys into your `.env.local` file:

```bash
# 1. Supabase (from your existing project yffjclzgracjbmqkjuon)
SUPABASE_SERVICE_ROLE_KEY=eyJh... # Secret service_role key
SEND_SMS_HOOK_SECRET=v1,whsec_... # Secret from Supabase SMS Hook

# 2. Meta WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=         # 15-digit Phone number ID
WHATSAPP_BUSINESS_ACCOUNT_ID=     # WABA ID
WHATSAPP_ACCESS_TOKEN=            # Permanent or temporary access token
WHATSAPP_APP_SECRET=              # App secret from Settings > Basic
WHATSAPP_VERIFY_TOKEN=raktkhoj_verify_secret_2026

# 3. Twilio Voice
TWILIO_ACCOUNT_SID=AC...          # From Twilio Console Home
TWILIO_AUTH_TOKEN=...             # Secret Auth Token
TWILIO_FROM_NUMBER=+1...          # Your purchased Twilio phone number

# 4. Outbound Safety Allowlist (Your phone)
OUTBOUND_ALLOWLIST=+919849497911  # Your real WhatsApp/Phone number
```

---

## Phase 1: Supabase Dashboard (2 Minutes)

Your project `yffjclzgracjbmqkjuon` is already live and connected. You just need 2 secret settings from the dashboard:

1. Open your Supabase Dashboard:
   - **Link:** [https://supabase.com/dashboard/project/yffjclzgracjbmqkjuon](https://supabase.com/dashboard/project/yffjclzgracjbmqkjuon)
2. **Copy Service Role Key:**
   - In the left sidebar, click **Project Settings** (gear icon at bottom) → **API**.
   - Under **Project API keys**, find **`service_role` (secret)**.
   - Click **Reveal** and **Copy**.
   - Paste it into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.
3. **Enable Phone Authentication & SMS Hook:**
   - In the left sidebar, click **Authentication** → **Providers** → **Phone**.
   - Toggle Phone provider **Enabled: ON**.
   - Click **Save**.
   - Next, in the left sidebar click **Authentication** → **Hooks** (or **Auth Hooks**).
   - Find **Send SMS hook** and click **Edit** (or Add).
   - Set Type: **HTTPS endpoint**.
   - Endpoint URL: `https://<your-public-url>/api/auth/hooks/send-sms` (use your Vercel URL or ngrok URL).
   - Click **Generate Secret** and copy the string (starts with `v1,whsec_...`).
   - Paste it into `.env.local` as `SEND_SMS_HOOK_SECRET`.
   - Click **Save**.
4. **Add URL Configuration:**
   - In **Authentication** → **URL Configuration**:
   - Set Site URL: `http://localhost:3000` (or your Vercel URL).
   - In Redirect URLs, add:
     - `http://localhost:3000/**`
     - `https://<your-vercel-domain>/**`
   - Click **Save**.

---

## Phase 2: Meta WhatsApp Cloud API (15 Minutes)

Meta sends the automated WhatsApp alerts with interactive buttons ("Yes, I can donate", "Cannot donate", "Pause alerts").

### Step 2.1: Create your Meta Developer App
1. Go to [developers.facebook.com](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **Create App** (green or blue button top-right).
3. Under "What do you want your app to do?", select the use case:
   - **Connect with customers through WhatsApp** (or **Other** → **Business**).
   - Click **Next**.
4. Give your app a name (e.g. `RaktKhoj Blood MVP`), select or create a **Business portfolio**, and click **Create App**.

### Step 2.2: Get Your WhatsApp API Keys
1. In the left sidebar under **WhatsApp**, click **API Setup** (or **Getting Started**).
2. On this page, you will see your credentials:
   - **Phone number ID:** A 15-digit number (e.g. `1383758468156268`) → Copy to `WHATSAPP_PHONE_NUMBER_ID`.
   - **WhatsApp Business Account ID:** (e.g. `2870087486701819`) → Copy to `WHATSAPP_BUSINESS_ACCOUNT_ID`.
   - **Temporary access token:** Starts with `EAAP...` → Copy to `WHATSAPP_ACCESS_TOKEN`.
     *(Note: This token lasts 24h. For permanent production use, see Step 2.5 below).*
3. **App Secret:**
   - In the left sidebar, click **App settings** → **Basic**.
   - Find **App secret**, click **Show**, enter your password, and copy it.
   - Paste into `.env.local` as `WHATSAPP_APP_SECRET`.

### Step 2.3: Add Your Real Phone Number to Sandbox
Because the test number is in sandbox mode, Meta only sends WhatsApp messages to numbers you explicitly verify:
1. On the **API Setup** page, scroll to **Step 1: Select phone numbers**.
2. In the **"To"** dropdown, select **Manage phone number list**.
3. Click **Add phone number**, enter your mobile number (`+919849497911`), and enter the 6-digit confirmation code WhatsApp sends to your phone.
4. Add any friend or test numbers (up to 5 numbers in test mode).

### Step 2.4: Set Up the Webhook
Meta needs to notify your app when donors tap the interactive buttons ("Yes" or "No"):
1. In the left sidebar under WhatsApp, click **Configuration**.
2. Next to **Webhook**, click **Edit**.
3. In **Callback URL**, enter: `https://<your-public-url>/api/webhooks/whatsapp`
4. In **Verify token**, type: `raktkhoj_verify_secret_2026` (same as `WHATSAPP_VERIFY_TOKEN`).
5. Click **Verify and Save** (Meta will test your server with a quick GET request).
6. Under **Webhook fields**, click **Manage** and click **Subscribe** next to **`messages`**.

### Step 2.5: (Optional for later) Permanent System User Token
When you are ready for a token that never expires:
1. Go to [business.facebook.com/settings](https://business.facebook.com/settings).
2. Go to **Users** → **System users** → Click **Add** → Name: `blood-admin`, Role: **Admin**.
3. Click **Add Assets** → Select your App and WhatsApp Account with **Full Control**.
4. Click **Generate New Token** → Select permissions `whatsapp_business_messaging` and `whatsapp_business_management` → Copy token into `WHATSAPP_ACCESS_TOKEN`.

### Step 2.6: Auto-Register WhatsApp Templates
In your project terminal, run:
```bash
npx tsx scripts/create-wa-templates.ts
```
This registers the official `blood_emergency_alert_v1` and `blood_donation_thanks` templates directly inside your Meta account!

---

## Phase 3: Twilio Voice Setup (10 Minutes)

Twilio handles automated interactive phone calls (DTMF IVR) to ring donors who don't answer WhatsApp within the wave window.

1. Sign up for a free account at [twilio.com](https://www.twilio.com).
2. In the Twilio Console Home:
   - Copy **Account SID** → Paste into `TWILIO_ACCOUNT_SID`.
   - Copy **Auth Token** → Paste into `TWILIO_AUTH_TOKEN`.
3. **Get a Phone Number:**
   - Click **Get a trial phone number** (free credit).
   - Ensure the number has **Voice** enabled.
   - Copy the number (e.g. `+1234567890`) into `TWILIO_FROM_NUMBER`.
4. **Enable India Dialing (Geo Permissions):**
   *(Twilio blocks international calls by default to prevent fraud)*
   - In the top search bar of Twilio Console, type **Geo permissions** (or go to **Voice** → **Settings** → **Geo permissions**).
   - Find **India (`IN`)** and tick the checkbox for **Low-Risk** ranges.
   - Click **Save** at the bottom of the page.
5. **Verify Your Phone Number (Trial accounts):**
   - In the left sidebar, click **Phone Numbers** → **Manage** → **Verified Caller IDs**.
   - Click **Add a new number**, enter your mobile (`+919849497911`), and enter the verification code received by call/SMS.
6. **Configure Voice Webhook:**
   - Go to **Phone Numbers** → **Manage** → **Active numbers** → Click your number.
   - Scroll down to **Voice Configuration**:
     - "A CALL COMES IN": Select **Webhook**, URL: `https://<your-public-url>/api/webhooks/twilio/voice/answer`, Method: **HTTP POST**.
     - "STATUS CALLBACK URL": URL: `https://<your-public-url>/api/webhooks/twilio/voice/status`, Method: **HTTP POST**.
   - Click **Save configuration**.

---

## Phase 4: Brevo Free SMTP Email (5 Minutes)

Supabase free tier provides only 3 emails per hour. Connecting Brevo (free, 300 emails/day) ensures email verification links deliver instantly.

1. Create a free account at [brevo.com](https://www.brevo.com).
2. In Brevo:
   - Click your profile name (top-right) → **Senders, Domains & Dedicated IPs** → **Senders** → **Add a sender**.
   - Enter your email address and verify the link sent to your inbox.
3. Click your profile name → **SMTP & API** → **SMTP** tab.
4. Click **Generate a new SMTP key** → Name it `Supabase` → Copy the generated key.
5. In your Supabase Dashboard:
   - Go to **Authentication** → **Email Settings** (or **Emails** → **SMTP Settings**).
   - Toggle **Enable Custom SMTP: ON**.
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: `<Your Brevo login email>`
   - Password: `<Your Brevo SMTP key>`
   - Sender Email: `<Your verified Brevo sender email>`
   - Sender Name: `RaktKhoj Blood Network`
   - Click **Save**.

---

## Phase 5: Public Webhook URL (Vercel or ngrok)

Meta and Twilio need an HTTPS URL to reach your webhook endpoints.

### Option A: Free Vercel Deployment (Recommended - Permanent)
1. Push your repository to GitHub:
   ```bash
   git push origin master
   ```
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **Add New** → **Project** → Select `BloodMVP` (or your repo name) → Click **Import**.
4. In **Environment Variables**, paste the keys from your `.env.local`.
   - Set `APP_ENV=staging`
   - Set `PUBLIC_APP_URL=https://<your-project>.vercel.app`
5. Click **Deploy**.
6. Use `https://<your-project>.vercel.app` as your public URL in Meta, Twilio, and Supabase!

### Option B: Local Testing with ngrok (Quickest for localhost)
1. If testing locally on your PC:
   ```bash
   npx ngrok http 3000
   ```
2. ngrok will show an HTTPS forwarding address (e.g. `https://abc-123.ngrok-free.app`).
3. Use that address as your callback URL in Meta and Twilio during local testing.

---

## Phase 6: Make Yourself Admin & Test

1. Start your app:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000/en/login` in your browser.
3. Enter your phone number (`+919849497911`) and complete login.
4. In your terminal, run:
   ```bash
   npx tsx scripts/make-admin.ts +919849497911
   ```
5. You are now a verified Administrator! Visit `http://localhost:3000/en/admin` to view:
   - Real-time donor response analytics
   - Audit logs
   - System Emergency Kill Switch

---

## Quick Reference Checklist

- [ ] Copied `service_role` key from Supabase into `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Enabled Phone provider & Send SMS hook in Supabase Auth
- [ ] Created Meta App at `developers.facebook.com` and copied Phone Number ID, WABA ID, Access Token, and App Secret
- [ ] Added your phone number to Meta's recipient list on the API Setup page
- [ ] Set up Twilio account, bought number, enabled India geo permissions, and added your number to Verified Caller IDs
- [ ] Configured Brevo custom SMTP in Supabase Email Settings
- [ ] Run `npx tsx scripts/create-wa-templates.ts` to register templates
- [ ] Run `npx tsx scripts/make-admin.ts +919849497911` to make your account admin
