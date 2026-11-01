# SETUP GUIDE FOR SIVA — what YOU do while the agent writes the code

Read this top to bottom once. Then follow the checklist. Everything is explained like you are doing it for the first time.
Your coding agent writes **all the code**. You create accounts, copy keys, test with real phones, and get a few things reviewed by humans.

> Prices and screens change. If a menu looks different from what I describe, look for the same words nearby. If you get stuck, copy the exact error text and send it to the agent (never the secret keys).

---

## 0. The big picture (read this first)

```
YOU                                    AGENT
─────────────────────────────          ─────────────────────────────
Create accounts + copy keys    ──►     Writes app, database, tests
Put keys in .env.local / Vercel         Runs tests, fixes bugs
Test with your real phone       ◄──     Tells you next steps in docs/SIVA-TODO.md
Get texts reviewed by humans            Updates docs/PROGRESS.md
```

**Golden rules for you:**
1. **Never paste keys, tokens or passwords into the chat.** Put them in files (`.env.local`) or in the website settings (Vercel, GitHub).
2. **Only message/call people who agreed** (you + friends who said yes). The app blocks everyone else automatically while testing.
3. **This is for a pilot.** Do not tell the public it replaces blood banks or the 108 ambulance until you have tested for weeks.
4. Keep a **password manager** (Bitwarden is free) for all passwords.

### How long does it take?
| Part | Time |
|---|---|
| Accounts (Parts 1-6) | about 2-3 hours spread over 1-2 days (Meta can take longer) |
| Waiting for the agent | depends on your agent; milestones M0-M10 in `00-README-FOR-AGENT.md` |
| Template approval by Meta | minutes to 1 day |
| Real-phone testing | 1 evening per round |

### Which accounts cost money?
| Item | Cost |
|---|---|
| GitHub, Supabase, Vercel (Hobby), Brevo, UptimeRobot | **Free** |
| WhatsApp test number (up to 5 friends) | **Free** |
| WhatsApp real number | small per-message fee (about ₹0.115 for a normal alert message in India; check Meta's rate card) + a new SIM card |
| Phone calls (Twilio trial) | **Free trial credit, but only to numbers you verify** |
| Phone calls to many real donors | **Not free.** You pay per minute (decide later; the app works WhatsApp-only without it) |

---

## 1. On your computer (one time)

1. Install **Node.js 22 LTS** (nodejs.org). Check: open a terminal and type `node -v` → should show `v22…`.
2. Install **Git** (git-scm.com).
3. Install **VS Code** (or whichever editor your agent uses).
4. (Optional) Install **Docker Desktop** if you want the agent to run a local copy of Supabase for tests.
5. Make a folder for the project, e.g. `blood-app`. Put the kit files inside it:
   - `00-README-FOR-AGENT.md`, `01-PRD.md`, `02-TRD.md`, `03-AI-SPEC.md`, `04-TEST-PLAN.md`, `05-COPY-AND-TEMPLATES.md`, `.env.example`
   - the `supabase/` folder
6. Give your coding agent access to this folder.

### Start the agent
Paste this as your first message to the agent:

> Read `00-README-FOR-AGENT.md`, then `01-PRD.md`, `02-TRD.md`, `03-AI-SPEC.md`, `04-TEST-PLAN.md`, `05-COPY-AND-TEMPLATES.md`. Create the repo exactly as described, copy the `supabase/` folder, and start with milestone M0. After each milestone run all tests, commit, and update `docs/PROGRESS.md`. Whenever you need something from me, add it to `docs/SIVA-TODO.md` in plain steps and keep working on whatever is not blocked. Do not ask me to paste secrets in chat. Start now.

From now on, check `docs/SIVA-TODO.md` every time the agent finishes a milestone.

---

## 2. Account 1 — GitHub (5 minutes)

1. Sign up / log in at **github.com**.
2. Click **New repository** → name `blood-app` → **Private** → Create.
3. Tell the agent the repo URL (or let it run `git remote add`).
4. Later (Part 9): **Settings → Secrets and variables → Actions** is where CI secrets go.

---

## 3. Account 2 — Supabase (database + login) (20 minutes)

Make **two** projects over time: **staging** now, **production** later (free plan allows 2).

1. Go to **supabase.com** → sign up with GitHub.
2. **New project**:
   - Name: `blood-staging`
   - Database password: click **Generate**, save it in your password manager.
   - Region: **South Asia (Mumbai)** if available (fastest for India).
   - Plan: **Free**.
3. Wait 2 minutes until it says ready.
4. Open **Project Settings → API**. Copy these into your local file `.env.local` (copy `.env.example` to `.env.local` first):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **secret, never share**
5. Open **Database → Extensions** and switch ON: `postgis`, `pg_cron`, `pg_net`.
6. **Create the tables:** the agent will write the exact commands into `docs/SIVA-TODO.md`. They look like:
   - `npx supabase login`
   - `npx supabase link --project-ref YOUR_REF` (the ref is the code in your project URL)
   - `npx supabase db push`
   If the agent prefers: open **SQL Editor**, paste the file contents of `0001_init.sql`, click **Run**, then `0003_storage.sql`.
7. **Vault secrets for the scheduler** (once). In **SQL Editor** run (change the two values):
   ```sql
   select vault.create_secret('https://YOUR-STAGING-APP.vercel.app', 'app_url');
   select vault.create_secret('THE-SAME-VALUE-AS-CRON_SECRET', 'cron_secret');
   ```
   Then run the contents of `0002_cron.sql`.
   *(Generate the secrets with the agent's script `npx tsx scripts/gen-secrets.ts`, then put the same value in `.env.local` and in Vercel.)*

### 3.1 Supabase login settings (Authentication)
Do these after the agent has deployed the first version (Part 5), because the hook needs your real URL.

1. **Authentication → Providers → Phone:** turn it **ON**. If it asks for an SMS provider, choose the **Send SMS hook** option instead (next step) or any placeholder; we send OTPs ourselves over WhatsApp.
2. **Authentication → Hooks → Send SMS:** enable → type **HTTPS endpoint** → URL: `https://YOUR-APP.vercel.app/api/auth/hooks/send-sms` → **Generate secret** → copy it into `SEND_SMS_HOOK_SECRET` (in `.env.local` and Vercel).
3. **Authentication → Providers → Phone → Test Phone Numbers and OTPs:** add 3 fake numbers with a fixed OTP, e.g. `919999900001=123456`, `919999900002=123456`, `919999900003=123456`. The agent's automatic tests use these.
4. **Authentication → URL Configuration:** Site URL = your Vercel URL. Redirect URLs: add `http://localhost:3000/**` and `https://YOUR-APP.vercel.app/**`.
5. **Authentication → Emails → SMTP Settings:** use Brevo (Part 6).
6. **Authentication → Emails → Templates:** paste the "Confirm your email" text from `05-COPY-AND-TEMPLATES.md` §9.
7. **Authentication → Multi-Factor:** make sure **TOTP** is enabled (admins will use it).
8. **Authentication → Rate Limits:** keep the defaults for now.

---

## 4. Account 3 — Vercel (website hosting) (10 minutes)

1. **vercel.com** → sign up with **GitHub**. Choose the **Hobby (free)** plan.
   *Hobby is for personal/non-commercial use. This pilot is non-commercial. If the project starts earning money, move to a paid plan or another host.*
2. After the agent pushes code: **Add New → Project** → pick `blood-app` → **Import**.
3. **Environment Variables:** add every line from your `.env.local` (copy-paste each name and value). Set `APP_ENV=staging` and `PUBLIC_APP_URL=https://YOUR-STAGING-APP.vercel.app`.
4. **Deploy.** Copy the URL it shows. Tell the agent the URL (not the secrets).
5. Every time you change an environment variable, click **Redeploy**.

---

## 5. Account 4 — Meta WhatsApp Cloud API (the longest one, 30-60 minutes)

You will do this in two stages. **Stage A (test number) is free and takes minutes. Stage B (real number) comes before real donors.**

### Stage A — Test number (free, up to 5 phones)

1. Go to **developers.facebook.com** → log in with Facebook → **Register as a developer** if asked.
2. **My Apps → Create App** → choose the **WhatsApp** use case ("Connect with customers through WhatsApp"). Name: `Blood Staging`. If it asks for a **Business portfolio**, create one (your name or "Arkio Labs").
3. In the left menu: **WhatsApp → API Setup** (click "Start using the API" if shown). You will see:
   - A **test phone number** (the sender).
   - **Phone number ID** → copy to `WHATSAPP_PHONE_NUMBER_ID`.
   - **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`.
   - **Temporary access token** (valid about 24 hours) → `WHATSAPP_ACCESS_TOKEN` (for now).
4. **Add your phones:** in "To", choose **Manage phone number list**, add your WhatsApp number and up to 4 friends (each must confirm with a code sent to their WhatsApp). Max 5.
5. **App secret:** **App settings → Basic → App secret → Show** → copy to `WHATSAPP_APP_SECRET`.
6. Make up a long random word for `WHATSAPP_VERIFY_TOKEN` (the agent's `gen-secrets` script can make one).
7. **Webhook** (after Vercel is deployed): **WhatsApp → Configuration → Webhook → Edit**:
   - Callback URL: `https://YOUR-STAGING-APP.vercel.app/api/webhooks/whatsapp`
   - Verify token: your `WHATSAPP_VERIFY_TOKEN`
   - Click **Verify and save**, then **Manage** webhook fields and **subscribe to `messages`**.
8. **Templates:** ask the agent to run `npx tsx scripts/create-wa-templates.ts` (it uses your token and WABA id). Then in **WhatsApp → Message templates** check each template's status (**Approved** is what you want; **In review** takes minutes to a day). If a template is rejected, copy the reason to the agent.
   - If Meta changes the alert template's category to **Marketing**, tell the agent; it costs more and has different rules.

> A temporary token expires. If WhatsApp suddenly stops working a day later, generate a new token (API Setup → Generate access token) and update `.env.local` and Vercel. To avoid this, create a **permanent token** (next).

### Permanent token (do this once, even for staging)
1. Go to **business.facebook.com/settings** (Meta Business Settings) → **Users → System users → Add** → name `blood-system`, role **Admin**.
2. **Add assets** → select your **App** and your **WhatsApp account** with full control.
3. **Generate new token** → choose your app → expiry **Never** (if offered) → tick permissions **whatsapp_business_messaging** and **whatsapp_business_management** → copy the token into `WHATSAPP_ACCESS_TOKEN`.

### Stage B — Real number (before real donors)
1. Buy a **new SIM** that will be used **only** for this. It must **not** be registered in the normal WhatsApp or WhatsApp Business app (if it is, delete that WhatsApp account first).
2. In your Meta app: **WhatsApp → API Setup → Add phone number** → enter business name/details → choose a **display name** (e.g., "Blood") → verify the number by SMS/voice code.
3. Wait for **display name approval**.
4. Optional but helpful: **Business verification** (Business Settings → Security Center). It raises limits later. A new number starts at **250 different people per 24 hours**, which is plenty for the pilot.
5. Update `WHATSAPP_PHONE_NUMBER_ID` to the new number's ID and re-run the template script for production.

---

## 6. Account 5 — Brevo (free email for verification links) (15 minutes)

1. **brevo.com** → sign up (free).
2. **Senders & IP → Senders → Add a sender:** use an email you can open (e.g., your Gmail). Click the verify link in your inbox.
3. **SMTP & API → SMTP:** note **SMTP server** (usually `smtp-relay.brevo.com`), **Port** `587`, **Login** (shown there), and create an **SMTP key** (password).
4. Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP:**
   - Sender email: the verified sender
   - Sender name: `Blood`
   - Host: `smtp-relay.brevo.com` · Port: `587` · Username: your Brevo login · Password: the SMTP key
5. Free plan: about **300 emails per day**. Enough for the pilot.

---

## 7. Account 6 — Twilio (phone calls) (20 minutes) — optional at first

You can run the pilot **WhatsApp-only** and add calls later (the app has a switch). To test calls:

1. **twilio.com** → sign up. Verify your email and your phone number.
2. **Enable India calling:** Console search bar → **Geo permissions** (or International Voice Dialing) → turn **India ON** → Save. *(Twilio blocks countries by default.)*
3. **Get a trial number:** Phone Numbers → Buy a number (uses free trial credit) with **Voice** ability. Copy to `TWILIO_FROM_NUMBER` (format `+1…`).
4. **Verify each friend's phone:** Phone Numbers → Manage → **Verified Caller IDs → Add** → enter the number → they receive a code. **Trial accounts can only call verified numbers.**
5. **Copy keys:** Console home → **Account SID** → `TWILIO_ACCOUNT_SID`; **Auth Token** → `TWILIO_AUTH_TOKEN` ⚠️ secret.
6. During a trial call you may hear a Twilio notice and be asked to press a key. That is normal; it disappears on a paid account.
7. To call **unverified real donors**, you must upgrade the Twilio account (pay per minute) **and** follow India's calling rules for your provider. Ask your provider about requirements before turning calls on for the public. (Calls to numbers outside the app's allowlist are blocked anyway during testing.)

---

## 8. Account 7 — UptimeRobot (keeps the free servers awake) (5 minutes)

Supabase Free pauses a project after about 7 days without activity, and Vercel may sleep.
1. **uptimerobot.com** → free account → **Add monitor** → type HTTP(s) → URL `https://YOUR-APP.vercel.app/api/health` → interval **5 minutes**.
2. Turn on email alerts to yourself.

---

## 9. GitHub secrets for tests (10 minutes, later)

The agent's automatic tests need a few safe values. The agent will list which ones in `docs/SIVA-TODO.md`. You add them at **GitHub → Settings → Secrets and variables → Actions → New repository secret**. Never put your **production** keys here unless the agent says so.

---

## 10. What to do while the agent works (milestone checklist)

| Agent milestone | What YOU do | How to check it works |
|---|---|---|
| **M0** skeleton | Nothing. Create GitHub repo. | Agent shows tests passing |
| **M1** Supabase + login | Part 3 (Supabase), create `.env.local`. Part 4 (Vercel) deploy staging. Part 3.1 settings (test OTP numbers). | Open the site → log in with a **test number** and OTP `123456` |
| **M2** donor registration | Part 6 (Brevo email) | Register yourself as a donor; you get a confirmation email; dashboard says active/pending with a checklist |
| **M3** blood banks + request | Prepare a CSV of real blood banks near Rajahmundry (see below) | Start a request: you see banks with stock labels |
| **M4** WhatsApp | Part 5 Stage A + permanent token + webhook | Login OTP arrives **on WhatsApp**; alert message arrives with 3 buttons |
| **M5** engine | Nothing | Agent shows integration tests passing |
| **M6** voice | Part 7 (Twilio) | Your phone rings; you press keys; result appears on the live page |
| **M7** accept flow | Nothing | Full flow with 2 friends |
| **M8** admin | Run the "make admin" command the agent gives you; set up admin 2-step login (authenticator app) | You can open `/admin` |
| **M9** hardening | Run a backup once (agent gives the command) | Backup file exists; store it safely |
| **M10** deploy + UAT | Do the real-phone test in `04-TEST-PLAN.md` §8 with 3 friends | All 15 steps pass |

### Blood bank CSV (for M3) — you prepare it
Make a spreadsheet and save as CSV with these columns (first row = column names):
`name,address,city,district,state,lat,lng,phones,bank_type,is_24x7,hours,licence_no,eraktkosh_id`
- `lat,lng`: right-click the place on Google Maps → click the numbers to copy.
- `phones`: several numbers separated by `;`.
- `bank_type`: `government`, `private`, `red_cross` or `hospital`.
- Do **not** copy-paste or scrape data in bulk from e-RaktKosh. Collect from public listings, phone calls or visits. For stock numbers, call the bank and enter them in the admin page.
- Later, email **C-DAC (eraktkosh@cdac.in)** and ask about a data partnership.

### How to report a bug to the agent (copy this shape)
> **What I did:** (steps)  
> **What I expected:**  
> **What happened:** (screenshot or exact error)  
> **Where:** (staging URL, phone model, language)  
No keys, no OTPs, no phone numbers of other people.

---

## 11. Testing with real people (safe way)

1. **Ask first.** Tell each friend: "I'm testing a blood-donor app. It will send you WhatsApp messages and a phone call during tests. You can say STOP anytime." Get a clear yes.
2. Add their numbers **everywhere** (all three are required):
   - `OUTBOUND_ALLOWLIST` (env, comma-separated, format `+919876543210`)
   - Meta test recipients (Part 5, max 5 people)
   - Twilio **Verified Caller IDs** (Part 7)
3. Redeploy on Vercel after changing the env.
4. Run the UAT script in `04-TEST-PLAN.md` §8.
5. Never test with strangers or with real hospitals.

---

## 12. Get the words checked by humans (do before real donors)

| Who | What to give them | Why |
|---|---|---|
| A **native Telugu speaker** (teacher/friend) | Telugu texts in `05-COPY-AND-TEMPLATES.md` + listen to the Telugu call | Natural words, no embarrassing mistakes |
| A **native Hindi speaker** | Hindi texts + Hindi call | Same |
| A **blood bank medical officer / doctor** (visit the government blood bank in Rajahmundry) | Health questions (PRD §8.3), waiting periods (3 months men / 4 months women), age 18-65, weight 45 kg | Medical safety. Ask: "Are these questions and gaps correct? What would you add?" |
| A **lawyer** (one hour, ask a college legal cell or mentor) | Privacy page, Terms, consent texts | India's Digital Personal Data Protection Act, telecom rules, liability wording |

Tell the agent the corrections; it updates the text files. Write the sign-offs in `docs/DECISIONS.md`.

---

## 13. Before REAL donors (go-live checklist)

- [ ] UAT passed on staging with 3 friends (all 15 steps).
- [ ] Telugu and Hindi texts reviewed; health questions reviewed by a doctor (or you accept the risk in writing in `docs/DECISIONS.md`).
- [ ] Privacy page and Terms reviewed; grievance contact (your email/phone) added.
- [ ] **Production** Supabase project created; migrations applied; Vault secrets set; auth settings repeated (Part 3.1) with the production URL.
- [ ] **Production** Vercel project (or production branch) with `APP_ENV=production`, `OUTBOUND_ALLOWLIST` **empty**, real WhatsApp number and permanent token.
- [ ] WhatsApp templates **approved** for the production number.
- [ ] Voice decision made: either `voice_enabled = off` (WhatsApp-only) **or** a paid provider with compliance confirmed.
- [ ] Admin account created with 2-step login (authenticator app).
- [ ] **Kill switch** tested (turn on → new requests blocked; turn off).
- [ ] Backup taken and stored (encrypted).
- [ ] UptimeRobot monitor on the production URL.
- [ ] You (or a volunteer) can **watch the admin screen** and call a blood bank yourself if the system fails. **Always tell families to also call blood banks and the 108 ambulance.** The app is an extra help, not the only help.
- [ ] Start small: invite **20-30 donors** you personally know (college NSS/NCC, friends' families). Ask each to register and confirm.
- [ ] For the first weeks, check the admin dashboard daily.

---

## 14. Everyday costs (so there are no surprises)

| What | When you pay | Rough size |
|---|---|---|
| WhatsApp alert messages | Each delivered template message | About ₹0.115 each for a normal alert (check Meta's India rate card; marketing or authentication messages may be priced differently). A request that alerts 20 donors ≈ ₹2-3 |
| WhatsApp login codes | Each OTP | Small per-message fee (authentication category) |
| New SIM for WhatsApp | One time | Cost of a SIM + recharge |
| Phone calls | Per minute, per call, after the trial | Check your provider's India price; keep calls to urgent requests only (the app already limits this) |
| Everything else in this guide | — | Free on the free plans |

Set a monthly cap you are comfortable with. Ask the agent for a small "usage" widget on the admin page (messages sent, calls placed) so you can see it.

---

## 15. If something goes wrong

| Problem | What to do |
|---|---|
| WhatsApp stopped working | Token expired → generate a new one (or use the permanent token). Check Meta's webhook page shows "verified". |
| Supabase says "project paused" | Click **Restore**. Then check that UptimeRobot is running. |
| No OTP arrives | Check the hook URL and secret (Part 3.1), that your number is in `OUTBOUND_ALLOWLIST` in non-production, and Meta recipient list. |
| Twilio call fails | Number not verified, India calling off (Part 7 step 2), or trial limits. |
| Vercel shows "env missing" | Add the variable → **Redeploy**. |
| Someone complains or opts out | Reply politely, set them opted-out in admin, apologize. |
| Fake request suspected | Admin → freeze request → block the user → note in audit log. |
| Anything scary (data leak, wrong person contacted) | **Turn on the kill switch**, tell the agent exactly what happened, and fix before turning it back on. |

---

## 16. Your "paste to the agent" cheat-sheet

- After creating accounts: `I added the keys to .env.local and Vercel. Continue with the next item in docs/SIVA-TODO.md.`
- When tests fail: `Run all tests, show me failures, fix them, and do not weaken any test.`
- Before a release: `Run the full CI locally, update docs/PROGRESS.md, and list anything I must do before the next milestone.`
- To review security: `Run the security tests in 04-TEST-PLAN.md §5 and report results. Fix any S1 or S2 issue before anything else.`
- To pause everything: `Stop coding. Summarize what is done, what is half-done, and what I must do.`

You are doing something important. Go step by step.
