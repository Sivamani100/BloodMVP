# 04 — Test Plan (Blood MVP)

A milestone is **done only when its tests pass in CI**. Never delete or weaken a test to make it pass. Each test name should start with the requirement id it proves (e.g. `BR-6 skips empty rings`).

---

## 1. Test levels

| Level | Tool | Runs where | What it proves |
|---|---|---|---|
| **DB** | `supabase/run_db_tests.sh` (plain SQL, PostGIS Postgres) | CI + local | Schema, RLS, matching SQL, finalize/standby logic, privacy, deletion. **Already written and passing (19 groups).** Add tests when you add SQL. |
| **Unit** | Vitest | CI + local | Pure logic: rings, eligibility, crypto, parsers, prompts, formatters |
| **Integration** | Vitest + local Supabase (or PostGIS service) + MSW | CI | Route handlers, webhooks, engine with fake time and mocked providers |
| **E2E** | Playwright (mobile viewport) | CI | Real browser flows against a running app with Supabase test OTP numbers and mocked providers |
| **Security** | Vitest + scripts | CI | Signatures, allowlist, RLS leaks, headers, rate limits |
| **Load (light)** | k6 or a Node script | Manual before pilot | 200 donors, 10 concurrent requests |
| **UAT (real)** | Siva + friends' phones | Staging | Real WhatsApp + real calls end to end |

Mocks (MSW) are allowed **only** in Unit/Integration/E2E. UAT uses the real providers.

---

## 2. Unit tests (must exist)

### 2.1 Engine (`tests/unit/engine/*.test.ts`)
| Test | Cases |
|---|---|
| `BR-6 rings` | order is `0.5…100`; `nextRing(current)` correct at the ends; gates are exactly 70/90/100 |
| `BR-6 skips empty rings` | with fake candidate source returning `[]` for rings < 5, first wave uses ring 5 in **one** call to `processRequest` |
| `BR-5 contact multiplier` | need 2 → asks for 6; need 1 and 29 already contacted → asks for 1 (cap 30) |
| `BR-8 wave minutes` | per urgency, from settings override |
| `BR-7 gate` | when next ring > `approved_up_to_km` → status `waiting_requester`, `pending_gate_km` set, nothing contacted |
| `BR-7 exhausted` | no candidates up to 100 → `exhausted_at` set, audit log written, no crash |
| `BR-9 enough donors` | engine does nothing when `accepted_count >= units` |
| `ENG-9 expiry` | `needed_by + 6h` passed → `expired` |
| `dispatch policy` | voice only when flag on + urgency `now/six_hours` + provider configured; WhatsApp only when flag on; both skipped → `needs_human` |
| `allowlist` | production: allowed; staging with list: only listed; staging empty list: nothing sent; invalid/blacklisted numbers never |

### 2.2 Assistant (`tests/unit/assistant/*.test.ts`)
| Test | Cases |
|---|---|
| `CON-3 eligibility truth table` | all rows of AI-SPEC §3; all 16 combinations of the 4 blocking answers; `identity_confirmed=false`; `willing=false`; missing answers → `undecided`; ETA values; share true/false |
| `gap wording` | male → 3 months, female/other → 4 |
| `keywords` | yes/no/stop lists in en/te/hi, punctuation and case variants |
| `prompts complete` | every prompt key exists in `en`, `te`, `hi`; placeholders match across languages |
| `spoken helpers` | `spellDigits`, `spokenGroup` (all 8 × 3 langs), `spokenUnits` |
| `ivr state machine` | drive keys step by step: accept path, each early-exit path, wrong number, invalid key then valid, two invalid → no-input end, repeated webhook is idempotent, guard on closed request, standby message |
| `wa flow` | button ids parse/build round-trip (including max length), wrong-step tap ignored, already-decided reply, free-text mapping, STOP |

### 2.3 Security / utils
| Test | Cases |
|---|---|
| `crypto` | round-trip, tamper, wrong key, unique IV, format `v1.…` |
| `signatures` | WhatsApp HMAC valid/invalid/timing-safe; Twilio validation with a known vector; Standard Webhooks (Supabase) valid/invalid/replayed-old-timestamp |
| `redact` | phones, tokens, bearer headers, answers |
| `phone` | accepts `+919876543210`; rejects `+91 5…`, `+1…`, short/long, letters |
| `note filter` | blocks phone-like strings and money words in en/te/hi transliteration |
| `schemas` | each zod schema accepts good input and rejects extras (`.strict()`) |
| `i18n keys` | `en.json`, `te.json`, `hi.json` have identical key sets |
| `donor rules` | age bounds, weight, activation checklist function with every missing-item combination |

---

## 3. Integration tests (`tests/integration/*.test.ts`)

Use a real Postgres (local Supabase or the PostGIS service with the migrations) and **MSW** for Meta/Twilio HTTP. Fake time through the injected `now()`.

| ID | Scenario | Assertions |
|---|---|---|
| INT-1 | **Full happy path (WhatsApp only)** | seed 6 donors; create request; `start` → alert sent to the nearest ≤ 3×units; simulate button replies through the webhook (signed) → questions → accept → card appears (`request_donor_cards`) → request `enough_donors`; `message_events` written; no PII in logs |
| INT-2 | **Full happy path (voice)** | `start` → call placed to allowlisted donor; drive `answer` + `step` webhooks (signed) with keys 1,1,2,2,2,2,1,1 → `accepted` with code; WhatsApp details sent |
| INT-3 | **Both channels race** | call says yes while WhatsApp says no → latest wins; request re-opens correctly |
| INT-4 | **Ring expansion** | no answers → at wave expiry the next ring is used; donors not re-contacted; contacts count ≤ 30 |
| INT-5 | **Gate** | rings reach 70 → status `waiting_requester`; `request_decision(true)` continues with ring 70; `false` stops and cancels queued |
| INT-6 | **Exhaustion** | no donors anywhere → `exhausted_at`; admin audit; requester sees guidance |
| INT-7 | **Eligibility reject** | `alcohol_24h=true` on both channels → `not_eligible`, no code, kind message |
| INT-8 | **Opt-out** | WhatsApp "STOP" → `opted_out`, queued contacts cancelled, never matched again |
| INT-9 | **Wrong number** | call `identity=2` → admin report created; donor not called again until reviewed |
| INT-10 | **Standby** | units=1, three donors accept in order → 1 confirmed, others `is_standby`; first cancels → standby promoted; cap at 2× units |
| INT-11 | **Closure notices** | requester cancels → accepted donors receive `blood_request_closed`; unanswered contacts receive nothing |
| INT-12 | **Idempotency** | each webhook delivered twice and out of order → single effect |
| INT-13 | **Allowlist in staging** | donors not in list → no provider call, contact marked `skipped` / `needs_human` appropriately |
| INT-14 | **Kill switch** | enabled mid-request → tick sends nothing; new `create_request` fails with `service_paused`; webhooks still record answers |
| INT-15 | **Provider failure** | WhatsApp 500 → retried twice then `failed`; voice failure with WhatsApp success keeps contact `contacting` |
| INT-16 | **Send SMS hook** | valid signature → WhatsApp OTP template call with right payload (OTP in body and button param); invalid signature → 401; allowlist skip → 200 without send; OTP never logged |
| INT-17 | **Donor registration API** | each step validates, saves, recomputes state; underage rejected; health answers stored encrypted (ciphertext differs from plaintext, decrypts back); blocking answer → `pending` with reason |
| INT-18 | **Email confirm** | `/auth/confirm` with valid token → `email_verified=true` and state recompute; invalid → friendly error |
| INT-19 | **Tick concurrency** | two parallel ticks claim disjoint requests; same request never processed twice |
| INT-20 | **Bank import** | CSV with good + bad rows → good upserted, bad listed with reasons; stock editor writes `source='admin_call'` |
| INT-21 | **Phone reveal** | before accept → denied; accepted but `share_phone_consent=false` → denied; accepted + consent → returns phone and writes audit log; 31st lookup in an hour → rate limited |
| INT-22 | **Donation confirm** | wrong code → false and counted; right code → stats updated, thank-you template sent; 5 wrong tries → lock |

---

## 4. E2E tests (`tests/e2e/*.spec.ts`, Playwright, Pixel-5 viewport, 3 locales for smoke)

Setup: local Supabase with **test phone numbers** (fixed OTP, e.g. `919999900001 → 123456`), MSW-style mock servers for Meta/Twilio started by the test harness (**only** in e2e), seed 8 donors around a test hospital.

| ID | Flow |
|---|---|
| E2E-1 | Home → language switch (en/te/hi) → Need Blood → select O+ / 2 units / now → location by dragging pin → banks list shows 3 test banks with freshness labels → Search donors → login with test phone → fill details → Send → live page shows progress |
| E2E-2 | Donor registration full wizard (all steps) → email confirm via captured mail (Inbucket in local Supabase) → dashboard shows `active` |
| E2E-3 | While requester watches the live page, simulate a donor accept through the signed webhook → donor card appears **without reload** (Realtime) → tap Call → `tel:` link has the donor phone (only after consent) |
| E2E-4 | Gate popup appears at ring 70 (fake time/tick) → Yes → continues; second request → No → stops |
| E2E-5 | Donor dashboard: pause, resume, edit profile, delete account (then login shows fresh state) |
| E2E-6 | Admin: login → MFA bypass in test env → live list shows request → freeze → kill switch banner → import banks CSV |
| E2E-7 | Privacy: as requester, inspect network responses → no donor phone/email/address anywhere before reveal; as donor, no requester phone before accept |
| E2E-8 | Accessibility: axe checks on home, wizard steps, live page, donor wizard (no serious/critical violations) |
| E2E-9 | Offline/slow: throttle to Slow 3G → home usable, wizard step 1 interactive within 5 s |

---

## 5. Security tests (`tests/security/*.test.ts`)

| ID | Test |
|---|---|
| SEC-1 | **RLS matrix:** for each table, as `anon`, `authenticated` (own), `authenticated` (other), admin: select/insert/update/delete outcomes match PRD §9 and the DB test expectations. Includes: `donor_private` other-user = 0 rows; `donor_health` = permission denied; `request_contacts` = 0 rows for non-admins |
| SEC-2 | `service_role` key never present in client bundles (`next build` output scan for the key value and for `SERVICE_ROLE`) |
| SEC-3 | Webhook endpoints reject missing/invalid signatures (WhatsApp, Twilio, Supabase hook, cron bearer) |
| SEC-4 | Security headers present on pages and API responses; CSP report-only first then enforced in CI for key pages |
| SEC-5 | CSRF: state-changing endpoints reject cross-origin `Origin` and wrong `Content-Type` |
| SEC-6 | Rate limits: OTP hook, requests, reveal, geocode, donation confirm, registration steps |
| SEC-7 | Input fuzz: oversized bodies, unknown keys, SQL-ish and HTML strings in every text field → rejected or safely stored/escaped |
| SEC-8 | Upload checks: wrong magic bytes, > 2 MB, path traversal in file name → rejected |
| SEC-9 | Logs: scan test-run logs for phone numbers (full), OTP patterns, bearer tokens, health keys → none found |
| SEC-10 | `npm audit --audit-level=high` clean; `gitleaks` clean |
| SEC-11 | Allowlist: attempt to contact a non-listed number in staging via every code path (alert, call, OTP hook, closure, standby, details) → provider never called |
| SEC-12 | Enumeration: login/OTP responses do not reveal whether a number is registered as donor |
| SEC-13 | Replay: Supabase hook with an old timestamp rejected |

---

## 6. Light load test (before pilot)

- Seed 200 donors in a 30 km radius, 10 concurrent requests, providers mocked with 300 ms latency.
- Expect: every request's first wave dispatched < 10 s; `tick` < 25 s; DB CPU fine; no duplicate contacts; no unique-violation errors in logs.
- Record results in `docs/PROGRESS.md`.

---

## 7. Test data

- `tests/fixtures/` has JSON for webhook payloads (WhatsApp messages/statuses, Twilio form bodies) with **real shapes** copied from Meta/Twilio docs.
- `supabase/tests/10_schema_tests.sql` shows how to build donors/requests quickly; reuse the same coordinates (hospital at 17.0000 N, 81.8000 E; 0.0045° latitude ≈ 0.5 km).
- Test phone numbers: Supabase test numbers (e.g. `+919999900001…05`) for login only. They are **not** real people and must never be messaged: the allowlist blocks them in all non-production environments anyway.

---

## 8. UAT script (real WhatsApp + real calls; Siva + 3 friends)

Preconditions: staging deployed; Siva + 3 friends registered as donors with their consent; their numbers are in `OUTBOUND_ALLOWLIST`, in Meta's test-recipient list, and verified in Twilio (trial). One friend is in a different area (> 3 km) if possible.

| # | Step | Expected |
|---|---|---|
| 1 | Each person logs in: OTP arrives on WhatsApp within 10 s | ✅ |
| 2 | Each registers as a donor (use real blood groups; one friend uses "not sure") | Three `active`, one `pending` with checklist |
| 3 | Siva creates a request (O+ or whichever matches, 1 unit, `now`, hospital = a real hospital pin) | Banks list shows test banks |
| 4 | Press Send | Within 10 s the nearest friend gets a **WhatsApp alert** and a **phone call** |
| 5 | Friend A answers the call: 1 (yes), then answers all questions "no", ETA 1, share 1 | Siva's live page shows Friend A's card; Friend A gets details + code on WhatsApp |
| 6 | Friend B ignores the call but taps **Yes** on WhatsApp and answers by buttons | Becomes **standby** if units=1 |
| 7 | Friend C answers the call, says **yes**, then answers "yes" to alcohol | Politely declined; no card |
| 8 | Siva taps **Call** on Friend A's card | Dialer opens with Friend A's number |
| 9 | Friend A tells the code; Siva confirms | Donation confirmed; Friend A gets thank-you; stats updated |
| 10 | Repeat in **Telugu** and **Hindi** for one donor each | Calls pronounce group names and code clearly; strings look right |
| 11 | Reply STOP from a friend's WhatsApp | Opt-out confirmed; not matched in next request |
| 12 | Create a request far from every donor | Gate popups at 70/90/100 appear when searching reaches them (use admin "set ring" test tool or fake clock in staging) |
| 13 | Admin: turn kill switch on, create a request | Blocked with a clear message; turn off |
| 14 | Pull the network on one friend's phone during the call | Call ends; WhatsApp still works; no stuck state |
| 15 | Wait until the Supabase project/Vercel idle for 10 min, then send a request | Works (keep-alive OK) |

**Sign-off:** Siva signs `docs/PROGRESS.md` with date and "UAT passed" only when 1–15 pass.

---

## 9. Exit criteria for "MVP READY"

- All CI jobs green on `main`.
- UAT §8 passed.
- Language review (Telugu, Hindi) signed off; health questions reviewed by a blood bank doctor (or explicitly accepted by Siva as "pilot risk" in `docs/DECISIONS.md`).
- Kill switch tested on staging.
- Backup script run once successfully.
- Meta templates approved (or WhatsApp-only fallbacks documented).
- Lighthouse mobile ≥ 90 (performance, accessibility, best-practices) on `/`, `/need-blood`, `/become-donor`.

## 10. Bug severity
| Sev | Meaning | Rule |
|---|---|---|
| S1 | Privacy leak, contacting a non-consenting or non-allowlisted number, wrong eligibility decision, data loss | Stop and fix immediately; add a regression test |
| S2 | A core flow broken (login, send, accept, reveal) | Fix before the milestone closes |
| S3 | UX defects, copy errors | Fix before MVP READY |
| S4 | Polish | Backlog |
