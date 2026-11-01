# 01 — PRD: Blood MVP (Product Requirements)

Audience: the coding agent (and Siva). Language: simple on purpose. Every requirement has an ID so tests can point to it.

---

## 1. Purpose

When someone urgently needs blood, finding donors by WhatsApp status and phone calls is slow and random. **Blood** finds **verified, nearby, willing donors** automatically, confirms each one by an automated call + WhatsApp, and shows the confirmed ones live to the family.

**Origin story (for context only):** the founder's uncle died after the family could not find O-positive blood within four hours. The blood existed; the *connection* did not happen in time.

### 1.1 MVP goals
1. A family can start a request in under **60 seconds** (after login).
2. First eligible donors are contacted within **10 seconds** of pressing Send.
3. Only **verified** donors are contacted, and only after they **consented**.
4. Donor privacy is protected by design (see §9).
5. Runs on **free tiers** for the pilot (Rajahmundry), with a clear list of what costs money.

### 1.2 Pilot success metrics (for later review)
- Time to first accepted donor (median) for `now` requests: target < 10 minutes.
- Donor answer rate (call or WhatsApp): > 50%.
- Fulfilment rate (enough donors confirmed): track weekly.
- Complaints / opt-outs per 100 contacted donors: < 3.
- Fake/abusive requests: near 0.

---

## 2. Users

| Persona | Who | Needs |
|---|---|---|
| **Requester** (Suresh) | Family member at a hospital, stressed, may be on a cheap phone, speaks Telugu | One big button, few words, fast, trustworthy |
| **Donor** (Anil) | 18–65 volunteer, has WhatsApp, may not read English well | Be asked only when it matters, control over contact, no spam, privacy |
| **Admin** (Blood team) | Siva + a few volunteers | See live requests, step in, verify, fix data, stop everything fast |
| **Blood bank staff** | Not a user in the MVP | (Phase 2: update stock themselves) |

---

## 3. Scope

### 3.1 IN the MVP
- Requester web app (PWA-ready, mobile-first) in **English, Telugu, Hindi**.
- Phone login by **OTP delivered on WhatsApp** (also confirms WhatsApp works).
- Donor registration with verified phone + verified email, consents, health quick-check, location, preferences.
- Blood bank directory with **manual/admin-entered stock** and freshness labels.
- Request creation → **engine**: rings, waves, gates, fatigue limits, quiet hours.
- **WhatsApp + automated voice call** contact to donors (scripted keypad assistant; same questions on both channels).
- Live requester screen (Supabase Realtime): accepted donors, progress, popups.
- Phone reveal to requester after donor consent.
- Donation Code + confirmation; donor stats and cooling date.
- Admin dashboard (live requests, donors, banks, kill switch, audit log).
- Opt-out (STOP), pause, delete account.

### 3.2 OUT of the MVP (do **not** build; list is for clarity)
- AI-driven free-form voice conversation (spec exists as optional "AI mode" in `03-AI-SPEC.md` §9 — **not** to be built now).
- Calling blood banks automatically; blood bank logins; any e-RaktKosh scraping/integration.
- Masked calling, payments, goodies-kit logistics (only a `kit_eligible` flag is recorded via donation count).
- Native Flutter/Android/iOS apps; web-push notifications.
- Real road-routing ETA (use straight-line × factor).
- Multi-city expansion tooling.

---

## 4. Business rules (the law of the app)

| ID | Rule |
|---|---|
| BR-1 | Donor age must be **18 to 65**. Under-18 can never register. Weight must be **≥ 45 kg** to become `active` (otherwise `pending` with a kind message). |
| BR-2 | Gap between donations: **male 3 months, female/other 4 months** (constants in `src/lib/donor-rules.ts`; marked "confirm with blood bank doctor"). The database also computes `next_eligible_date`. |
| BR-3 | Donor fatigue: at most **1 request per 6 hours**, **3 per 7 days**, and the donor's own monthly cap (default 4). Already-helping donors are skipped. |
| BR-4 | Exact blood-group match first. Compatible groups only when the requester switches **"also accept compatible groups"** on. Platelets and plasma are **exact group only**; platelets also need the donor to have said they donate platelets. |
| BR-5 | Per wave, contact up to **3 × (units still needed)** donors. Max **30** contacts per request (setting). |
| BR-6 | Distance rings (km): `0.5, 1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 70, 90, 100`. **Empty rings are skipped instantly.** A donor is only contacted if the ring distance ≤ the donor's own "willing to travel" setting (3, 5, 10, 25, 50 or 100 km). |
| BR-7 | **Gates:** before searching beyond 50 km the requester must agree at **70**, **90** and **100** km. At 100 the copy is stronger ("very hard to reach"). After 100 km with nobody → request marked `exhausted`, admin is alerted ("needs human"), requester is shown banks + helpline advice. |
| BR-8 | Wave wait time before widening: urgency `now` 3 min · `six_hours` 8 min · `twenty_four_hours` 20 min · `planned` 60 min (settings). |
| BR-9 | When accepted donors ≥ units needed → status `enough_donors`: **no new people are contacted** (queued ones are cancelled). Donors already being contacted may still answer; if they accept they become **standby** (shown with a "Standby" label; total accepted is capped at 2 × units). If a confirmed donor cancels, the first standby is promoted automatically; if nobody is left the search **re-opens**. When the request is closed (completed / cancelled / stopped / expired), every accepted donor gets a "request closed, thank you" message so nobody travels for nothing. |
| BR-10 | A donor's phone number is shown to the requester **only** after the donor accepted **and** said "yes, share my number". Every reveal is logged. |
| BR-11 | A donor sees ward/exact hospital pin/requester phone **only after** accepting. |
| BR-12 | Every outbound message/call says that Blood **never asks for money or OTP**, and that the **final health check is done by the blood bank doctor**. |
| BR-13 | Quiet hours: if the donor set quiet hours, they are skipped, **except** `now` requests when the donor allowed critical alerts (default allowed). |
| BR-14 | Opt-out: a donor replying **STOP** (any language variant in the copy doc) is opted out immediately and confirmed. |
| BR-15 | Health quick-check answers expire after **6 months**; expired → the donor is not matched until re-confirmed (dashboard banner). |
| BR-16 | Requester limits: **3 requests/day**, no duplicate active request (same patient + hospital), phone must be OTP-verified. |
| BR-17 | Blood bank stock freshness label: 🟢 < 2 h · 🟡 2–12 h · ⚪ older/unknown ("call to confirm"). Always show "Stock changes quickly. Call before you go." |
| BR-18 | Bank trust score: starts 50; "found" report +3; "not found" report −8; clamp 0–100. Label: ≥80 Reliable, 40–79 OK, <40 "Often wrong". |
| BR-19 | **Kill switch** (admin) instantly blocks new requests and stops all outbound contact. |
| BR-20 | Everything shown to users is localized (`en`, `te`, `hi`). Dates in India time (IST). Phone numbers: Indian mobile only (`+91`, starts 6–9). |

---

## 5. Journeys

### 5.1 Requester (happy path)
1. Opens site → taps big red **Need Blood**.
2. Chooses blood group, blood type (whole blood default), units, urgency.
3. Picks hospital location (GPS / search / drag pin / type name).
4. **Immediately** sees nearest blood banks + stock + freshness. If a bank has stock, goes there (request not needed).
5. Taps **Search donors** → logs in with phone (OTP on WhatsApp) if not logged in.
6. Fills patient/requester details, reviews the default message, taps **Send**.
7. Live screen: progress ("Searching within 3 km · 12 contacted · 1 accepted · need 2"), accepted donor cards, timeline.
8. Taps **Call** on a donor card → phone dialer opens.
9. At 70/90/100 km: popup asks to continue.
10. Closes: "Got blood" / "Cancel". Confirms donation by entering the donor's **Donation Code**; reports whether any bank's stock was correct.

### 5.2 Donor (happy path)
1. Taps **Become a donor** → logs in with phone OTP on WhatsApp.
2. Completes the registration wizard (§7). Verifies email through a link.
3. Becomes **active**. Receives a short welcome WhatsApp message with STOP instructions.
4. Later: a request arrives → **WhatsApp alert + phone call** at the same time.
5. On the call (or WhatsApp buttons): confirms who they are, willingness, 4 health questions, ETA, number-sharing consent.
6. Receives details + **Donation Code**. Goes to the hospital, tells the code.
7. After confirmation: thank-you message, cooling date, donation count.

### 5.3 Admin
Sees live requests on a list/map, "needs human" items, new donors, abuse reports; imports banks; edits stock; can freeze a request, message/call manually, flip the kill switch.

---

## 6. Pages and routes (all under `/[locale]/`, locales `en`, `te`, `hi`)

| Route | Who | Purpose |
|---|---|---|
| `/` | all | Home: Need Blood, Become a donor, how it works, language switch |
| `/need-blood` | all | Request wizard steps 1–4 (blood details → location → banks list) |
| `/need-blood/details` | logged-in | Patient/requester details + message review + Send |
| `/r/[requestId]` | requester | Live status page |
| `/login` | all | Phone OTP login (also used inline) |
| `/become-donor` | all | Donor wizard (requires login) |
| `/donor` | donor | Dashboard: profile, availability, history, next eligible date, privacy, delete |
| `/d/[contactId]` | donor | Request view for a donor contacted (details after accept; respond buttons) |
| `/admin` … | admin | Live, donors, banks, reports, settings, audit |
| `/privacy`, `/terms`, `/how-it-works` | all | Static pages (copy provided) |
| `/api/**` | system | See TRD §6 |

---

## 7. Functional requirements

Each requirement has **acceptance criteria (AC)**. "Given/When/Then" in plain words.

### 7.1 Authentication (AUTH)

| ID | Requirement | AC |
|---|---|---|
| AUTH-1 | Phone login with OTP | Enter `+91` mobile → OTP arrives **on WhatsApp** (template `blood_login_code`) → enter 6 digits → logged in. Wrong OTP 3× → locked 15 min. Max 5 OTP sends/hour/number (Supabase rate limits + our hook). |
| AUTH-2 | Dev/test login without sending | With Supabase **test phone numbers**, fixed OTP works without any WhatsApp call (used in tests and local dev). |
| AUTH-3 | Session | Cookie-based SSR session (`@supabase/ssr`); refresh in middleware; "Log out" and "Log out everywhere". |
| AUTH-4 | Admin | Admin = row in `admin_users`. `/admin/**` returns 404 for non-admins. Promote with `scripts/make-admin.ts <phone>`. |
| AUTH-5 | Phone format | Only Indian mobiles `+91[6-9]xxxxxxxxx`. Show friendly errors in all 3 languages. |

### 7.2 Donor registration (DON) — see §8 for exact fields

| ID | Requirement | AC |
|---|---|---|
| DON-1 | Wizard with 8 steps and progress bar, saves after each step (can resume) | Closing the browser and returning continues at the right step. |
| DON-2 | Step 1: consent screen (6 separate unticked checkboxes) | Cannot continue until all required are ticked; stored in `consents` with version `v1`. |
| DON-3 | Basic details with validation | Age 18–65 enforced (DB also enforces); weight 30–250; names 2–80 chars. |
| DON-4 | Blood details | 8 groups + "I'm not sure" (→ `pending`, with explanation and advice to test). |
| DON-5 | Health quick-check (§8.3) | Any blocking "yes" → donor `pending` with the date to try again (when known) and kind copy. Answers stored **encrypted** (`donor_health.answers_enc`); only `blocking_reason` + `health_ok` readable by logic. |
| DON-6 | Location | Map pin (GPS or drag), area, city, pincode (6 digits), max travel km (3/5/10/25/50/100), transport. Stored as `geography(Point)`. |
| DON-7 | Preferences | Quiet hours, allow critical alerts in quiet hours (default on), max requests/month (default 4), platelets willingness. |
| DON-8 | Email verification | Email entered; confirmation link sent via SMTP; donor cannot become `active` until verified. Resend allowed (max 3/hour). |
| DON-9 | Activation | `active` only when: phone verified, email verified, all required consents, age ok, weight ≥ 45, `health_ok`, blood group known, location saved. Otherwise `pending` with a checklist telling what is missing. |
| DON-10 | Dashboard | Shows state, checklist, next eligible date ("You can donate again on …"), **Pause** (7/30/90 days / until date), edit profile (re-verifies phone/email if changed), history, **Delete my account**. |
| DON-11 | Delete account | After a confirmation screen, the account and all personal data (profile, location, health, private contact data, consents) are deleted at once. Only anonymous counters remain (no personal data). Past requests keep working without the donor's details. |
| DON-12 | Opt-out by WhatsApp | Replying `STOP` / `ఆపండి` / `रुकें` sets `opted_out`; confirmation message; dashboard shows a banner and "Resume alerts" button. |
| DON-13 | Re-confirm health every 6 months | Banner + disabled matching until redone. |

### 7.3 Blood banks (BNK)

| ID | Requirement | AC |
|---|---|---|
| BNK-1 | List nearby banks after location is chosen | Sorted by distance (within 100 km, max 10 shown), card shows name, distance, open now / 24×7, phone (tap to call), stock for the chosen group+component, freshness label, trust label. |
| BNK-2 | "Directions" | Opens Google Maps/OSM link with coordinates (external link). |
| BNK-3 | Stock freshness | Per BR-17. If no stock row exists: "Not verified — please call". |
| BNK-4 | Feedback | After the request closes, requester can tap "Found / Not found" per bank visited → `bank_reports` → trust score per BR-18. |
| BNK-5 | Admin import | CSV upload (columns in TRD §10) creates/updates banks; errors listed per row. |
| BNK-6 | Admin manual stock | Edit units per group+component, with `source = admin_call` and timestamp. |

### 7.4 Request creation (REQ)

| ID | Requirement | AC |
|---|---|---|
| REQ-1 | Blood step | Group (8 big buttons + "I don't know" which shows advice and still lets the user see banks but **blocks** donor search until a group is chosen), type (default whole blood), units 1–6 (+ "More" up to 10), urgency (4). |
| REQ-2 | Location step | Use GPS / search hospital name (Nominatim, **on submit only**, ≥ 1 s between calls, valid User-Agent) / drag marker / type hospital name. Hospital name + pin required. |
| REQ-3 | Details step | Fields per `create_request` RPC. Patient: first name only. No Aadhaar/address/medical history asked, ever. Optional doctor-slip photo (private bucket) → admin may mark `slip_verified`. |
| REQ-4 | Message review | Default message from copy doc, editable only in the "note" (≤ 300 chars). Warn if a phone number or a money word is typed in the note and block it. |
| REQ-5 | Send | Calls RPC `create_request`; then triggers the engine; redirects to `/r/[id]`. Errors (rate limit, duplicate, kill switch) are shown clearly. |
| REQ-6 | Live page | Realtime updates of `requests` and `request_donor_cards`; progress header; donor cards; timeline from `message_events` summaries (no PII); buttons: Need more units (creates new request prefilled), Got blood, Cancel, Report a problem. |
| REQ-7 | Gate popup | When `status = waiting_requester`, show modal per BR-7; Yes → RPC `request_decision(true)`; No → `false`. If no answer in 5 min on an `now` request, show a repeating nudge (do not auto-continue). |
| REQ-8 | Call a donor | "Call" calls RPC `reveal_donor_phone` then opens `tel:`. If donor refused number sharing: show "The donor will call you. Your number was sent to them." |
| REQ-9 | Close | "Got blood" → `cancel_request(id, 'got_blood')`; asks for Donation Code confirmation per donor and bank feedback. |
| REQ-10 | Report | Report a donor/request → `abuse_reports`. |
| REQ-11 | Compatible groups | After the 10 km ring finds nobody with exact group, show a one-time prompt: "Ask the doctor: can compatible blood groups be used?" with a toggle to enable (admin and requester can set `allow_compatible`; the engine reads it every wave). |

### 7.5 Engine (ENG) — details in TRD §9

| ID | Requirement | AC |
|---|---|---|
| ENG-1 | Start | On request creation, the first wave runs within 10 s. |
| ENG-2 | Rings & waves | Per BR-5…BR-8; proven by integration tests with fake time. |
| ENG-3 | Gates | Per BR-7; request stays paused until requester decides; admin sees it. |
| ENG-4 | Enough donors | Per BR-9, including standby promotion and re-open. |
| ENG-5 | Exhausted | After last ring with none → `exhausted_at` set, admin alert in dashboard, requester sees guidance (banks, 108 ambulance, hospital emergency desk, "Our team has been alerted"). |
| ENG-6 | Concurrency safety | Two ticks never process the same request at once (`claim_requests_for_tick`). |
| ENG-7 | Kill switch & flags | Honors `kill_switch`, `voice_enabled`, `whatsapp_enabled` instantly. |
| ENG-8 | Allowlist | Per Golden Rule 1. |
| ENG-9 | Expiry | Requests older than `needed_by + 6 h` → `expired` (cron `expire_old_requests`). |

### 7.6 Contacting donors (CON) — scripts in `03-AI-SPEC.md`

| ID | Requirement | AC |
|---|---|---|
| CON-1 | Dual channel | For each contact, WhatsApp template and voice call start together (voice only if `voice_enabled`, urgency is `now`/`six_hours`, and provider configured). |
| CON-2 | Same questions both channels | Identity (call only), willingness, 4 eligibility questions, ETA, share-number consent. |
| CON-3 | Deterministic eligibility | Per rules in `03-AI-SPEC.md` §3; unit-tested for every question/answer combination. |
| CON-4 | Latest answer wins | Call vs WhatsApp conflict resolved by `finalize_contact`. |
| CON-5 | Languages | Donor's primary language used; fallback English. |
| CON-6 | No-answer handling | Call: 1 retry after 2 min for `now` requests only. WhatsApp message stays valid until the wave ends + 10 min. |
| CON-7 | After accept | Donor gets details + Donation Code (WhatsApp free-form if window open, else template `blood_donor_details`). Requester gets WhatsApp template `blood_donor_accepted` on first accept and when enough donors. |
| CON-8 | Closure notice | When a request ends (completed/cancelled/stopped/expired), every **accepted** donor (confirmed or standby) gets `blood_request_closed` (free-form if the WhatsApp window is open, else template). A donor who accepts while the request is `enough_donors` hears/reads the **standby** message. |
| CON-9 | Wrong number | If the person says "not me" on the call, mark donor phone for admin review (`abuse_reports` type donor, reason `wrong_number`), no more calls to that number until reviewed. |
| CON-10 | Logs | Every outbound/inbound event is saved to `message_events` (no OTPs, no full phone numbers, no health answers in logs). |

### 7.7 Donation proof (DNP)

| ID | Requirement | AC |
|---|---|---|
| DNP-1 | Code | 6 digits, created when the donor accepts, shown **only to the donor** (call, WhatsApp, `/d/[contactId]`) and kept in `donations.code`. The donor tells the code to the family/blood bank at the hospital; the requester types it to confirm. The code is **never** shown on the requester's screen. |
| DNP-2 | Confirm | Requester or admin enters the code → RPC `confirm_donation` → donor `last_donation_date`, `donations_count`, `trust_level ≥ 2`, `next_eligible_date`. Wrong code: friendly error; 5 wrong tries/hour → temporary lock. |
| DNP-3 | Thank-you | WhatsApp template `blood_donation_thanks` with next eligible date. |

### 7.8 Admin (ADM)

| ID | Requirement | AC |
|---|---|---|
| ADM-1 | Live requests | Table + map: status, ring, contacts, accepted, age; filters; **Freeze**, **Close**, **Set compatible**, **Widen manually**. |
| ADM-2 | Needs human | List: exhausted requests, `needs_human` contacts, wrong-number reports, abuse reports. |
| ADM-3 | Donors | Search by name/last 4 digits; view limited profile (no health answers); suspend/unsuspend; confirm group (`bank_confirmed`); view contact history. Every view/action is audit-logged. |
| ADM-4 | Banks | CSV import, edit, stock editor, trust score view. |
| ADM-5 | Settings | Kill switch, voice/WhatsApp flags, wave minutes, max contacts, rings (read-only list), message templates status. |
| ADM-6 | Audit log | Read-only list with filters. |
| ADM-7 | Safety | Admin pages show a red banner when the kill switch is on. |

---

## 8. Donor data (exact fields)

### 8.1 What we collect and why

| Field | Required | Why | Validation | Stored in | Visible to |
|---|---|---|---|---|---|
| Mobile number | Yes | Contact + login | `+91[6-9]\d{9}`, OTP verified, unique | `donor_private.phone_e164` (+ `auth.users`) | Requester only after accept + consent |
| WhatsApp number if different | No | Reach donor | same format | `donor_private.whatsapp_e164` | Never |
| Email | Yes | Recovery + trust | RFC format, verified by link, unique | `donor_private.email` | Never |
| Full name | Yes | Trust | 2–80 chars | `donors.full_name` | First name only, after accept |
| Date of birth | Yes | Age rule | 18–65 | `donors.dob` | Never |
| Gender | Yes | Waiting period | male/female/other | `donors.gender` | Never |
| Weight (kg) | Yes | Min 45 kg | 30–250 | `donors.weight_kg` | Never |
| Languages | Yes | Call language | subset of en/te/hi | `donors.languages` | Never |
| Blood group | Yes (or "not sure") | Matching | enum | `donors.blood_group` | Group shown on card |
| How do you know your group | Yes | Confidence | self / card / report | `donors.group_confidence` | Badge only |
| Last donation date or "never" | Yes | Cooling | not in future | `donors.last_donation_date` | Never |
| Platelets willingness | No | Matching | bool | `donors.also_platelets` | Never |
| Health quick-check | Yes | Eligibility | §8.3 | `donor_health` (encrypted) | Never |
| Home location | Yes | Matching | valid lat/lng in India bounds | `donor_location.home_geo` | **Distance band only** |
| Area, city, pincode | Yes | Context | 6-digit pincode | `donor_location` | Never |
| Max travel km | Yes | Respect donor | 3/5/10/25/50/100 | `donor_location.max_travel_km` | Never |
| Transport | No | ETA hint | walk/bike/car/bus | `donor_location.transport` | Never |
| Quiet hours + critical toggle | No | Respect sleep | times | `donor_prefs` | Never |
| Monthly cap | No | Fatigue | 1–20 | `donor_prefs` | Never |
| Emergency contact | No | Safety follow-up | name + phone | encrypted columns | Admin only |
| Consents | Yes | Law/trust | §DON-2 | `consents` | Admin |

**Never collect:** Aadhaar or any government ID number, bank/UPI/card details, medical reports, diagnoses or medicine lists, caste, religion, politics, background location tracking.

### 8.2 Consent checkboxes (exact meaning; text in copy doc)
1. `contact_calls_whatsapp` — may contact me by WhatsApp and automated calls for blood emergencies.
2. `share_phone_after_yes` — my number may be shared with the patient's family **only after I say yes** to a request.
3. `data_storage` — Blood may store the details I enter to match me with patients.
4. `call_recording` — calls may be recorded for safety and quality (**note:** MVP does **not** record; keep the consent for future; copy says "may").
5. `no_money_and_final_check` — I understand Blood never asks for money and the doctor does the final health check.
6. `age_18` — I am 18 or older.

### 8.3 Health quick-check (questions live in `src/lib/health-questions.ts`; marked "confirm with blood bank doctor")

| Key | Question (simple) | A "yes" means |
|---|---|---|
| `fever_today` | Do you have fever, cold, cough or feel unwell today? | Block (try again when well) |
| `recent_illness` | In the last 4 weeks: fever, infection, jaundice, malaria, typhoid or dengue? | Block (wait) |
| `on_antibiotics` | Are you taking antibiotics or any strong medicine now? | Block (wait) |
| `recent_vaccine` | Any vaccine in the last 4 weeks? | Block (wait) |
| `recent_surgery` | Any surgery or major dental work in the last 6 months? | Block (wait) |
| `tattoo_piercing` | Any tattoo, piercing or acupuncture in the last 6 months? | Block (wait) |
| `pregnant_or_nursing` | (Shown only if gender ≠ male) Pregnant, breastfeeding, or delivery/miscarriage in the last 6 months? | Block |
| `alcohol_24h` | Alcohol in the last 24 hours? | Block (this request only) |
| `chronic` | Heart disease, epilepsy, kidney disease, cancer, insulin-treated diabetes, bleeding disorder, or HIV/hepatitis B/C? | Block (permanent until a doctor clears) |
| `malaria_travel` | Travelled to a high-risk malaria area in the last 3 months? | Block (wait) |

Rules: `blocking_reason` = the **first** key answered "yes" (priority order above). All "no" → `health_ok = true`, `valid_until = now + 6 months`. Wording must be kind, never shaming. Store answers only encrypted.

---

## 9. Privacy matrix (who sees what) — tests must verify

| Data | Requester | Donor (before accept) | Donor (after accept) | Admin | Public |
|---|---|---|---|---|---|
| Donor first name | after accept | — | — | yes | no |
| Donor blood group | after accept | — | — | yes | no |
| Donor distance | **band** after accept | — | — | exact | no |
| Donor phone | after accept + consent, via RPC (logged) | — | — | yes (logged) | no |
| Donor email / DOB / address / health | **never** | — | — | email+DOB limited; health **never** | no |
| Patient first name, age, group, units, urgency | yes | yes | yes | yes | no |
| Hospital name + area | yes | yes | yes | yes | no |
| Exact hospital pin, ward, hospital phone | yes | **no** | yes | yes | no |
| Requester name + relation | yes | yes | yes | yes | no |
| Requester phone | yes | **no** | yes | yes | no |
| Doctor's slip photo | owner | no | no | yes | no |
| Blood banks + stock | yes | yes | yes | yes | **yes** (read-only) |

---

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Home page LCP < 2.5 s on 4G mid phone; wizard steps respond < 300 ms; first wave dispatched < 10 s after Send; bundle small (no heavy libs on home). |
| Reliability | If WhatsApp or voice provider fails, the other channel still works; failures are visible to admin; engine retries failed sends up to 2 times with backoff. |
| Availability | Keep-alive monitor hits `/api/health` every 5 min (free tier pause prevention). |
| Security | Per TRD §12. RLS tests mandatory. |
| Privacy | Per §9. Logs redact phone numbers (last 4 digits only), OTPs never logged. |
| Accessibility | WCAG 2.1 AA basics: labels, focus order, contrast, touch ≥ 48 px, screen-reader names on icon buttons. |
| i18n | `en`, `te`, `hi`; fonts that render Telugu/Devanagari (Noto Sans Telugu / Devanagari via `next/font`). |
| Browser support | Last 2 versions of Chrome/Edge/Firefox/Safari; Android Chrome priority. |
| Cost | Free tiers only for hosting/DB/auth/email; WhatsApp and voice are pay-per-use (SETUP guide has the table). |
| Observability | Structured JSON logs (no PII), `message_events`, admin "Health" widget (last tick time, queue depth). |

---

## 11. Risks and mitigations (product level)

| Risk | Mitigation in MVP |
|---|---|
| Meta classifies the donor alert template as *Marketing* (costlier / blocked) | Write it as a transactional alert; keep a fallback text-only path; admin sees template status; cap contacts per request |
| New WhatsApp number is limited to 250 unique people per day | Fine for pilot; design caps contacts per request at 30 |
| Voice calls to real donors cost money / need telephony compliance | Voice is behind `voice_enabled`; pilot can start WhatsApp-only; Twilio trial works only with verified numbers (test donors) |
| Supabase free project pauses after 7 days idle | Uptime monitor ping + weekly manual backup script |
| Vercel Hobby is non-commercial | Pilot is non-commercial; migrate (Cloudflare/Netlify/Pro) if revenue starts |
| Fake requests | OTP, rate limits, duplicate block, admin freeze, abuse reports, slip badge |
| Donor hides illness | Questions + doctor's final check + disclaimers |
| Wrong blood bank stock | Freshness labels + "call before you go" + trust score |
