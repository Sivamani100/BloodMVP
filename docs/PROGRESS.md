# Progress Report — Blood MVP (Pilot: Rajahmundry)

## Status Overview
All 9 core milestones (M0 through M8) are fully implemented, tested, and connected to the live Supabase staging database.

---

## Milestone Breakdown

### Milestone 0: Foundation & Tooling (Completed)
- [x] Next.js 15 App Router project structure with strict TypeScript.
- [x] Tailwind CSS + Lucide icons + Leaflet map styling.
- [x] Supabase project created (`yffjclzgracjbmqkjuon`) with `postgis`, `pg_cron`, `pg_net` extensions enabled.
- [x] All database schemas, tables (20 total), RLS policies, indexes, and triggers deployed.
- [x] Vitest unit testing framework configured.

### Milestone 1: Authentication & Localization (Completed)
- [x] Phone number OTP login via Supabase Auth.
- [x] End-to-end tri-lingual localization (`en`, `te`, `hi`) via `next-intl`.
- [x] Locale routing and language switcher in Navbar.
- [x] WhatsApp SMS hook bridge `/api/auth/hooks/send-sms` for OTP delivery.

### Milestone 2: Donor Registration & Health Security (Completed)
- [x] 8-step conversational registration wizard (`/become-donor`):
  1. Phone verification
  2. DPDP Act 2023 consents
  3. Basic profile (DoB, weight, gender, languages)
  4. Blood group & donation history
  5. Medical health screening questions
  6. Home location map pin & max travel radius
  7. Quiet hours & monthly alert preferences
  8. Optional email verification
- [x] Sensitive health answers encrypted using AES-256-GCM (`answers_enc`).
- [x] Automated eligibility evaluation and state transitions (`draft` -> `pending` -> `active`).

### Milestone 3: Emergency Request Creation (Completed)
- [x] Multi-step request wizard (`/need-blood`):
  - Step 1: Urgency selection (`now`, `six_hours`, `twenty_four_hours`, `planned`).
  - Step 2: Patient details, blood group, component, units needed.
  - Step 3: Hospital geocoding and interactive map pin picker (`LocationPicker`).
  - Step 4: Medical slip image upload to private Supabase Storage bucket (`slips`).
  - Step 5: Live review, antispam verification (money words blocked), and confirmation.

### Milestone 4: Concentric Expansion Engine & Tick (Completed)
- [x] Concentric spatial expansion rings (0.5km up to 100km).
- [x] Automatic ring jumping when inner rings have 0 matching candidate donors.
- [x] Requester approval gates at 50km, 70km, 90km, and 100km (`waiting_requester` state).
- [x] Database RPC `claim_requests_for_tick` for row-level leased dispatching.
- [x] Internal engine tick endpoint `/api/internal/tick` protected by bearer `CRON_SECRET`.
- [x] Wave expiration and standby promotion logic.

### Milestone 5: Communication Channels (WhatsApp + Voice IVR) (Completed)
- [x] Meta WhatsApp Cloud API integration:
  - Interactive quick-reply buttons (`a|<contactId>|<step>|<value>`).
  - Inbound webhook handler `/api/webhooks/whatsapp` with HMAC-SHA256 signature verification.
  - Conversational flow state machine (`src/server/assistant/wa-flow.ts`).
  - Multilingual STOP keyword opt-out handling.
- [x] Twilio Voice IVR integration:
  - Deterministic keypad DTMF gather flows (`/api/webhooks/twilio/voice/step`).
  - Neural Indian voices for English, Telugu (`te-IN-Standard-A`), and Hindi.
  - Call status tracking and fallback transitions.

### Milestone 6: Requester Live Tracking & Donor Privacy (Completed)
- [x] Live tracking screen `/r/[requestId]` with Supabase Realtime updates.
- [x] Anonymized donor cards (`request_donor_cards`) showing distance band and ETA.
- [x] Controlled, rate-limited phone number reveal (`reveal_donor_phone` RPC).
- [x] Unique 6-digit donation code verification (`confirm_donation` RPC).
- [x] Donor emergency portal `/d/[contactId]` with direct hospital navigation links.

### Milestone 7: Blood Bank Directory (Completed)
- [x] Seeded Rajahmundry staging blood banks (Government General Hospital, Rotary Blood Center, Red Cross).
- [x] Distance-based bank search API `/api/banks`.
- [x] Stock freshness indicators and trust scores.

### Milestone 8: Admin Operations & Developer Tools (Completed)
- [x] Admin dashboard `/admin` for monitoring requests, abuse reports, and donors.
- [x] Emergency Global Kill Switch toggle in `app_settings`.
- [x] CLI utility scripts:
  - `scripts/make-admin.ts`
  - `scripts/seed-dev-donors.ts`
  - `scripts/import-banks.ts`
  - `scripts/create-wa-templates.ts`
  - `scripts/gen-secrets.ts`

---

## Verification Status
- **TypeScript:** 100% strict typecheck passed (`tsc --noEmit` exited code 0).
- **Unit & Integration Tests:** 11 test suites, 47 tests passed (Vitest exited code 0).
- **Database Status:** Live on Supabase project `yffjclzgracjbmqkjuon` with PostGIS enabled.

