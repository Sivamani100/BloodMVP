# 03 — AI / Assistant Spec (voice call + WhatsApp conversation)

This is the "AI agent" of Blood. For the MVP it is a **scripted, rule-based assistant**: it speaks and writes in Telugu, Hindi and English, asks the same short questions on the phone and on WhatsApp, and records answers. **Code (a rules engine) decides eligibility — never a language model.** An optional LLM "AI mode" is specified in §9 but is **not part of the MVP build**.

Why scripted first: it is free of LLM/STT costs, works on noisy phone lines with keypad answers, behaves identically every time (important for health questions), is easy to test, and runs inside short serverless webhooks.

---

## 1. Principles

1. **Short and calm.** One question at a time, simple words, ≤ 3 minutes total.
2. **Same questions everywhere.** One shared script definition feeds both the phone flow and the WhatsApp flow.
3. **Rules decide.** Answers → `evaluate()` → decision. No free-form interpretation of health answers.
4. **Safe by default.** If unsure, do not accept; flag `needs_human`.
5. **Respect.** The donor can say no, stop, or ask who we are. Never pressure. Never shame.
6. **Honest.** Always say it is an automated assistant. Always say Blood never asks for money and the doctor does the final check.
7. **Privacy.** Do not read out the patient's full name or any private data. Say patient *first name only* (optional) and hospital name/area.

---

## 2. Shared script definition (`src/server/assistant/script.ts`)

```ts
export type StepKey =
  | 'identity' | 'willing'
  | 'donated_recently' | 'unwell_today' | 'recent_procedure' | 'alcohol_24h'
  | 'eta' | 'share_phone';

export const STEPS: StepKey[] = [
  'identity','willing','donated_recently','unwell_today','recent_procedure','alcohol_24h','eta','share_phone'
];
// 'identity' exists on the PHONE flow only (WhatsApp already knows who tapped).
```

Answer storage (`request_contacts.answers`, JSON):

```json
{
  "identity_confirmed": true,
  "willing": true,
  "donated_recently": false,
  "unwell_today": false,
  "recent_procedure": false,
  "alcohol_24h": false,
  "eta_minutes": 30,
  "share_phone": true,
  "_last_inbound_at": "2026-11-01T10:15:00Z",
  "_wa_step": "alcohol_24h",
  "_call_step": "eta",
  "_call_retry": false
}
```
Keys starting with `_` are internal state. **For all yes/no questions: `true` means "yes" and "yes" is the blocking answer** (donated recently, unwell, procedure, alcohol). `willing`, `identity_confirmed`, `share_phone` are the positive-direction exceptions.

---

## 3. Eligibility rules (`src/server/assistant/eligibility.ts`) — pure function

```ts
evaluate(answers, donor, now): { decision: 'accepted'|'declined'|'not_eligible'|'wrong_number'|'undecided', reason?: string, eta?: number, share?: boolean }
```

Order of evaluation (first match wins):

| # | Condition | Decision | Reason code |
|---|---|---|---|
| 1 | `identity_confirmed === false` | `wrong_number` | `wrong_number` |
| 2 | `willing === false` | `declined` | `not_willing` |
| 3 | `donated_recently === true` | `not_eligible` | `donated_recently` |
| 4 | `unwell_today === true` | `not_eligible` | `unwell_today` |
| 5 | `recent_procedure === true` | `not_eligible` | `recent_procedure` |
| 6 | `alcohol_24h === true` | `not_eligible` | `alcohol_24h` |
| 7 | any required answer still missing | `undecided` | — |
| 8 | all required answered and none blocking | `accepted` | — |

- **Donation gap wording:** question `donated_recently` asks "in the last **3** months" for `gender = male` and "in the last **4** months" otherwise (`donorRules.gapMonths(gender)`).
- `eta_minutes` ∈ {30, 60, 90} (90 = "more than one hour"). Required for `accepted`.
- `share_phone` required for `accepted` (true/false both fine; false just hides the number).
- These rules and wording are **"to be confirmed by a blood bank doctor"**: keep questions/rules in `src/lib/health-questions.ts` and `eligibility.ts` only.

Unit tests: every row above, all 2^4 combinations of the four blocking answers, gender-dependent wording, undecided states, and that `unwell_today=true` beats later answers.

---

## 4. Language and voice

| Lang | Used when | Twilio voice (female) | WhatsApp template language code |
|---|---|---|---|
| `te` | donor's first language is Telugu | `Google.te-IN-Standard-C` | `te` |
| `hi` | Hindi | `Google.hi-IN-Standard-E` | `hi` |
| `en` | English or fallback | `Google.en-IN-Standard-E` | `en` |

- Language choice: `donor.languages[0]`; if unsupported → `en`.
- All prompt strings live in `05-COPY-AND-TEMPLATES.md` §4 (voice) and §3/§5 (WhatsApp). Implement as `prompts[lang][key]` with `{placeholders}` and a unit test that every key exists in all three languages.
- **Spoken helpers:** `spellDigits('482197') → '4, 8, 2, 1, 9, 7'`; `spokenGroup('O+','te') → 'ఓ పాజిటివ్'` (table in the copy doc); `spokenUnits(2,'hi')`.
- Hospital names and areas are inserted as typed (they may be English). Keep sentences short so a TTS voice mispronouncing a name does not break the meaning.

---

## 5. Phone flow (IVR) — state machine (`src/server/assistant/ivr-flow.ts`)

Webhooks: `answer` (call connected) and `step` (a key was pressed). Each returns TwiML. **Every step first runs the guard:**

```
guard(contact, request, donor):
  if request.status not in (searching, waiting_requester, enough_donors) → END_CLOSED
  if donor.opted_out or kill_switch → END_CLOSED
  (if request.status == enough_donors the flow continues: an accepting donor becomes STANDBY)
```

### 5.1 Steps

| Step key | Prompt (meaning) | Keys | Next |
|---|---|---|---|
| `identity` | "Hello, this is Blood, an automated assistant for urgent blood requests. Am I speaking with {first_name}? Press 1 for yes, 2 for no." | 1 yes · 2 no | 1 → `willing` · 2 → END_WRONG_NUMBER |
| `willing` | "A patient urgently needs {group} blood, {units} unit(s), at {hospital}, {area}. Can you help? Press 1 for yes, 2 for no." | 1 · 2 | 1 → `donated_recently` · 2 → END_DECLINED |
| `donated_recently` | "Have you donated blood in the last {months} months? Press 1 for yes, 2 for no." | 1 yes · 2 no | any → next, rules at end |
| `unwell_today` | "Do you have fever, cold or any infection today? Press 1 for yes, 2 for no." | | |
| `recent_procedure` | "In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you taking antibiotics? Press 1 for yes, 2 for no." | | |
| `alcohol_24h` | "Have you had alcohol in the last 24 hours? Press 1 for yes, 2 for no." | | |
| *(evaluate here)* | if blocking answer → END_NOT_ELIGIBLE (do not ask more) | | |
| `eta` | "Can you reach the hospital within 30 minutes? Press 1 for within 30 minutes, 2 for about one hour, 3 for more than one hour." | 1·2·3 | → `share_phone` |
| `share_phone` | "May we share your phone number with the patient's family so they can call you? Press 1 for yes, 2 for no." | 1 · 2 | → ACCEPT |

**Early exit:** after each blocking-type question, if the answer is "yes" → go directly to END_NOT_ELIGIBLE (do not ask the remaining health questions).

### 5.2 End states (all speak a closing line, then `<Hangup/>`)

| End | When | Action |
|---|---|---|
| `END_ACCEPTED` | after `share_phone` | `finalize_contact(accepted, via 'call', answers, eta, share)` → say thanks + **donation code** (digits spelled) + "details sent on WhatsApp" + safety line. If the donor's card is **standby** use the standby closing line instead (still gives the code) |
| `END_CAP` | `finalize_contact` returned `cancelled` because accepted donors reached 2 × units | say "We already have enough donors. Thank you so much for being ready." |
| `END_DECLINED` | `willing=2` | `finalize_contact(declined)` → thank you |
| `END_NOT_ELIGIBLE` | blocking answer | `finalize_contact(not_eligible, answers)` → kind message ("You cannot donate this time. Thank you for your help.") |
| `END_WRONG_NUMBER` | `identity=2` | `finalize_contact(declined, {identity_confirmed:false})`, flag the number for admin review, apologize |
| `END_NO_INPUT` | two misses on a step | leave status `contacting`; say "We could not hear a reply. We sent a WhatsApp message; please reply there. Thank you." |
| `END_CLOSED` | guard failed | say "This request has already been fulfilled. Thank you for being ready to help." and mark contact `cancelled` if not decided |

### 5.3 Input handling
- Valid keys per step as in the table. Any other key → say "Sorry, please press 1 or 2" once (`try=2`); a second invalid/no input → END_NO_INPUT.
- `Gather timeout=6`, `numDigits=1`, `input=dtmf`.
- **Persist after every step** (`answers || {step: value}` plus `_call_step`) using the service client, so a dropped call keeps partial answers. A repeated webhook for the same step (same `CallSid`, `step`, `try`) must be a no-op that returns the same TwiML (idempotency).
- Total target length ≤ 2.5 min.

### 5.4 Accepted call: what we say at the end
> "Thank you, {first_name}. Your donation code is {code spelled}. Please tell this code at the hospital. We have sent the details on WhatsApp. The final health check is done by the doctor. Blood never asks for money. Goodbye."

---

## 6. WhatsApp flow (`src/server/assistant/wa-flow.ts`)

Starts when the alert template is sent. All later messages are **free-form** inside the 24-hour window opened by the donor's tap.

### 6.1 Messages and button ids

| Step | Bot message (meaning) | Buttons (title ≤ 20 chars) → id |
|---|---|---|
| alert (template `blood_request_alert`) | request summary + "Can you help?" | **Yes, I can come** → `a|{cid}|willing|yes` · **Not now** → `a|{cid}|willing|no` · **Stop alerts** → `a|{cid}|stop|yes` |
| `donated_recently` | "Have you donated blood in the last {months} months?" | Yes → `…|donated_recently|yes` · No → `…|no` |
| `unwell_today` | "Do you have fever, cold or any infection today?" | Yes / No |
| `recent_procedure` | "In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you on antibiotics?" | Yes / No |
| `alcohol_24h` | "Have you had alcohol in the last 24 hours?" | Yes / No |
| `eta` | "How soon can you reach the hospital?" | **Within 30 min** → `…|eta|30` · **About 1 hour** → `…|eta|60` · **Over 1 hour** → `…|eta|90` |
| `share_phone` | "May we share your number with the patient's family?" | **Yes, share** → `…|share_phone|yes` · **No** → `…|no` |
| accepted | details + code + safety line (see copy doc) | — |
| optional | "Please share your live location so the family knows how far you are." | WhatsApp location request (only if enabled) |

### 6.2 Rules
- Identity step is skipped (the donor tapped the button from their own WhatsApp).
- Evaluate after each blocking-type answer (same early exit as the phone flow).
- **Stale or wrong-step taps:** if a button's `step` is not the expected next step, ignore it and resend the current question.
- **Already decided:** if the contact is final (accepted/declined/…), reply once with the current status ("You are confirmed. Your donation code is …" / "This request is already closed. Thank you.") and do nothing else.
- **Closed request:** reply "This request has already been fulfilled. Thank you for being ready to help."
- **Free text during the flow:** map with keyword lists below to the current question; if not understood → resend the buttons (max 2 times) → then `needs_human`.
- **STOP** anywhere → opt-out (see TRD §7.5).
- **Late replies** (after the wave ended): still accepted if the request is still `searching`/`enough_donors` with room; `finalize_contact` enforces.

### 6.3 Keyword lists (normalize: lowercase, trim, strip punctuation)
- YES: `yes, y, ok, okay, ya, haan, ha, haa, ji, jee, avunu, avunandi, అవును, హా, हां, हाँ, जी`
- NO: `no, n, nope, nahi, nahin, kaadu, ledu, కాదు, లేదు, नहीं, ना`
- STOP: `stop, unsubscribe, cancel alerts, stop alerts, ఆపండి, ఆపు, रुकें, रुको, बंद`

---

## 7. Cross-channel behavior

| Situation | Behavior |
|---|---|
| Phone says YES, WhatsApp later says NO | Latest wins: contact becomes `declined`; if the request had been `enough_donors` it re-opens (SQL trigger) |
| Phone answered and finished | WhatsApp message gets a short "Thanks, we recorded your answers" (only if the window is open) |
| Phone not answered | WhatsApp stays valid; no second call except one retry (`now` urgency) |
| Both channels failed to send | `needs_human` |
| Donor accepts after the request became `enough_donors` | `finalize_contact` still accepts (the donor was already being contacted) up to **2 × units** accepted in total; the card is labelled **standby** (`is_standby`). The donor is told: "We have enough donors for now; we will contact you if needed." If a confirmed donor cancels, the first standby is promoted automatically. Beyond the cap the contact is `cancelled` and the donor hears/reads the "already have enough" message |

---

## 8. Safety and abuse rules for the assistant

- If the donor says anything that sounds like money ("pay", "rupees", "paise", "డబ్బు", "पैसे") on WhatsApp free text → reply with the no-money rule, flag `abuse_reports(type donor, reason 'asked_for_money')`.
- If the donor reports a medical problem or distress → say "Please seek medical help" and stop.
- Never promise the patient will get blood. Never give medical advice.
- Never ask for OTP, Aadhaar, bank, UPI or card details. If a donor offers them, tell them not to.
- Never reveal the requester's phone or the exact hospital pin before acceptance.

---

## 9. OPTIONAL "AI mode" (Phase 1B — **do not build in the MVP**; spec only)

A free-form talking agent can replace the keypad IVR later (Indic speech models via a managed voice-agent platform). When Siva decides to build it, it must be a **new `VoiceProvider`/flow behind a flag `voice_mode = 'ai'`**, keep the same `evaluate()` rules, and pass the checks below.

**System prompt (draft):**
> You are the automated assistant of "Blood", calling a registered volunteer blood donor in {language} about an urgent request. Be calm, brief and polite. First confirm you are speaking to {first_name}. Say you are an automated assistant. Explain: patient first name {patient}, blood group {group}, {units} unit(s), hospital {hospital}, {area}. Ask if they can help. If yes, ask exactly these questions, one at a time: donated in the last {months} months; fever/cold/infection today; surgery/vaccine/tattoo/piercing/antibiotics in recent weeks; alcohol in 24 hours; how soon they can reach; permission to share their phone number. Record each answer with the `save_answer` tool as yes/no or a number. Do not judge eligibility yourself. Never ask for money, OTP or ID numbers. If asked, say Blood never asks for money and the doctor does the final health check. If the donor wants to stop, call `finish` with `opted_out`. Keep the call under 3 minutes.

**Tools:** `save_answer(key, value)`, `finish(outcome)` where outcome ∈ `completed | declined | wrong_number | opted_out | unclear`. The server then runs `evaluate()`.

**Acceptance checks (when built):** 30 scripted dialogues per language (accents, interruptions, unclear answers, "who are you?", "is this a scam?", "call later", money request); 100% of blocking answers must lead to `not_eligible`; no hallucinated facts; average call < 3 min; cost per call recorded.

---

## 10. QA of the assistant (applies to the MVP)

1. **Unit tests:** eligibility truth table, keyword parsing, prompt completeness per language, `spellDigits`, `spokenGroup`.
2. **Flow tests (simulated):** drive `ivr-flow` and `wa-flow` with scripted inputs; assert DB end state; assert idempotency on repeated webhooks; assert out-of-order messages.
3. **Language review (human, before production):** a native speaker (and ideally a blood bank doctor for the health questions) reviews all Telugu and Hindi prompts, templates and copy. Record sign-off in `docs/DECISIONS.md`.
4. **Real-call checklist (UAT):** listen to the English, Hindi and Telugu calls on a real phone; check pronunciation of group names, numbers and the code; adjust phrasing (not logic) if needed.
