# 02 — TRD: Technical Requirements (Blood MVP)

How to build what `01-PRD.md` describes. Where this file and the SQL in `supabase/` agree, the SQL is the source of truth for the database.

---

## 1. Architecture

```
 Browser (Next.js pages, PWA-ready)                 Donor's phone
   │  supabase-js (user session + RLS)                 ▲        ▲
   │  Realtime (requests, request_donor_cards)         │ WhatsApp │ voice call
   ▼                                                   │          │
┌───────────────────────────────  Vercel (Next.js 16)  ──────────────────────────────┐
│  Pages (server + client components)                                                │
│  Route Handlers  /api/**                                                           │
│    auth/hooks/send-sms     ← Supabase Auth hook (OTP → WhatsApp)                   │
│    webhooks/whatsapp       ← Meta (messages, statuses)                             │
│    webhooks/twilio/voice/* ← Twilio (answer, step, status)                         │
│    internal/tick           ← pg_cron every 30s (only when work is due)             │
│    health                  ← uptime monitor                                        │
│  src/server/engine        rings, waves, gates, dispatch                            │
│  src/server/assistant     script, eligibility rules, WhatsApp flow, IVR flow       │
│  src/server/providers     whatsapp.ts, voice/twilio.ts                             │
└───────────────┬───────────────────────────────────────────────┬────────────────────┘
                │ service_role (server only)                    │ HTTPS APIs
                ▼                                               ▼
        Supabase (Postgres + PostGIS + RLS + Auth + Realtime + Storage + pg_cron/pg_net)
                                                   Meta WhatsApp Cloud API · Twilio Voice
```

**One codebase, one deploy.** No Edge Functions, no separate worker server (the voice assistant is a scripted keypad flow driven by short webhooks, so serverless is enough).

### 1.1 Request life-cycle in one picture

```
Requester taps Send
  → RPC create_request()                       (DB: rate limit, validation, row)
  → POST /api/requests/{id}/start              (server: engine.runWave)
      → find_candidate_donors(ring)            (SQL, PostGIS)
      → insert request_contacts (queued)       (unique per request+donor)
      → for each contact in parallel:
           WhatsApp template  +  voice call    (allowlist + flags + policy)
  Donor answers (call keypad OR WhatsApp buttons)
      → webhook → assistant flow → eligibility rules
      → finalize_contact()                     (latest answer wins)
      → trigger creates request_donor_cards    → Realtime → requester screen
  pg_cron → /api/internal/tick (only if due)   → next wave / gate / enough-donors
```

---

## 2. Services and free-tier facts (checked 31 Oct 2026)

| Service | Plan | What we rely on | Limits that matter |
|---|---|---|---|
| **Supabase** | Free | Postgres + PostGIS, Auth, Realtime, Storage, pg_cron, pg_net, Vault | 500 MB DB, 1 GB storage, 5 GB egress, 50,000 MAU, ~200 concurrent Realtime connections; **project auto-pauses after 7 days of inactivity**; no automatic backups on Free; 2 free projects (use one for staging, one for production) |
| **Vercel** | Hobby | Next.js hosting, env vars, preview deploys | **Non-commercial use only**; functions default 10 s (configurable to 60 s); 1M function invocations/month; 100 deployments/day; cron jobs on Hobby are limited, so we use Supabase pg_cron instead |
| **Meta WhatsApp Cloud API** | Pay per message | Templates, webhooks | New numbers start at **250 unique business-initiated conversations per rolling 24 h** until quality/verification raises it; messages outside the 24-hour customer window must be **approved templates**; India utility template ≈ ₹0.115 per delivered message (check Meta's India rate card for Authentication and Marketing prices) |
| **Twilio Voice** | Trial → pay as you go | Outbound calls, TwiML `<Say>`, `<Gather>` | **Trial: only calls to numbers verified in the Twilio console**, calls come from a Twilio trial number, per-call and total minute caps, India calling must be enabled in Geo Permissions |
| **Brevo** | Free | SMTP for Supabase Auth emails | 300 emails/day, single-sender verification (no domain needed to start) |
| **UptimeRobot** (or cron-job.org) | Free | Pings `/api/health` every 5 min | Keeps Vercel warm and the Supabase project active |
| **OpenStreetMap** | Free | Map tiles (light use), Nominatim search | Nominatim: ≤ 1 request/second, valid User-Agent, **no autocomplete** (search only when the user presses Search); keep attribution |

Anything not in this table is **not allowed** without a `docs/DECISIONS.md` entry.

---

## 3. Project conventions

- TypeScript `strict`, ESLint, Prettier. No `any` without a comment.
- Pure logic (rings, rules, formatting, zod schemas) in `src/lib` or `src/server/*` **without I/O**, so unit tests are fast.
- All time math uses UTC in code and `Asia/Kolkata` for display and quiet hours.
- Clock injection: engine functions take a `now: () => Date` argument (default `() => new Date()`), so tests can fake time.
- Errors: throw typed `AppError(code, httpStatus, userMessageKey)`; Route Handlers convert to JSON `{ error: { code, message } }`.
- Logging: `logger.info/warn/error(event, fields)`; JSON; **redact** phone (`+91******1234`), tokens, OTPs, answers.
- Env access only through `src/server/env.ts` (zod-validated at startup; fail fast with a clear message).

---

## 4. Data layer

Use `supabase/migrations/0001_init.sql` (+ `0002_cron.sql`, `0003_storage.sql`) **exactly**. The DB test suite (`supabase/tests/10_schema_tests.sql`, run by `supabase/run_db_tests.sh`) must stay green; add tests for any new function you add. Key facts the code must respect:

| Topic | Rule |
|---|---|
| Request creation | Only via RPC `create_request(...)` (no insert policy). Called with the **user's session client**. Returns the new id. |
| Engine functions | `find_candidate_donors`, `claim_requests_for_tick`, `finalize_contact`, `rl_hit`, `refresh_request_progress` are **service_role only**. |
| Requester view | Browser reads `requests` and `request_donor_cards` (own only). Never `request_contacts`. |
| Donor view | Browser calls RPC `get_donor_request_view(contact_id)`. |
| Phone reveal | RPC `reveal_donor_phone(contact_id)`; rate-limited and audit-logged in SQL. |
| Donation confirm | RPC `confirm_donation(contact_id, code)`; also callable by server (`auth.uid() is null`) for admin tools. |
| Protected donor columns | `state`, `trust_level`, `reliability_score`, `donations_count`, `group_confidence`, `health_ok`, `health_checked_at`, `welcome_verified_at` cannot be changed by browser sessions (DB trigger). The server changes them through the service-role client. |
| Settings | `app_settings` rows: `kill_switch`, `voice_enabled`, `whatsapp_enabled`, `max_contacts_per_request`, `wave_minutes`, `rings_km`, `gates_km`. The engine reads them at the start of every tick (cache ≤ 10 s). |
| Realtime | Migration adds `requests` and `request_donor_cards` to the `supabase_realtime` publication. Subscribe with the user's session. |
| Deleting a user | `auth.admin.deleteUser(id)` cascades to every table (tested in T10). |

### 4.1 Encryption helper (`src/server/security/crypto.ts`)
- Algorithm: **AES-256-GCM**, 12-byte random IV, 16-byte tag. Key: `DATA_ENCRYPTION_KEY` (32 bytes, base64).
- Output string format: `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`. The `v1` prefix allows future key rotation.
- Used for: `donor_health.answers_enc`, `donor_private.emergency_name_enc`, `donor_private.emergency_phone_enc`.
- Unit tests: round-trip, tamper detection (flip a byte → throws), wrong key → throws, IV uniqueness.

---

## 5. Authentication details

### 5.1 Phone OTP over WhatsApp
1. Browser: `supabase.auth.signInWithOtp({ phone })`.
2. Supabase generates the OTP and calls our **Send SMS Hook** (HTTPS) — `POST /api/auth/hooks/send-sms`.
3. Verify the request with the **Standard Webhooks** signature (`standardwebhooks` package, secret `SEND_SMS_HOOK_SECRET` — Supabase shows it as `v1,whsec_...`; strip the prefix as Supabase docs describe). Reject invalid signature with 401.
4. Payload fields (from Supabase docs): `user.phone`, `sms.otp`. Respond `200` with empty JSON `{}` on success; non-2xx on failure (Supabase shows an error to the user).
5. Server sends the **authentication template** `blood_login_code` (language by the `Accept-Language`/cookie not available here → use English unless `user.user_metadata.locale` exists; default `en`) via WhatsApp with the OTP as body + button parameter (see `05-COPY-AND-TEMPLATES.md` §3).
6. Allowlist rule applies in non-production (if the number is not allowed → respond 200 **without sending** and log "skipped (allowlist)" — so tests with fake numbers pass).
7. **Dev/test:** configure Supabase **Test Phone Numbers & OTPs** (Auth settings). For these numbers Supabase does not need a real send. E2E tests use them.
8. Hook must respond within Supabase's timeout (a few seconds): do not do slow work; one WhatsApp API call only.
9. Never log the OTP.

### 5.2 Email verification (donors)
- After login, donor adds email in the wizard: server action calls `supabase.auth.updateUser({ email })` (session client). Supabase sends the confirmation mail through **custom SMTP (Brevo)**.
- Link points to `GET /auth/confirm?token_hash=…&type=email_change&next=/…` → route calls `supabase.auth.verifyOtp({ type, token_hash })`; on success the server (service role) sets `donor_private.email_verified = true`, saves the email, and runs `recomputeDonorState`.
- Email template customization (Supabase dashboard → Auth → Email templates) is done by Siva using `05-COPY-AND-TEMPLATES.md` §6.
- Resend limit: 3 per hour per user (app-level `rl_hit`).

### 5.3 Sessions and middleware
- `@supabase/ssr` with Next.js cookies; `src/middleware.ts` refreshes the session on every request, applies `next-intl` locale routing, and guards `/admin/**` (404 for non-admin) and `/become-donor`, `/donor`, `/d/*`, `/r/*`, `/need-blood/details` (redirect to login with `next=`).
- Use `supabase.auth.getUser()` (server-validated) for authorization decisions — **not** `getSession()`.

### 5.4 Admin MFA
- Required before production: admins must enroll **TOTP MFA** (Supabase MFA) and `/admin/**` requires assurance level `aal2`.

---

## 6. API surface

All JSON. Auth = session cookie unless stated. Validate with zod. Rate limit via `rl_hit` (key = `route:userId|ip`).

| Method + path | Auth | Purpose | Notes |
|---|---|---|---|
| `POST /api/auth/hooks/send-sms` | Supabase signature | OTP via WhatsApp | §5.1 |
| `GET /auth/confirm` | none | Email link handler | §5.2 |
| `POST /api/donor/register/[step]` | donor session | Save wizard steps (`consent`, `basic`, `blood`, `health`, `location`, `prefs`, `email`) | Writes with the **user** client when RLS allows; health/private writes use admin client **after** checking `user.id` equals target id |
| `POST /api/donor/recompute` | donor session | Recompute `state` | Also called internally after each step |
| `POST /api/donor/pause` · `DELETE /api/donor` | donor | Pause / delete account | Delete uses admin API |
| `GET /api/banks?lat&lng&group&component` | public | Nearby banks + stock | Max 10, within 100 km; `Cache-Control: s-maxage=30` |
| `POST /api/requests` | user (phone-verified) | Wrapper: calls RPC `create_request`, returns id | Also validates slip upload path |
| `POST /api/requests/[id]/start` | owner | Triggers first wave (`engine.runWave`) | Idempotent: if already started returns 200 |
| `POST /api/requests/[id]/decision` | owner | RPC `request_decision` | |
| `POST /api/requests/[id]/cancel` | owner | RPC `cancel_request` | |
| `POST /api/requests/[id]/compatible` | owner | Set `allow_compatible` | Owner update goes through server (no RLS update policy for owners) |
| `POST /api/contacts/[id]/reveal-phone` | owner | RPC `reveal_donor_phone` | Returns `{ phone }` |
| `POST /api/contacts/[id]/confirm-donation` | owner | RPC `confirm_donation` | |
| `POST /api/banks/[id]/report` | owner | Insert `bank_reports` | |
| `POST /api/reports` | user | Insert `abuse_reports` | |
| `GET/POST /api/webhooks/whatsapp` | Meta | Verification + events | §7 |
| `POST /api/webhooks/twilio/voice/answer` | Twilio signature | Start of call → TwiML | §8 |
| `POST /api/webhooks/twilio/voice/step` | Twilio signature | Keypad answers → next TwiML | §8 |
| `POST /api/webhooks/twilio/voice/status` | Twilio signature | Call status updates | §8 |
| `POST /api/internal/tick` | `Authorization: Bearer CRON_SECRET` | Engine tick | §9; `maxDuration = 30` |
| `GET /api/health` | none | `{ ok, db, time, lastTickAt }` | No secrets; touches DB with a trivial query |
| `POST /api/admin/**` | admin + aal2 | Admin actions | Each action writes `audit_logs` |

Server Actions may be used for form posts, but any endpoint listed above that is called by webhooks/cron must be a Route Handler.

---

## 7. WhatsApp integration (`src/server/providers/whatsapp.ts`)

Read Meta's current docs; shapes below are the stable core.

### 7.1 Sending
`POST https://graph.facebook.com/{WHATSAPP_GRAPH_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages`, header `Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}`.

- **Template message** (works anytime): `{ messaging_product:"whatsapp", to, type:"template", template:{ name, language:{ code }, components:[ {type:"body", parameters:[{type:"text", text:"..."}]}, {type:"button", sub_type:"url", index:"0", parameters:[{type:"text", text:"..."}]} ] } }`
- **Free-form text / interactive reply buttons** only inside the **24-hour window** (after the donor's last inbound message): `type:"text"` or `type:"interactive", interactive:{ type:"button", body:{text}, action:{ buttons:[{type:"reply", reply:{ id, title }}] } }`. Titles ≤ 20 characters; button ids ≤ 256 characters.
- Always send `to` as digits without `+`.
- Wrapper returns `{ ok, messageId?, errorCode?, retryable }`. Retry only on 5xx/429/network (max 2 retries, 500 ms then 1500 ms).
- `window_open(contact)` = `answers._last_inbound_at` within the last 23 hours.

### 7.2 Receiving (webhook `/api/webhooks/whatsapp`)
- **GET verification:** `hub.mode=subscribe` and `hub.verify_token == WHATSAPP_VERIFY_TOKEN` → respond with `hub.challenge` as plain text 200; else 403.
- **POST:** read the **raw body**; verify header `X-Hub-Signature-256` = `sha256=` + HMAC-SHA256(rawBody, `WHATSAPP_APP_SECRET`) using timing-safe compare; invalid → 401. Respond **200 quickly** (< 3 s); do work inline but keep it short (≤ 2 DB calls + 1 send).
- Payload: `entry[].changes[].value` has `messages[]` (inbound) and/or `statuses[]` (delivery receipts).
  - **Inbound message types to handle:** `interactive.button_reply` (our button ids), `button` (template quick-reply: `button.payload` / `button.text`), `text` (STOP detection + fallback), others → polite help reply once.
  - **Statuses:** `sent`, `delivered`, `read`, `failed` → update `request_contacts.wa_status` by `wa_message_id`.
- **Idempotency:** `insert into webhook_events(provider='whatsapp', event_id=<message id or `${id}:${status}`>)`; on conflict → stop processing (return 200).
- **Mapping to a contact:** button ids carry the contact id; **verify** that the sender's `wa_id` equals the donor's WhatsApp/phone number for that contact; otherwise ignore (anti-spoof).

### 7.3 Button id format
`a|<contactId>|<step>|<value>` e.g. `a|8f…|willing|yes`, `a|8f…|q_alcohol_24h|no`, `a|8f…|eta|30`, `a|8f…|share|yes`. Template quick-reply payloads for the alert template use `a|<contactId>|willing|yes|no|stop` — set when sending (`button` components with `sub_type:"quick_reply"` and `payload`).

### 7.4 Templates
Defined in `05-COPY-AND-TEMPLATES.md`. `scripts/create-wa-templates.ts` registers them through `POST /{WABA_ID}/message_templates` (all 3 languages), prints their approval status, and can be re-run to poll status (`--status`). The admin Settings page shows each template's status.

### 7.5 Opt-out / STOP
Any inbound text whose normalized form matches the STOP keywords in the copy doc (`STOP`, `UNSUBSCRIBE`, `ఆపండి`, `रुकें`, …) → `donor_prefs.opted_out = true, opted_out_at = now()`, cancel the donor's queued contacts, reply with the confirmation (free-form, window open).

---

## 8. Voice integration

### 8.1 Interface (`src/server/providers/voice/types.ts`)
```ts
export interface VoiceProvider {
  name: 'twilio';
  placeCall(args: { contactId: string; toE164: string; lang: 'en'|'te'|'hi' }):
    Promise<{ ok: boolean; callSid?: string; errorCode?: string; retryable: boolean }>;
}
```
`voice/index.ts` returns the provider from `VOICE_PROVIDER`. Keep all Twilio specifics inside `twilio.ts` and the webhook handlers so a future Indian provider can be added.

### 8.2 Twilio specifics
- **Placing the call:** Twilio REST `calls.create({ to, from: TWILIO_FROM_NUMBER, url: `${PUBLIC_APP_URL}/api/webhooks/twilio/voice/answer?c=${contactId}&l=${lang}`, method:'POST', statusCallback: `${PUBLIC_APP_URL}/api/webhooks/twilio/voice/status?c=${contactId}`, statusCallbackEvent:['initiated','ringing','answered','completed'], statusCallbackMethod:'POST', timeout: 25 })`. Save `callSid` to `request_contacts.call_sid` and `call_status='dialing'`.
- **Signature check:** every webhook validates `X-Twilio-Signature` with `twilio.validateRequest(AUTH_TOKEN, signature, fullUrl, params)`. Build `fullUrl` from `PUBLIC_APP_URL` + path + query (not from request headers) so proxies do not break it. Invalid → 403.
- **IVR flow:** the flow is a state machine in `src/server/assistant/ivr-flow.ts` (see `03-AI-SPEC.md` §5). Each webhook returns TwiML (`text/xml`):
  - `<Say voice=… language=…>` text `</Say>`
  - `<Gather input="dtmf" numDigits="1" timeout="6" action="…/step?c=…&s=<stepKey>&l=<lang>&try=<n>" method="POST">` containing the `<Say>` prompt `</Gather>`
  - on no input: re-prompt once (`try=2`), then end the call politely and leave the WhatsApp message as the fallback.
- **Voices:** English `Google.en-IN-Standard-E` · Hindi `Google.hi-IN-Standard-E` · Telugu `Google.te-IN-Standard-C` (female). Twilio's voice list can change: if a voice is rejected, fall back to `Polly.Aditi` for en/hi and log a warning; keep voices in `src/server/assistant/voices.ts`.
- **Trial accounts:** a trial call may begin with a Twilio notice and a "press any key" step before your TwiML runs. This is expected during development; the code does nothing special.
- **Status callback mapping:** `ringing`→`ringing`, `in-progress`/`answered`→`answered`, `completed`→`completed`, `busy`→`busy`, `no-answer`→`no_answer`, `failed`/`canceled`→`failed`. If a call ends `completed` but the contact is still undecided → leave `contacting` (WhatsApp may still answer).
- **Idempotency:** `webhook_events(provider='twilio', event_id = CallSid + ':' + CallStatus)`; for `step` calls use `CallSid + ':' + stepKey + ':' + try`.
- **Retry:** if the call ended `no_answer`/`busy` and the request urgency is `now` and no retry happened yet → one retry after 120 s (store `answers._call_retry = true`).
- **No recording in the MVP.**

---

## 9. Engine (`src/server/engine`)

### 9.1 Constants (`src/lib/engine-config.ts`; overridable from `app_settings`)
```ts
export const RINGS_KM = [0.5,1,2,3,5,10,15,20,30,40,50,70,90,100];
export const GATES_KM = [70,90,100];           // ask requester before searching these rings
export const WAVE_MINUTES = { now:3, six_hours:8, twenty_four_hours:20, planned:60 };
export const CONTACT_MULTIPLIER = 3;            // contact 3× units still needed
export const MAX_CONTACTS_PER_REQUEST = 30;
export const CALL_RETRY_SECONDS = 120;
export const WA_WINDOW_HOURS = 23;
```

### 9.2 `tick()` (called by `/api/internal/tick`, also callable from tests)
```
1. settings = loadSettings(); if kill_switch.enabled → return {skipped:'kill_switch'}
2. due = rpc claim_requests_for_tick(limit=5, lease=20s)   // lease prevents double work
3. for each request r (sequentially; each wrapped in try/catch; failure → log + next_tick_at = now+30s):
     await processRequest(r, settings, now)
4. return summary { processed, errors }
```
Keep total runtime < 25 s (`maxDuration = 30`). If a request needs more work than the budget, set `next_tick_at = now()` and move on.

### 9.3 `processRequest(r)`
```
a. refresh r from DB (status must still be 'searching'; else return)
b. if now > r.needed_by + 6h → set status 'expired' (cancel pending) → return
c. needed = r.units_needed - r.accepted_count ; if needed <= 0 → return (SQL trigger already set enough_donors)
d. pending = contacts of r where status in ('queued','contacting')
   - if r.wave_expires_at is in the future AND pending.length > 0:
         set next_tick_at = min(r.wave_expires_at, now+30s); return          // still waiting for answers
   - else (wave over): mark pending where status='contacting' → 'no_answer' (WhatsApp may still turn them 'accepted' later: finalize_contact allows it)
e. contactsSoFar = r.contacts_count ; if contactsSoFar >= MAX_CONTACTS → markExhausted(r); return
f. ringIdx = indexOf(r.current_ring_km) or 0 for first wave
g. loop (ringIdx..end):
     ring = RINGS_KM[ringIdx]
     if ring > r.approved_up_to_km:
          set status 'waiting_requester', pending_gate_km = ring ; return        // PRD BR-7
     limit = min(needed * CONTACT_MULTIPLIER, MAX_CONTACTS - contactsSoFar)
     candidates = rpc find_candidate_donors(r.id, ring, limit)
     if candidates.length == 0: ringIdx++ ; continue                              // empty ring skipped instantly
     insert contacts (status 'queued', ring_km=ring, wave_no=r.wave_no+1, distance_km)
     update request: current_ring_km=ring, wave_no+1, wave_expires_at = now + waveMinutes(urgency), next_tick_at = wave_expires_at
     await dispatchContacts(contacts)                                              // §9.4
     return
h. after the loop (no ring left): markExhausted(r)
```
`markExhausted`: set `exhausted_at = now()`, keep status `searching` but `next_tick_at = now()+1h` (so it is checked again and admin can widen); add an `abuse_reports`-style admin alert: insert `audit_logs(action='request_exhausted')`; requester UI reads `exhausted_at`.

### 9.4 `dispatchContacts(contacts)`
For each contact (concurrency 10):
```
policy = decidePolicy(contact, request, settings):
   whatsapp = settings.whatsapp_enabled
   voice    = settings.voice_enabled && provider configured && urgency in ('now','six_hours') && donor.languages ok
allowlist check per channel (§12.2) → skipped channels marked 'skipped'
set contact.status = 'contacting'
await Promise.allSettled([ sendAlertTemplate(contact), placeCall(contact) ])
save wa_message_id / wa_status('sent'|'failed'), call_sid / call_status
if BOTH channels failed or skipped → status 'needs_human' (admin queue)
```

### 9.5 After a donor decision (`onContactDecided`)
Called by webhook handlers after `finalize_contact`:
- `accepted` → send the donor the details message (free-form if the window is open, else template `blood_donor_details`). If the card is **standby** (`request_donor_cards.is_standby`), send the standby wording instead ("We have enough donors for now; we will contact you if needed."). Send the requester template `blood_donor_accepted` on the **first** acceptance and when the request becomes `enough_donors`. Realtime updates the screen.
- `declined` / `not_eligible` → thank-you message (free-form if the window is open; otherwise none).
- **Request closed** (any of completed / cancelled / stopped / expired, triggered by the requester, admin, or cron) → for every contact in `accepted`/`on_the_way`/`arrived` send `blood_request_closed` (free-form if the window is open, else template). Contacts that never answered get **no** message.
- Phone calls and WhatsApp flows still in progress when the request is `enough_donors` may continue (they can become standby); once the request is closed they end with the "already fulfilled" message.

### 9.6 Admin overrides
Admin actions call the same functions: freeze (status `frozen`), widen (`approved_up_to_km` set, `next_tick_at = now`), set compatible, close.

---

## 10. Bank data

- `scripts/import-banks.ts <file.csv>` and the admin upload both use the same parser.
- **CSV columns:** `name,address,city,district,state,lat,lng,phones,bank_type,is_24x7,hours,licence_no,eraktkosh_id` (`phones` separated by `;`; `bank_type` ∈ government/private/red_cross/hospital; `is_24x7` true/false). Upsert key: `name + lat + lng`.
- Validation: lat 6–38, lng 68–98 (India), at least one phone, phone format `+91…` or STD numbers allowed as text. Report row-wise errors.
- Stock editor writes `bank_stock` with `source='admin_call'` and `updated_by`.

---

## 11. Frontend notes

- **Wizard state:** keep in a small client store (Zustand or React context) + URL step param; persist draft in `sessionStorage` (never donor health answers).
- **Maps:** Leaflet only on pages that need it (dynamic import, `ssr:false`). OSM tile URL with attribution. Geocoding: Nominatim `search?format=jsonv2&countrycodes=in&q=` on button press; set `User-Agent`/`Referer` appropriately via a server route proxy `/api/geocode` (rate-limited 1/s per IP) so headers are controlled.
- **India bounds check** on every coordinate (server + client).
- **ETA estimate:** `eta_minutes = ceil(distance_km * 1.4 / 25 * 60)` for display until the donor's own ETA answer exists.
- **Realtime:** `supabase.channel('req-'+id).on('postgres_changes', {event:'*', schema:'public', table:'requests', filter:'id=eq.'+id}, …)` and the same for `request_donor_cards` with `filter: 'request_id=eq.'+id`. Also poll every 15 s as a fallback.
- **Big UX rules:** the Need Blood button is the largest element on home; no modal before the first screen; the wizard keeps the user's choices if they go back.
- **Fonts:** `Noto Sans`, `Noto Sans Telugu`, `Noto Sans Devanagari` via `next/font` with `display: swap`.
- **PWA:** `manifest.webmanifest`, icons, theme color; no service worker caching of authenticated API responses.

---

## 12. Security

### 12.1 Headers and web
- Set in `next.config.ts`: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(self), camera=(), microphone=()`.
- **CSP** (report-only first, then enforce): `default-src 'self'`; `img-src 'self' data: https://*.tile.openstreetmap.org https://*.supabase.co`; `connect-src 'self' https://*.supabase.co wss://*.supabase.co`; `script-src 'self' 'nonce-…'`; `style-src 'self' 'unsafe-inline'` (Tailwind/Leaflet) ; `frame-ancestors 'none'`.
- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax`.
- CSRF: state-changing Route Handlers require `Content-Type: application/json` **and** a same-origin `Origin` header (reject otherwise); webhooks are exempt but signature-checked.

### 12.2 Outbound allowlist (`src/server/security/allowlist.ts`)
```ts
canContact(e164): boolean =
  APP_ENV === 'production' ? true
  : OUTBOUND_ALLOWLIST.includes(e164)
```
- In `local`/`staging`, if `OUTBOUND_ALLOWLIST` is empty → **nothing is ever sent** (log once).
- Every provider call goes through `canContact`; tests assert this.
- Also forbid sending to numbers in a hard "never" list (`+910000000000`, `+911234567890`, numbers starting `+910`), and to any number not matching `^\+91[6-9]\d{9}$`.

### 12.3 Rate limits (via `rl_hit`, fixed windows)
| Key | Limit |
|---|---|
| OTP sends (our hook) | 5 / hour / phone; 20 / hour / IP |
| `create_request` | 3 / day / user (in SQL) |
| reveal phone | 30 / hour / user (in SQL) |
| donation confirm attempts | 5 wrong / hour / request |
| geocode proxy | 1 / second / IP, 200 / day / user |
| donor register steps | 60 / hour / user |
| abuse reports | 10 / day / user |
| webhook endpoints | none (signature only) but body size ≤ 256 KB |

### 12.4 Input and uploads
- Zod schemas shared between client and server (`src/lib/schemas`). Reject unknown keys (`.strict()`).
- Uploads (doctor slip): images/PDF ≤ 2 MB, validated by magic bytes, stored under `<user_id>/<uuid>.<ext>` in the private bucket; never served publicly; admin views through short-lived signed URLs.
- Free-text fields (note, ward) are length-limited and rendered as text (never HTML).
- Note filter: reject notes containing a phone-number-like pattern or words from the "money words" list (`pay`, `rupees`, `₹`, `UPI`, `PhonePe`, `GPay`, `paytm`, `cash`, in en/te/hi transliterations) with a friendly message.

### 12.5 Secrets and logging
- Secrets only in env. `scripts/gen-secrets.ts` prints random values for `CRON_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `DATA_ENCRYPTION_KEY`.
- `redact()` utility used by the logger for phone numbers, tokens, `authorization` headers, `answers`.
- CI: `gitleaks` (or `npm run secrets:scan`) step must pass.

### 12.6 Data lifecycle
- Cron cleanup (in `0002_cron.sql`): rate-limit rows 2 days, webhook events 30 days, message events 90 days.
- Requests older than 90 days after closing: anonymize patient first name and hospital ward (`scripts/anonymize-old.sql` + cron in Phase 2; document as TODO).
- Weekly backup: `scripts/backup.sh` (`pg_dump` using `SUPABASE_DB_URL`) run by Siva manually (Free plan has no automatic backups). Backups are encrypted (`age` or `gpg`) before storage.

---

## 13. i18n

- Routing: `/{locale}/…`, default `en`; locale cookie remembered; language switch on every page header.
- Message files `src/messages/{en,te,hi}.json`, same keys. CI check: all three files have identical key sets (script `tests/unit/i18n-keys.test.ts`).
- Server-sent messages (WhatsApp, voice) use `src/server/assistant/prompts.ts` which imports the strings from `05-COPY-AND-TEMPLATES.md` (translate to TS objects).
- Numbers, dates: `Intl` with `en-IN`, `te-IN`, `hi-IN`; time zone `Asia/Kolkata`.
- Spoken blood groups and units have their own tables in `prompts.ts` (copy doc §5).

---

## 14. Admin

- Layout `/[locale]/admin` with tabs: **Live**, **Needs human**, **Donors**, **Banks**, **Reports**, **Settings**, **Audit**.
- Server components fetch with the admin's session (RLS admin policies) where possible; privileged reads/writes via service role inside route handlers that first verify `is_admin()` and `aal2`.
- Health widget: last tick time (store in `app_settings` key `last_tick` updated each tick), queue depth, failed sends in last hour.

---

## 15. Deployment

### 15.1 Environments
| | Supabase | Vercel | WhatsApp | Twilio | `APP_ENV` |
|---|---|---|---|---|---|
| Local | local (`supabase start`) or staging project | `next dev` | test number | trial | `local` |
| **Staging** | Free project #1 | Vercel preview/branch `staging` | test number (≤5 recipients) | trial (verified numbers) | `staging` |
| **Production** | Free project #2 | Vercel production | real number | paid account | `production` |

### 15.2 First deploy order (the agent writes commands; Siva runs the account parts)
1. Create Supabase project → run migrations `0001`, `0003`; enable `pg_cron`, `pg_net`; create Vault secrets; run `0002`.
2. Configure Supabase Auth: enable Phone provider, Send SMS Hook → `${PUBLIC_APP_URL}/api/auth/hooks/send-sms`, test numbers, custom SMTP, URL configuration (site URL + redirect URLs), email templates, rate limits.
3. Vercel: import repo, set env vars, deploy.
4. Meta: webhook callback `${PUBLIC_APP_URL}/api/webhooks/whatsapp` + verify token; subscribe to `messages`; run `scripts/create-wa-templates.ts`.
5. Twilio: nothing to configure for webhooks (URLs are sent per call); enable India in Geo Permissions; verify test phone numbers.
6. Uptime monitor on `${PUBLIC_APP_URL}/api/health`.
7. `scripts/make-admin.ts` for Siva's phone; enroll MFA.

### 15.3 CI (`.github/workflows/ci.yml`)
Jobs: `lint+typecheck` → `unit` → `db-tests` (service `postgis/postgis:16-3.4`; run `supabase/run_db_tests.sh` with `PGURL`) → `integration` → `e2e` (Playwright; Supabase CLI `supabase start`; test phone numbers) → `audit` (`npm audit --audit-level=high`) → `secrets` scan. All required on `main`.

---

## 16. Error taxonomy (user-facing keys)

`auth_required`, `phone_not_verified`, `rate_limited`, `duplicate_request`, `service_paused`, `invalid_input`, `not_found_or_forbidden`, `code_wrong`, `code_locked`, `donor_not_eligible`, `provider_unavailable`, `unknown`. Each has en/te/hi text in `05-COPY-AND-TEMPLATES.md` §7. Never leak internal messages.

---

## 17. Things the agent must **not** do
- Do not call WhatsApp/Twilio from browser code.
- Do not return donor phone numbers in any list endpoint or in Realtime payloads.
- Do not add analytics/trackers or third-party scripts.
- Do not use `any` for webhook payloads: define zod parsers with `.passthrough()` for unknown fields.
- Do not write to `request_contacts` from the browser.
- Do not "fix" a failing DB test by weakening RLS.
