# 00 — READ THIS FIRST (for the coding agent)

**Project:** Blood (working name) — emergency blood-donor finder for India (pilot city: Rajahmundry, Andhra Pradesh).
**Human owner:** Siva. He is a developer but he does **not** want to write code for this. He does the *account/setup* work listed in `SETUP-GUIDE-FOR-SIVA.md`. **You write all the code, tests, scripts and docs.**
**Date of these docs:** 31 Oct 2026.

---

## 1. What you are building (30-second version)

A person who needs blood opens the web app, picks blood group and location, instantly sees nearby blood banks with stock, and can press **Search donors**. The system then contacts **registered, verified donors** near the hospital — **a WhatsApp message and an automated phone call at the same time** — in widening distance rings (0.5 km → 100 km). The donor answers a few eligibility questions. Donors who say YES and pass appear **live** on the requester's screen, who can then call them. After donation, a **Donation Code** proves it happened.

It must **really work end to end** with real WhatsApp and real phone calls — **no mock data in production code paths.** Mocks are allowed only inside automated tests.

## 2. The documents (read in this order)

| # | File | What it is |
|---|---|---|
| 1 | `00-README-FOR-AGENT.md` | This file: rules, stack, layout, env vars, milestones |
| 2 | `01-PRD.md` | What to build: users, features, screens, acceptance criteria |
| 3 | `02-TRD.md` | How to build it: architecture, APIs, engine, security, deployment |
| 4 | `03-AI-SPEC.md` | The voice/WhatsApp "assistant": scripts, rules, state machines |
| 5 | `04-TEST-PLAN.md` | Tests you must write and pass; manual test scripts |
| 6 | `05-COPY-AND-TEMPLATES.md` | Every user-facing text (en / te / hi) and WhatsApp templates |
| 7 | `supabase/` | **Ready, tested SQL** (migrations, seed, DB tests). Use it as-is. |
| 8 | `.env.example` | Every environment variable |
| 9 | `SETUP-GUIDE-FOR-SIVA.md` | What the human does (so you know what he will provide, and when) |

If two documents disagree: **TRD > PRD > this README** for technical matters, **PRD** for product behavior. If something is truly ambiguous, choose the simplest safe option, write the decision in `docs/DECISIONS.md`, and continue.

## 3. Golden rules (never break these)

1. **Safety first.** This app contacts real people about medical emergencies. Never send a message or call to any phone number that is not (a) a registered donor who gave consent, or (b) in the allowlist when `APP_ENV` is not `production`. See TRD §12 (Outbound allowlist).
2. **No secrets in git.** `.env.local` is git-ignored. Never print secrets in logs. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser (no `NEXT_PUBLIC_` prefix).
3. **Row Level Security is the lock.** Every table already has RLS in `supabase/migrations/0001_init.sql`. Do **not** disable RLS or add broad policies. Browser code uses the user's session only. The service-role client is allowed **only** in `src/server/**` (engine, webhooks, privileged actions) and must be imported from one file: `src/server/supabase-admin.ts`.
4. **Privacy rules (hard):** requesters never see a donor's phone, email, address, exact location, DOB or health answers — except the phone via the `reveal_donor_phone` RPC after the donor accepted and consented. Donors never see the requester's phone or the exact hospital pin until they accept. See PRD §9.
5. **The AI/assistant never decides eligibility by itself.** It collects answers; the **rules engine** in code decides. See `03-AI-SPEC.md`.
6. **Idempotent everything.** Webhooks can arrive twice, late, or out of order. Use `webhook_events`, unique constraints and the "latest answer wins" rule in `finalize_contact`.
7. **Free-tier friendly.** No paid SDKs or services beyond those listed in TRD §2. Keep serverless functions short (Vercel Hobby default limit is 10 s; set `maxDuration` ≤ 30 where noted).
8. **Three languages:** English (`en`), Telugu (`te`), Hindi (`hi`). No hard-coded user-facing strings in components. Use `next-intl`; strings come from `05-COPY-AND-TEMPLATES.md`.
9. **Accessible and fast on weak phones:** mobile-first, big touch targets (≥ 48 px), works on 3G-class networks, keyboard accessible, color contrast AA, no text smaller than 16 px for body.
10. **Tests are part of the work.** A milestone is not done until its tests in `04-TEST-PLAN.md` pass. Do not delete or weaken a test to make it pass.
11. **Do not scrape e-RaktKosh or any government site.** Blood-bank data comes from an admin CSV import and manual stock entry.
12. **Do not invent medical rules.** Health questions and waiting periods are exactly those in `03-AI-SPEC.md` §3. They are marked "to be reviewed by a blood bank doctor" — keep them in one config file so they can change without code changes.

## 4. Tech stack (decided — do not substitute)

Versions were checked on 31 Oct 2026. Use the latest stable versions that work together; confirm with `npm view <pkg> version`; commit the lockfile.

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript (strict) | Use the TS version `create-next-app` installs |
| Web framework | **Next.js 16** (App Router), React 19 | Route Handlers for all APIs |
| Styling | Tailwind CSS 4 + shadcn/ui | Mobile-first |
| i18n | `next-intl` | locales: `en`, `te`, `hi`; default `en` |
| Validation | `zod` | Validate every input on the server |
| Database/Auth/Realtime/Storage | **Supabase** (Postgres 15+, PostGIS) | `@supabase/supabase-js`, `@supabase/ssr` |
| Phone login | Supabase Auth **phone OTP** + **Send SMS Hook** → delivers the OTP over **WhatsApp** | TRD §5 |
| Email verification | Supabase Auth email confirm via **custom SMTP (Brevo free)** | TRD §5 |
| WhatsApp | **Meta WhatsApp Cloud API** (direct, no BSP) | TRD §7 |
| Voice calls | **Twilio Programmable Voice** behind a `VoiceProvider` interface | TRD §8; scripted IVR (keypad), not LLM |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles; Nominatim search on submit only | TRD §11 |
| Hosting | **Vercel Hobby** (free) | Hobby is for non-commercial use; see SETUP guide |
| Scheduler | Supabase `pg_cron` + `pg_net` → `/api/internal/tick` | Migration `0002_cron.sql` |
| Webhook signature (Supabase hook) | `standardwebhooks` | |
| Tests | Vitest, Playwright, MSW (mock providers in tests only) | |
| Lint/format | ESLint, Prettier | |

## 5. Repository layout (create exactly this)

```
/
├─ .env.example                  (given)
├─ .gitignore                    (must include .env*, !.env.example)
├─ README.md                     (short: how to run, test, deploy)
├─ docs/
│  ├─ PRD.md TRD.md AI-SPEC.md TEST-PLAN.md COPY-AND-TEMPLATES.md   (copy the 01..05 docs here)
│  ├─ DECISIONS.md               (you write: every judgment call)
│  ├─ PROGRESS.md                (you update after each milestone)
│  └─ SIVA-TODO.md               (you write: things only Siva can do next; see §8)
├─ supabase/                     (copy from the kit: migrations/0001..0003, seed.sql, tests/, run_db_tests.sh)
├─ scripts/
│  ├─ create-wa-templates.ts     (registers WhatsApp templates via API)
│  ├─ import-banks.ts            (CSV → blood_banks)
│  ├─ make-admin.ts              (promote a phone number to admin)
│  ├─ seed-dev-donors.ts         (creates dev donors from DEV_TEST_DONORS env)
│  ├─ backup.sh                  (pg_dump instructions + script)
│  └─ gen-secrets.ts             (prints random secrets for CRON_SECRET etc.)
├─ src/
│  ├─ app/
│  │  ├─ [locale]/               (pages: see PRD §6)
│  │  └─ api/                    (route handlers: see TRD §6)
│  ├─ components/                (ui/, forms/, request/, donor/, admin/, map/)
│  ├─ lib/                       (pure code usable in browser + server: zod schemas, constants, formatters)
│  ├─ server/                    (SERVER ONLY: engine, providers, security, db)
│  │  ├─ supabase-admin.ts       (the ONLY place service role key is used)
│  │  ├─ engine/                 (rings.ts, wave.ts, tick.ts, dispatch.ts, policy.ts)
│  │  ├─ assistant/              (script.ts, eligibility.ts, wa-flow.ts, ivr-flow.ts, i18n prompts)
│  │  ├─ providers/              (whatsapp.ts, voice/types.ts, voice/twilio.ts, voice/index.ts)
│  │  └─ security/               (crypto.ts, ratelimit.ts, allowlist.ts, signatures.ts, redact.ts)
│  ├─ messages/                  (en.json, te.json, hi.json)
│  └─ middleware.ts              (locale + auth refresh + admin guard)
├─ tests/
│  ├─ unit/  integration/  e2e/  fixtures/
└─ .github/workflows/ci.yml
```

## 6. Environment variables

All are in `.env.example`. **Never commit real values.** Summary:

| Variable | Used by | Who provides |
|---|---|---|
| `APP_ENV` (`local`/`staging`/`production`) | whole app | you / Siva |
| `PUBLIC_APP_URL` | webhooks, links | Siva (Vercel URL) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Siva (Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Siva |
| `SEND_SMS_HOOK_SECRET` | Supabase auth hook verification | Supabase gives it |
| `CRON_SECRET` | `/api/internal/tick` | generated by `scripts/gen-secrets.ts` |
| `DATA_ENCRYPTION_KEY` | AES-256-GCM for health answers (32 bytes, base64) | generated |
| `OUTBOUND_ALLOWLIST` | comma list of E.164 numbers (**required** unless `APP_ENV=production`) | Siva |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_GRAPH_VERSION` | WhatsApp | Siva (Meta) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | voice | Siva (Twilio) |
| `VOICE_PROVIDER` (`twilio` default) | voice | you |
| `DEV_TEST_DONORS` | dev seeding (JSON) | Siva |
| `SENTRY_DSN` (optional) | errors | optional |

## 7. Milestones (do them in order; commit after each; update `docs/PROGRESS.md`)

| M | Name | Needs from Siva | Done when |
|---|---|---|---|
| **M0** | Project skeleton | nothing | Next.js app runs; lint, typecheck, unit-test commands work; CI green; `supabase/` copied; `npm run db:test` runs the DB tests on a PostGIS Postgres and passes |
| **M1** | Supabase wiring + auth | Supabase project keys | `0001..0003` migrations applied to Siva's project (or documented as a command for Siva); phone login works with **Supabase test phone numbers** (fixed OTP); sessions refresh via middleware; admin promotion script works |
| **M2** | Donor registration | M1 | All PRD §7 donor screens work; data saved per TRD; health answers encrypted; email verification via SMTP; eligibility computed; donor dashboard (profile, pause, delete account) |
| **M3** | Blood banks + request creation + live page | M1 | Home → Need Blood wizard → banks list with stock labels → request created via `create_request` RPC → live page with Realtime |
| **M4** | WhatsApp: OTP + alerts + webhook | Meta app, token, test number | WhatsApp OTP login works; `create-wa-templates` script registers templates; request alert sent; button replies handled; signature verified; statuses tracked |
| **M5** | Engine (rings, waves, ticks, gates) | — | Matching + rings + wave timers + gates + enough-donors stop, proven by integration tests with mocked providers and by DB tests |
| **M6** | Voice (Twilio IVR) | Twilio SID/token/number | Real call rings a verified phone, runs the full script in en/te/hi, result recorded; status callbacks tracked; allowlist enforced |
| **M7** | Accept flow + donation proof | — | Accepted donors appear live; reveal-phone RPC; donor view page; donation code confirm; stats updated |
| **M8** | Admin | M1 admin user | Live requests, needs-human queue, donor queue, bank CSV import + manual stock, kill switch, audit log |
| **M9** | Hardening | — | Security tests, rate limits, headers, logging redaction, accessibility pass, Lighthouse ≥ 90 mobile on key pages, backups script |
| **M10** | Deploy + UAT | Vercel + all keys | Deployed to Vercel; cron running; UAT script in `04-TEST-PLAN.md` §8 passes with Siva's phones; `docs/PROGRESS.md` says "MVP READY" |

Order of work inside each milestone: **tests first** (or alongside), then code, then docs.

## 8. Working agreement

- **Branching:** `main` is always deployable. Work in small commits on `feat/<milestone>`; merge when the milestone's tests pass.
- **When you need something only Siva can do** (an account, a key, a phone verification, a Meta template approval): do **not** stop. Add a short, numbered, plain-English item to `docs/SIVA-TODO.md` ("What", "Where to click", "What to send back"), then continue with other work. Remove items when done.
- **Never ask Siva to paste secrets in chat.** Tell him to put them in `.env.local` (and in Vercel / GitHub secrets), then you read from env.
- **When docs are wrong or impossible:** don't silently deviate. Record it in `docs/DECISIONS.md` (what, why, impact), pick the simplest safe alternative, and continue.
- **Official docs beat memory** for Meta, Twilio and Supabase API details (they change). Read the current official docs for: Supabase Send SMS Hook, Supabase SSR for Next.js, Supabase test phone numbers, WhatsApp Cloud API (messages, webhooks, templates, authentication templates), Twilio `<Say>`, `<Gather>`, `<Play>`, request validation, and call status callbacks.
- **Definition of Done for every task:** code + tests + types + lint pass + no console errors + strings translated (en/te/hi) + docs updated.

## 9. MVP "done" checklist (all must be true)

- [ ] A new donor can register (phone OTP over WhatsApp, email verification, consent, health check, location) and becomes `active`.
- [ ] A requester can create a request and sees banks with "verified X min ago" labels.
- [ ] Pressing **Search donors** causes real WhatsApp messages **and** real phone calls to eligible allowlisted donors (staging) within 10 seconds.
- [ ] A donor can accept via **call** or via **WhatsApp buttons**; eligibility questions are asked on both; non-eligible donors are politely declined.
- [ ] Accepted donors appear live on the requester's screen; reveal-phone works only after acceptance + consent.
- [ ] Rings widen on timers; gates at 70 / 90 / 100 km ask the requester; "enough donors" stops new contacts (extra acceptors become standby) and closure notices go to accepted donors.
- [ ] Donation Code confirms a donation; donor stats and next-eligible date update.
- [ ] Admin can see live requests, import banks, edit stock, flip the kill switch.
- [ ] All tests in `04-TEST-PLAN.md` pass in CI; manual UAT passes.
- [ ] No secret in git history; RLS verified by tests.

## 10. First message to use (Siva will paste this into you)

> Read `00-README-FOR-AGENT.md`, then `01-PRD.md`, `02-TRD.md`, `03-AI-SPEC.md`, `04-TEST-PLAN.md`, `05-COPY-AND-TEMPLATES.md`. Create the repo exactly as described, copy the `supabase/` folder, and start with milestone M0. After each milestone run all tests, commit, and update `docs/PROGRESS.md`. Whenever you need something from me, add it to `docs/SIVA-TODO.md` in plain steps and keep working on whatever is not blocked. Do not ask me to paste secrets in chat. Start now.
