# Architecture Decisions Record (ADR) — Blood MVP

This document records the architectural and design decisions made for the **Blood** emergency blood-donor finder MVP (Pilot City: Rajahmundry, Andhra Pradesh).

---

## ADR 001: Pilot City & Geographic Engine (PostGIS)
- **Status:** Accepted
- **Context:** Blood matching requires precise spatial queries to find nearby verified donors in concentric expansion rings around hospitals in Rajahmundry (test coordinates ~ 17.0005° N, 81.8040° E).
- **Decision:** Use Supabase PostgreSQL with the `postgis` extension enabled. Donor coordinates (`home_geo`) and hospital locations (`hospital_geo`) are stored as `geography(Point, 4326)`. Spatial distance queries use `ST_Distance(home_geo, hospital_geo) / 1000.0` with spatial indexing (`GIST(home_geo)`).
- **Consequences:** Millisecond spatial filtering even across tens of thousands of donors without heavy client-side computation.

---

## ADR 002: Keypad DTMF Voice IVR vs. LLM Voice Agent
- **Status:** Accepted
- **Context:** When a life-threatening emergency occurs, donors receive automated calls. We evaluated AI voice conversational agents vs. fixed-grammar keypad DTMF.
- **Decision:** Implement deterministic keypad DTMF (1=Yes, 2=No, 3=Repeat, 4=Wrong person / Stop) powered by Twilio Voice TwiML and Amazon Polly / Google neural TTS voices (`te-IN-Standard-A`, `hi-IN-Neural2-A`, `en-IN-Neural2-A`).
- **Rationale:**
  1. **Reliability:** Cellular audio in India (especially tier-2 cities like Rajahmundry) often suffers packet loss and background street noise where speech-to-text models fail.
  2. **Latency & Determinism:** Medical eligibility questions must have zero ambiguity and zero hallucination risk.
  3. **Speed:** Keypad responses execute in under 150ms.
- **Consequences:** Completely robust, deterministic donor state transitions without AI voice hallucination.

---

## ADR 003: WhatsApp Interactive Messaging as Primary Channel
- **Status:** Accepted
- **Context:** In India, WhatsApp is ubiquitous across all smartphones, while SMS carries high spam rates and carrier DLT template friction.
- **Decision:** Use the official Meta WhatsApp Cloud API (Graph API v21.0) with interactive quick-reply buttons (`a|<contactId>|<step>|<value>`) as the primary donor outreach channel.
- **Consequences:** WhatsApp buttons provide one-tap responses without typing. Interactive messages are 10x cheaper than commercial transactional SMS.

---

## ADR 004: Health Answer Privacy & AES-256-GCM Encryption
- **Status:** Accepted
- **Context:** Donors disclose private medical information (recent illness, procedures, alcohol consumption). Under DPDP 2023, health data requires stringent protection.
- **Decision:**
  1. Encrypt raw health answers with AES-256-GCM using `DATA_ENCRYPTION_KEY_HEX`.
  2. Store only encrypted ciphertext `answers_enc` in `donor_health`.
  3. Store derived eligibility boolean `health_ok` and `blocking_reason` in plaintext to allow matching queries without decrypting PII.
  4. Never transmit health answers to requesters or hospital staff.

---

## ADR 005: Donor Privacy & Controlled Phone Reveal
- **Status:** Accepted
- **Context:** Requester families in distress must not be able to spam or harass random donors in the database.
- **Decision:**
  1. Requester live tracking screen (`/r/[requestId]`) only shows anonymized donor cards (`request_donor_cards` table): first name, blood group, distance band (e.g. `< 3 km`), donations count, trust badge, and ETA.
  2. A donor's phone number is **never** visible unless:
     - Donor explicitly replied YES to the request.
     - Donor cleared health screening.
     - Donor consented to share phone with the patient's family (`share_phone_consent = true`).
  3. Requester clicks "Reveal Phone", which calls the rate-limited RPC `reveal_donor_phone` (max 5 calls per hour).

---

## ADR 006: Leased Dispatch Tick (`claim_requests_for_tick`)
- **Status:** Accepted
- **Context:** The expansion engine must tick every 30 seconds to evaluate wave timeouts, expand rings, and dispatch contacts, without running into race conditions or requiring Redis.
- **Decision:**
  1. PostgreSQL function `claim_requests_for_tick` uses `SELECT ... FOR UPDATE SKIP LOCKED` and sets `next_tick_at = NOW() + INTERVAL '45 seconds'` to lease active requests.
  2. Supabase `pg_cron` + `pg_net` invokes the internal tick endpoint `/api/internal/tick` every 30 seconds with a shared bearer secret (`CRON_SECRET`).
  3. If pg_cron is paused or running locally, a Vercel Cron or local heartbeat script can invoke the same endpoint idempotently.

---

## ADR 007: Outbound Allowlist Safety Boundary
- **Status:** Accepted
- **Context:** Preventing accidental test messages from reaching real citizens during staging and local testing.
- **Decision:**
  - In non-production environments (`NODE_ENV !== 'production'`), outbound WhatsApp and Twilio Voice dispatches are filtered against `OUTBOUND_ALLOWLIST`.
  - Any number not present in the allowlist is automatically skipped with a mock success logged.
  - In production, allowlist checks are disabled and messages dispatch to all verified donors.
