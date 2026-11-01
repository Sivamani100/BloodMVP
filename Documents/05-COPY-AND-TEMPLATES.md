# 05 — Copy, Voice Prompts and WhatsApp Templates (en / te / hi)

**Important:** Telugu and Hindi text below was drafted for this MVP and **must be reviewed by a native speaker** (and the health questions by a blood bank doctor) before real donors receive them. Review sign-off goes into `docs/DECISIONS.md`. Wording may be improved; **placeholders, meaning and button order must not change.**

Placeholders: `{app_name}` (default **Blood**), `{first_name}`, `{group}`, `{units_text}`, `{hospital}`, `{area}`, `{months}`, `{code_spelled}`. Templates use Meta numbering `{{1}}…`.

Style rules: short sentences · no medical jargon · never blame · always calm · always add the safety line when contacting donors.

**Safety line (SAFETY):**
- en: `Blood never asks for money or OTP. The final health check is done by the doctor.`
- hi: `Blood कभी पैसे या OTP नहीं माँगता। अंतिम स्वास्थ्य जाँच डॉक्टर करते हैं।`
- te: `Blood ఎప్పుడూ డబ్బు లేదా OTP అడగదు. చివరి ఆరోగ్య పరీక్ష డాక్టర్ చేస్తారు.`

---

## 1. Core UI strings (keys for `src/messages/*.json`)

Authoring rule for the agent: create **every** key in all three files. The keys below are mandatory minimum; add the rest in the same style, mark unreviewed Telugu/Hindi with `"_review": true` in a sidecar file `src/messages/review-needed.json`.

| Key | en | hi | te |
|---|---|---|---|
| `home.need_blood` | Need Blood | रक्त चाहिए | రక్తం కావాలి |
| `home.become_donor` | Become a donor | डोनर बनें | దాతగా నమోదు కండి |
| `home.tagline` | Find blood donors near the hospital, fast. | अस्पताल के पास रक्तदाता तेज़ी से खोजें। | ఆసుపత్రి దగ్గర రక్తదాతలను త్వరగా కనుగొనండి. |
| `nav.language` | Language | भाषा | భాష |
| `req.blood_group` | Blood group | ब्लड ग्रुप | రక్త గ్రూప్ |
| `req.dont_know_group` | I don't know | मुझे नहीं पता | నాకు తెలియదు |
| `req.dont_know_help` | Ask the hospital for the exact blood group. You can still see nearby blood banks. | अस्पताल से सही ब्लड ग्रुप पूछिए। आप पास के ब्लड बैंक फिर भी देख सकते हैं। | ఆసుపత్రిని సరైన రక్త గ్రూప్ అడగండి. దగ్గరలోని బ్లడ్ బ్యాంకులను ఇప్పటికీ చూడవచ్చు. |
| `req.component` | Type of blood | रक्त का प्रकार | రక్త రకం |
| `req.component.whole_blood` | Whole blood | पूरा रक्त | పూర్తి రక్తం |
| `req.component.red_cells` | Red cells | लाल रक्त कोशिकाएँ | ఎర్ర రక్త కణాలు |
| `req.component.platelets` | Platelets | प्लेटलेट्स | ప్లేట్‌లెట్లు |
| `req.component.plasma` | Plasma | प्लाज़्मा | ప్లాస్మా |
| `req.units` | Units needed | कितनी यूनिट चाहिए | ఎన్ని యూనిట్లు కావాలి |
| `req.urgency` | How urgent? | कितना ज़रूरी है? | ఎంత అత్యవసరం? |
| `req.urgency.now` | Right now | अभी | ఇప్పుడే |
| `req.urgency.six_hours` | Within 6 hours | 6 घंटे में | 6 గంటల్లో |
| `req.urgency.twenty_four_hours` | Within 24 hours | 24 घंटे में | 24 గంటల్లో |
| `req.urgency.planned` | Planned date | तय तारीख़ | ముందే నిర్ణయించిన తేదీ |
| `req.hospital` | Hospital | अस्पताल | ఆసుపత్రి |
| `req.use_my_location` | Use my location | मेरी लोकेशन इस्तेमाल करें | నా లొకేషన్ ఉపయోగించండి |
| `req.search_donors` | Search donors | डोनर खोजें | దాతలను వెతకండి |
| `req.send` | Send request | अनुरोध भेजें | అభ్యర్థన పంపండి |
| `banks.title` | Nearest blood banks | सबसे पास के ब्लड बैंक | దగ్గరలోని బ్లడ్ బ్యాంకులు |
| `banks.verified_ago` | Checked {minutes} min ago | {minutes} मिनट पहले जाँचा गया | {minutes} నిమిషాల క్రితం తనిఖీ చేశారు |
| `banks.not_verified` | Not verified. Please call. | जाँचा नहीं गया। कृपया फ़ोन करें। | ధృవీకరించలేదు. దయచేసి కాల్ చేయండి. |
| `banks.call_before_go` | Stock changes quickly. Call before you go. | स्टॉक जल्दी बदलता है। जाने से पहले फ़ोन करें। | స్టాక్ త్వరగా మారుతుంది. వెళ్లే ముందు కాల్ చేయండి. |
| `banks.trust.reliable` | Reliable | भरोसेमंद | నమ్మదగినది |
| `banks.trust.ok` | OK | ठीक | సరే |
| `banks.trust.low` | Often wrong | अक्सर गलत | తరచూ తప్పు |
| `live.searching` | Searching within {km} km | {km} किमी में खोज जारी | {km} కి.మీ లోపు వెతుకుతున్నాం |
| `live.progress` | {contacted} contacted · {accepted} accepted · need {need} | {contacted} संपर्क किए · {accepted} राज़ी · {need} चाहिए | {contacted} మందిని సంప్రదించాం · {accepted} అంగీకరించారు · {need} కావాలి |
| `live.call_donor` | Call | फ़ोन करें | కాల్ చేయండి |
| `live.standby` | Standby | स्टैंडबाय | స్టాండ్‌బై |
| `live.got_blood` | We got blood | रक्त मिल गया | రక్తం దొరికింది |
| `live.cancel` | Cancel request | अनुरोध रद्द करें | అభ్యర్థన రద్దు చేయండి |
| `gate.title` | Search further? | और दूर खोजें? | ఇంకా దూరం వెతకాలా? |
| `gate.body` | We searched {from} km around the hospital. Continue to {to} km? | हमने अस्पताल के {from} किमी में खोजा। क्या {to} किमी तक आगे खोजें? | ఆసుపత్రి చుట్టూ {from} కి.మీ వెతికాం. {to} కి.మీ వరకు కొనసాగించాలా? |
| `gate.body_100` | Donors this far may take hours to reach you. Do you still want us to continue? Please also call the nearest large blood banks. | इतनी दूर के डोनर को पहुँचने में घंटों लग सकते हैं। क्या फिर भी आगे खोजें? कृपया पास के बड़े ब्लड बैंकों को भी फ़ोन करें। | ఇంత దూరంలోని దాతలు చేరుకోవడానికి గంటలు పట్టవచ్చు. అయినా కొనసాగించాలా? దగ్గరలోని పెద్ద బ్లడ్ బ్యాంకులకు కూడా కాల్ చేయండి. |
| `gate.yes` | Yes, continue | हाँ, आगे खोजें | అవును, కొనసాగించండి |
| `gate.no` | No, stop | नहीं, रोकें | వద్దు, ఆపండి |
| `exhausted.title` | We could not find enough donors | हमें पर्याप्त डोनर नहीं मिले | తగినంత దాతలు దొరకలేదు |
| `exhausted.body` | Our team has been alerted. Please call the blood banks listed, the hospital's own blood centre, or the 108 ambulance helpline. | हमारी टीम को सूचित कर दिया गया है। कृपया दिए गए ब्लड बैंक, अस्पताल के ब्लड सेंटर या 108 एम्बुलेंस हेल्पलाइन को फ़ोन करें। | మా బృందానికి తెలియజేశాం. దయచేసి ఇచ్చిన బ్లడ్ బ్యాంకులు, ఆసుపత్రి బ్లడ్ సెంటర్ లేదా 108 అంబులెన్స్ హెల్ప్‌లైన్‌కు కాల్ చేయండి. |
| `compat.prompt` | No exact-group donor yet. Ask the doctor: can other compatible blood groups be used? | अभी सही ग्रुप का डोनर नहीं मिला। डॉक्टर से पूछिए: क्या दूसरे संगत ब्लड ग्रुप चल सकते हैं? | ఇంకా అదే గ్రూప్ దాత దొరకలేదు. డాక్టర్‌ను అడగండి: ఇతర అనుకూల రక్త గ్రూపులు వాడవచ్చా? |
| `donor.consent.title` | Before we start | शुरू करने से पहले | ప్రారంభించే ముందు |
| `donor.state.active` | You are active | आप सक्रिय हैं | మీరు యాక్టివ్‌గా ఉన్నారు |
| `donor.state.pending` | Almost there | बस थोड़ा बाकी है | దాదాపు పూర్తయింది |
| `donor.next_eligible` | You can donate again on {date} | आप {date} को फिर रक्तदान कर सकते हैं | మీరు {date} న మళ్లీ రక్తదానం చేయవచ్చు |
| `donor.pause` | Pause alerts | अलर्ट रोकें | అలర్ట్‌లను నిలిపివేయండి |
| `donor.delete` | Delete my account | मेरा खाता हटाएँ | నా ఖాతాను తొలగించండి |
| `donor.not_eligible_now` | You cannot donate right now. That is okay. Thank you for wanting to help. | आप अभी रक्तदान नहीं कर सकते। कोई बात नहीं। मदद करना चाहने के लिए धन्यवाद। | మీరు ఇప్పుడు రక్తదానం చేయలేరు. పర్వాలేదు. సహాయం చేయాలనుకున్నందుకు ధన్యవాదాలు. |
| `common.safety` | Blood never asks for money or OTP. | Blood कभी पैसे या OTP नहीं माँगता। | Blood ఎప్పుడూ డబ్బు లేదా OTP అడగదు. |
| `common.continue` | Continue | आगे बढ़ें | కొనసాగండి |
| `common.back` | Back | पीछे | వెనుకకు |
| `common.logout` | Log out | लॉग आउट | లాగ్ అవుట్ |
| `auth.enter_phone` | Enter your mobile number | अपना मोबाइल नंबर डालिए | మీ మొబైల్ నంబర్ ఇవ్వండి |
| `auth.otp_sent` | We sent a 6-digit code on WhatsApp. | हमने व्हाट्सऐप पर 6 अंकों का कोड भेजा है। | మేము వాట్సాప్‌లో 6 అంకెల కోడ్ పంపాము. |
| `auth.enter_code` | Enter the code | कोड डालिए | కోడ్ ఇవ్వండి |

**Money words blocked in notes** (case-insensitive, also as substrings): `pay, paid, rupee, rupees, rs, ₹, money, cash, upi, gpay, phonepe, paytm, bank transfer, డబ్బు, రూపాయి, పైసలు, పేమెంట్, पैसे, रुपये, पेमेंट, कैश`.

---

## 2. Consents (exact labels)

| Key | en | hi | te |
|---|---|---|---|
| `contact_calls_whatsapp` | You may contact me by WhatsApp and automated phone calls about urgent blood requests. | आप अत्यावश्यक रक्त अनुरोधों के लिए मुझसे व्हाट्सऐप और ऑटोमेटेड फ़ोन कॉल से संपर्क कर सकते हैं। | అత్యవసర రక్త అభ్యర్థనల కోసం మీరు నన్ను వాట్సాప్ మరియు ఆటోమేటెడ్ ఫోన్ కాల్స్ ద్వారా సంప్రదించవచ్చు. |
| `share_phone_after_yes` | My phone number may be shared with the patient's family only after I say YES to a request. | मेरा फ़ोन नंबर मरीज़ के परिवार को तभी दिया जाए जब मैं किसी अनुरोध के लिए हाँ कहूँ। | నేను ఒక అభ్యర్థనకు అవును అన్న తర్వాత మాత్రమే నా ఫోన్ నంబర్‌ను రోగి కుటుంబంతో పంచుకోవాలి. |
| `data_storage` | Blood may store the details I enter here to match me with patients. | मैं जो जानकारी यहाँ दे रहा/रही हूँ, उसे Blood मरीज़ों से मिलाने के लिए सुरक्षित रख सकता है। | నేను ఇక్కడ ఇచ్చే వివరాలను రోగులతో జతచేయడానికి Blood భద్రపరచవచ్చు. |
| `call_recording` | Calls may be recorded for safety and quality. | सुरक्षा और गुणवत्ता के लिए कॉल रिकॉर्ड की जा सकती हैं। | భద్రత మరియు నాణ్యత కోసం కాల్స్ రికార్డ్ చేయవచ్చు. |
| `no_money_and_final_check` | I understand Blood never asks for money, and the doctor at the blood bank does the final health check. | मैं समझता/समझती हूँ कि Blood कभी पैसे नहीं माँगता और अंतिम स्वास्थ्य जाँच ब्लड बैंक के डॉक्टर करते हैं। | Blood ఎప్పుడూ డబ్బు అడగదని, బ్లడ్ బ్యాంక్ డాక్టర్ చివరి ఆరోగ్య పరీక్ష చేస్తారని నాకు అర్థమైంది. |
| `age_18` | I am 18 years old or older. | मेरी उम्र 18 साल या उससे अधिक है। | నా వయసు 18 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ. |

---

## 3. WhatsApp templates (register with `scripts/create-wa-templates.ts`)

Register each template in **en, hi, te** under the **same name**. Provide `example` values (Meta requires samples). Category as shown. Meta may change the category after review — the script must print the final category and status. Quick-reply button texts ≤ 25 characters.

### 3.1 `blood_login_code` — category AUTHENTICATION
Meta fixes the body wording. Create with:
```json
{
  "name": "blood_login_code",
  "language": "en",
  "category": "AUTHENTICATION",
  "components": [
    { "type": "BODY", "add_security_recommendation": true },
    { "type": "FOOTER", "code_expiration_minutes": 10 },
    { "type": "BUTTONS", "buttons": [ { "type": "OTP", "otp_type": "COPY_CODE", "text": "Copy code" } ] }
  ]
}
```
Repeat for `hi` and `te`. **Sending:** body parameter = the code; button component `sub_type: "url"`, `index: "0"`, parameter text = the code (Meta's authentication-template format; confirm in current docs).

### 3.2 `blood_request_alert` — category UTILITY (donor alert)
Variables: `{{1}}` patient first name · `{{2}}` blood group · `{{3}}` units · `{{4}}` hospital · `{{5}}` area · `{{6}}` needed within (see §3.9).

- **en body:**
```
Urgent blood request near you.

Patient: {{1}}
Blood group: {{2}}
Units needed: {{3}}
Hospital: {{4}}, {{5}}
Needed within: {{6}}

Can you help? Blood never asks for money or OTP. The final health check is done by the doctor.
```
 Buttons (QUICK_REPLY): `Yes, I can come` · `Not now` · `Stop alerts`
- **hi body:**
```
आपके पास अत्यावश्यक रक्त अनुरोध।

मरीज़: {{1}}
ब्लड ग्रुप: {{2}}
ज़रूरी यूनिट: {{3}}
अस्पताल: {{4}}, {{5}}
कितने समय में चाहिए: {{6}}

क्या आप मदद कर सकते हैं? Blood कभी पैसे या OTP नहीं माँगता। अंतिम स्वास्थ्य जाँच डॉक्टर करते हैं।
```
 Buttons: `हाँ, मैं तैयार हूँ` · `अभी नहीं` · `अलर्ट बंद करें`
- **te body:**
```
మీ దగ్గర అత్యవసర రక్త అభ్యర్థన.

రోగి: {{1}}
రక్త గ్రూప్: {{2}}
కావలసిన యూనిట్లు: {{3}}
ఆసుపత్రి: {{4}}, {{5}}
ఎంత సమయంలో కావాలి: {{6}}

మీరు సహాయం చేయగలరా? Blood ఎప్పుడూ డబ్బు లేదా OTP అడగదు. చివరి ఆరోగ్య పరీక్ష డాక్టర్ చేస్తారు.
```
 Buttons: `అవును, నేను సిద్ధం` · `ఇప్పుడు కాదు` · `అలర్ట్‌లు ఆపండి`

**Sending with button payloads:** add three `button` components `sub_type:"quick_reply"`, `index:"0|1|2"`, `parameters:[{type:"payload", payload:"a|<contactId>|willing|yes"}]`, `…|willing|no`, `…|stop|yes`.
Samples for registration: `Ravi, O+, 2, Government General Hospital, Rajahmundry, 2 hours`.

### 3.3 `blood_donor_details` — UTILITY (after acceptance when the 24-h window is closed)
Variables: `{{1}}` donor first name · `{{2}}` donation code · `{{3}}` hospital · `{{4}}` area · `{{5}}` ward/room (or the words "ask at reception" in the donor's language) · `{{6}}` requester first name · `{{7}}` requester phone. Button: URL `Open details` → `https://{APP_DOMAIN}/d/{{1}}` (variable = contact id).
- **en:** `Thank you, {{1}}. You are confirmed.\n\nDonation code: {{2}}\nHospital: {{3}}, {{4}}\nWard / room: {{5}}\nFamily contact: {{6}}, {{7}}\n\nPlease tell the code at the hospital. The final health check is done by the doctor. Blood never asks for money.`
- **hi:** `धन्यवाद {{1}} जी। आपकी पुष्टि हो गई है।\n\nडोनेशन कोड: {{2}}\nअस्पताल: {{3}}, {{4}}\nवार्ड / कमरा: {{5}}\nपरिवार का संपर्क: {{6}}, {{7}}\n\nकृपया अस्पताल में यह कोड बताइए। अंतिम स्वास्थ्य जाँच डॉक्टर करते हैं। Blood कभी पैसे नहीं माँगता।`
- **te:** `ధన్యవాదాలు {{1}} గారు. మీ నిర్ధారణ అయింది.\n\nడొనేషన్ కోడ్: {{2}}\nఆసుపత్రి: {{3}}, {{4}}\nవార్డ్ / గది: {{5}}\nకుటుంబ సంప్రదింపు: {{6}}, {{7}}\n\nఆసుపత్రిలో ఈ కోడ్ చెప్పండి. చివరి ఆరోగ్య పరీక్ష డాక్టర్ చేస్తారు. Blood ఎప్పుడూ డబ్బు అడగదు.`
 Button label: en `Open details` · hi `विवरण खोलें` · te `వివరాలు చూడండి`.
 If the donor said "do not share my number" the family phone is still shown **to the donor** (the donor may call the family).

### 3.4 `blood_donor_accepted` — UTILITY (to the requester)
Variable `{{1}}` patient first name. Button URL `Open request` → `https://{APP_DOMAIN}/r/{{1}}` (variable = request id).
- **en:** `Good news: a donor has agreed to help for {{1}}. Open the request to see who is coming and to call them.`
- **hi:** `अच्छी ख़बर: {{1}} के लिए एक डोनर मदद करने को तैयार हैं। कौन आ रहा है यह देखने और उन्हें फ़ोन करने के लिए अनुरोध खोलिए।`
- **te:** `శుభవార్త: {{1}} కోసం ఒక దాత సహాయం చేయడానికి అంగీకరించారు. ఎవరు వస్తున్నారో చూడటానికి, వారికి కాల్ చేయడానికి అభ్యర్థనను తెరవండి.`
 Button label: `Open request` · `अनुरोध खोलें` · `అభ్యర్థన తెరవండి`.

### 3.5 `blood_request_closed` — UTILITY (to accepted donors when the request ends)
Variable `{{1}}` area.
- **en:** `The blood request near {{1}} is now closed. Thank you for being ready to help. You do not need to travel.`
- **hi:** `{{1}} के पास का रक्त अनुरोध अब बंद हो गया है। मदद के लिए तैयार रहने के लिए धन्यवाद। अब आपको जाने की ज़रूरत नहीं है।`
- **te:** `{{1}} దగ్గరి రక్త అభ్యర్థన ఇప్పుడు ముగిసింది. సహాయం చేయడానికి సిద్ధంగా ఉన్నందుకు ధన్యవాదాలు. మీరు వెళ్లాల్సిన అవసరం లేదు.`

### 3.6 `blood_donation_thanks` — UTILITY
Variables `{{1}}` donor first name · `{{2}}` next eligible date (e.g. `12 Feb 2027`).
- **en:** `Thank you, {{1}}, for donating blood. You helped a family in need. You can donate again after {{2}}.`
- **hi:** `{{1}} जी, रक्तदान के लिए धन्यवाद। आपने एक ज़रूरतमंद परिवार की मदद की। आप {{2}} के बाद फिर रक्तदान कर सकते हैं।`
- **te:** `{{1}} గారు, రక్తదానం చేసినందుకు ధన్యవాదాలు. మీరు అవసరంలో ఉన్న ఒక కుటుంబానికి సహాయం చేశారు. మీరు {{2}} తర్వాత మళ్లీ రక్తదానం చేయవచ్చు.`

### 3.7 `blood_donor_welcome` — UTILITY
Variable `{{1}}` first name.
- **en:** `Welcome to Blood, {{1}}. Your donor profile is active. We contact you only for urgent matching requests. Reply STOP anytime to stop alerts.`
- **hi:** `Blood में आपका स्वागत है, {{1}} जी। आपकी डोनर प्रोफ़ाइल सक्रिय है। हम केवल ज़रूरी और मेल खाते अनुरोधों के लिए संपर्क करेंगे। अलर्ट रोकने के लिए कभी भी STOP लिखिए।`
- **te:** `Blood కు స్వాగతం, {{1}} గారు. మీ దాత ప్రొఫైల్ యాక్టివ్‌గా ఉంది. అత్యవసరమైన, సరిపోయే అభ్యర్థనల కోసం మాత్రమే సంప్రదిస్తాం. అలర్ట్‌లు ఆపడానికి ఎప్పుడైనా STOP అని రాయండి.`

### 3.8 Opt-out keywords (case-insensitive, after trimming)
`STOP`, `UNSUBSCRIBE`, `STOP ALERTS`, `ఆపండి`, `ఆపు`, `रुकें`, `रुको`, `बंद`.

### 3.9 "Needed within" text (variable `{{6}}`)
| urgency | en | hi | te |
|---|---|---|---|
| now | 2 hours | 2 घंटे | 2 గంటలు |
| six_hours | 6 hours | 6 घंटे | 6 గంటలు |
| twenty_four_hours | 24 hours | 24 घंटे | 24 గంటలు |
| planned | `{date}` formatted `d MMM` in the locale | same | same |

---

## 4. Voice prompts (IVR) — keys used by `ivr-flow.ts`

`{units_text}`: en `1 unit` / `2 units`; hi `1 यूनिट` / `2 यूनिट`; te `1 యూనిట్` / `2 యూనిట్లు`.

| Key | en | hi | te |
|---|---|---|---|
| `identity` | Hello. This is {app_name}, an automated assistant for urgent blood requests. Am I speaking with {first_name}? Press 1 for yes. Press 2 for no. | नमस्ते। मैं {app_name} का ऑटोमेटेड असिस्टेंट हूँ, अत्यावश्यक रक्त अनुरोधों के लिए। क्या {first_name} जी से बात हो रही है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | నమస్కారం. నేను {app_name} ఆటోమేటెడ్ అసిస్టెంట్‌ని, అత్యవసర రక్త అభ్యర్థనల కోసం. {first_name} గారితో మాట్లాడుతున్నానా? అవును అయితే 1 నొక్కండి. కాదు అయితే 2 నొక్కండి. |
| `willing` | A patient urgently needs {group} blood, {units_text}, at {hospital}, {area}. Can you help? Press 1 for yes. Press 2 for no. | एक मरीज़ को {hospital}, {area} में तुरंत {group} रक्त की {units_text} ज़रूरत है। क्या आप मदद कर सकते हैं? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | {hospital}, {area} లో ఒక రోగికి అత్యవసరంగా {group} రక్తం {units_text} కావాలి. మీరు సహాయం చేయగలరా? అవును అయితే 1 నొక్కండి. కాదు అయితే 2 నొక్కండి. |
| `donated_recently` | Have you donated blood in the last {months} months? Press 1 for yes. Press 2 for no. | क्या आपने पिछले {months} महीनों में रक्तदान किया है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | గత {months} నెలల్లో మీరు రక్తదానం చేశారా? చేశాను అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి. |
| `unwell_today` | Do you have fever, cold or any infection today? Press 1 for yes. Press 2 for no. | क्या आज आपको बुखार, सर्दी-ज़ुकाम या कोई संक्रमण है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | ఈ రోజు మీకు జ్వరం, జలుబు లేదా ఏదైనా ఇన్ఫెక్షన్ ఉందా? ఉంది అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి. |
| `recent_procedure` | In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you taking antibiotics? Press 1 for yes. Press 2 for no. | क्या पिछले कुछ हफ़्तों में आपकी सर्जरी हुई है, टीका लगा है, टैटू या पियर्सिंग करवाई है, या आप एंटीबायोटिक ले रहे हैं? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | గత కొన్ని వారాల్లో మీకు శస్త్రచికిత్స, వ్యాక్సిన్, టాటూ లేదా పియర్సింగ్ జరిగిందా, లేదా యాంటీబయాటిక్స్ వాడుతున్నారా? అవును అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి. |
| `alcohol_24h` | Have you had alcohol in the last 24 hours? Press 1 for yes. Press 2 for no. | क्या आपने पिछले 24 घंटों में शराब पी है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | గత 24 గంటల్లో మీరు మద్యం సేవించారా? అవును అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి. |
| `eta` | Can you reach the hospital within 30 minutes? Press 1 for within 30 minutes. Press 2 for about one hour. Press 3 for more than one hour. | क्या आप 30 मिनट में अस्पताल पहुँच सकते हैं? 30 मिनट के अंदर के लिए 1 दबाइए। लगभग एक घंटे के लिए 2 दबाइए। एक घंटे से ज़्यादा के लिए 3 दबाइए। | మీరు 30 నిమిషాల్లో ఆసుపత్రికి చేరుకోగలరా? 30 నిమిషాల్లో అయితే 1 నొక్కండి. సుమారు ఒక గంటలో అయితే 2 నొక్కండి. ఒక గంట కంటే ఎక్కువ సమయం పడితే 3 నొక్కండి. |
| `share_phone` | May we share your phone number with the patient's family, so they can call you? Press 1 for yes. Press 2 for no. | क्या हम आपका फ़ोन नंबर मरीज़ के परिवार को दे सकते हैं, ताकि वे आपको फ़ोन कर सकें? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए। | రోగి కుటుంబం మీకు ఫోన్ చేయడానికి, మీ ఫోన్ నంబర్‌ను వారితో పంచుకోవచ్చా? అవును అయితే 1 నొక్కండి. వద్దు అయితే 2 నొక్కండి. |
| `retry_12` | Sorry, I did not get that. Please press 1 or 2. | माफ़ कीजिए, जवाब समझ नहीं आया। कृपया 1 या 2 दबाइए। | క్షమించండి, అర్థం కాలేదు. దయచేసి 1 లేదా 2 నొక్కండి. |
| `retry_123` | Sorry, I did not get that. Please press 1, 2 or 3. | माफ़ कीजिए, जवाब समझ नहीं आया। कृपया 1, 2 या 3 दबाइए। | క్షమించండి, అర్థం కాలేదు. దయచేసి 1, 2 లేదా 3 నొక్కండి. |
| `end_accepted` | Thank you, {first_name}. Your donation code is {code_spelled}. Please tell this code at the hospital. We have sent the details on WhatsApp. The final health check is done by the doctor. {app_name} never asks for money. Goodbye. | धन्यवाद {first_name} जी। आपका डोनेशन कोड है {code_spelled}। कृपया अस्पताल में यह कोड बताइए। विवरण हमने व्हाट्सऐप पर भेज दिया है। अंतिम स्वास्थ्य जाँच डॉक्टर करेंगे। {app_name} कभी पैसे नहीं माँगता। नमस्ते। | ధన్యవాదాలు {first_name} గారు. మీ డొనేషన్ కోడ్ {code_spelled}. ఆసుపత్రిలో ఈ కోడ్ చెప్పండి. వివరాలు వాట్సాప్‌లో పంపాము. చివరి ఆరోగ్య పరీక్ష డాక్టర్ చేస్తారు. {app_name} ఎప్పుడూ డబ్బు అడగదు. నమస్కారం. |
| `end_standby` | Thank you, {first_name}. We have enough donors for now, and you are on standby. We will contact you if needed. Your code is {code_spelled}. {app_name} never asks for money. Goodbye. | धन्यवाद {first_name} जी। अभी हमारे पास पर्याप्त डोनर हैं, और आप स्टैंडबाय पर हैं। ज़रूरत पड़ने पर हम आपसे संपर्क करेंगे। आपका कोड है {code_spelled}। {app_name} कभी पैसे नहीं माँगता। नमस्ते। | ధన్యవాదాలు {first_name} గారు. ప్రస్తుతం మాకు తగినంత దాతలు ఉన్నారు, మీరు స్టాండ్‌బైలో ఉన్నారు. అవసరమైతే మిమ్మల్ని సంప్రదిస్తాము. మీ కోడ్ {code_spelled}. {app_name} ఎప్పుడూ డబ్బు అడగదు. నమస్కారం. |
| `end_declined` | Thank you for your time. We will contact you again only if needed. Goodbye. | आपके समय के लिए धन्यवाद। ज़रूरत होने पर ही हम दोबारा संपर्क करेंगे। नमस्ते। | మీ సమయానికి ధన్యవాదాలు. అవసరమైనప్పుడే మళ్లీ సంప్రదిస్తాము. నమస్కారం. |
| `end_not_eligible` | Thank you for your honest answers. You cannot donate this time. We appreciate your help. Goodbye. | आपके ईमानदार जवाबों के लिए धन्यवाद। इस बार आप रक्तदान नहीं कर सकते। आपकी मदद के लिए आभार। नमस्ते। | మీ నిజాయితీ సమాధానాలకు ధన్యవాదాలు. ఈసారి మీరు రక్తదానం చేయలేరు. మీ సహాయానికి కృతజ్ఞతలు. నమస్కారం. |
| `end_wrong_number` | Sorry for the disturbance. We called the wrong person. Goodbye. | परेशानी के लिए क्षमा कीजिए। गलती से आपको फ़ोन लग गया। नमस्ते। | ఇబ్బందికి క్షమించండి. పొరపాటున మీకు కాల్ వచ్చింది. నమస్కారం. |
| `end_no_input` | We could not hear a reply. We have sent a WhatsApp message. Please reply there. Thank you. Goodbye. | हमें कोई जवाब सुनाई नहीं दिया। हमने व्हाट्सऐप पर संदेश भेजा है, कृपया वहाँ जवाब दीजिए। धन्यवाद। नमस्ते। | మాకు ఏ సమాధానం వినిపించలేదు. వాట్సాప్‌లో సందేశం పంపాము, దయచేసి అక్కడ సమాధానం ఇవ్వండి. ధన్యవాదాలు. నమస్కారం. |
| `end_closed` | This request has already been fulfilled. Thank you for being ready to help. Goodbye. | यह अनुरोध पहले ही पूरा हो चुका है। मदद के लिए तैयार रहने के लिए धन्यवाद। नमस्ते। | ఈ అభ్యర్థన ఇప్పటికే పూర్తయింది. సహాయం చేయడానికి సిద్ధంగా ఉన్నందుకు ధన్యవాదాలు. నమస్కారం. |
| `end_cap` | We already have enough donors. Thank you so much for being ready. Goodbye. | हमारे पास पहले से पर्याप्त डोनर हैं। तैयार रहने के लिए बहुत धन्यवाद। नमस्ते। | మాకు ఇప్పటికే తగినంత దాతలు ఉన్నారు. సిద్ధంగా ఉన్నందుకు చాలా ధన్యవాదాలు. నమస్కారం. |

---

## 5. Spoken helpers

**Blood group spoken:**

| Group | en | hi | te |
|---|---|---|---|
| A+ | A positive | ए पॉज़िटिव | ఏ పాజిటివ్ |
| A- | A negative | ए निगेटिव | ఏ నెగటివ్ |
| B+ | B positive | बी पॉज़िटिव | బీ పాజిటివ్ |
| B- | B negative | बी निगेटिव | బీ నెగటివ్ |
| O+ | O positive | ओ पॉज़िटिव | ఓ పాజిటివ్ |
| O- | O negative | ओ निगेटिव | ఓ నెగటివ్ |
| AB+ | A B positive | ए बी पॉज़िटिव | ఏ బీ పాజిటివ్ |
| AB- | A B negative | ए बी निगेटिव | ఏ బీ నెగటివ్ |

**Digits for the code:** read digit by digit with pauses: `482197` → `4, 8, 2, 1, 9, 7` (digits as numerals work with all three Google voices; if a voice reads them badly, spell as words from this table).

| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| zero | one | two | three | four | five | six | seven | eight | nine |
| शून्य | एक | दो | तीन | चार | पाँच | छह | सात | आठ | नौ |
| సున్నా | ఒకటి | రెండు | మూడు | నాలుగు | ఐదు | ఆరు | ఏడు | ఎనిమిది | తొమ్మిది |

---

## 6. WhatsApp free-form messages (inside the 24-hour window)

Questions use the same text as voice but without "Press …". Buttons (titles ≤ 20 characters):

| Step | Question text | Buttons en | hi | te |
|---|---|---|---|---|
| `donated_recently` | Have you donated blood in the last {months} months? | Yes · No | हाँ · नहीं | అవును · కాదు |
| `unwell_today` | Do you have fever, cold or any infection today? | Yes · No | हाँ · नहीं | అవును · కాదు |
| `recent_procedure` | In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you taking antibiotics? | Yes · No | हाँ · नहीं | అవును · కాదు |
| `alcohol_24h` | Have you had alcohol in the last 24 hours? | Yes · No | हाँ · नहीं | అవును · కాదు |
| `eta` | How soon can you reach the hospital? | Within 30 min · About 1 hour · Over 1 hour | 30 मिनट में · लगभग 1 घंटा · 1 घंटे से ज़्यादा | 30 నిమిషాల్లో · సుమారు 1 గంట · 1 గంట కంటే ఎక్కువ |
| `share_phone` | May we share your number with the patient's family so they can call you? | Yes, share · No | हाँ, दे सकते हैं · नहीं | అవును, పంచుకోండి · వద్దు |

(hi/te question texts = the corresponding `donated_recently` … `share_phone` voice prompts with the "press …" sentences removed.)

**Messages:**

| Key | en | hi | te |
|---|---|---|---|
| `wa.thanks_start` | Thank you! A few quick questions. | धन्यवाद! कुछ छोटे सवाल। | ధన్యవాదాలు! కొన్ని చిన్న ప్రశ్నలు. |
| `wa.accepted` | You are confirmed. Donation code: {code}. Hospital: {hospital}, {area}. Ward / room: {ward}. Family contact: {requester_name}, {requester_phone}. Please tell the code at the hospital. SAFETY | आपकी पुष्टि हो गई है। डोनेशन कोड: {code}। अस्पताल: {hospital}, {area}। वार्ड / कमरा: {ward}। परिवार का संपर्क: {requester_name}, {requester_phone}। कृपया अस्पताल में यह कोड बताइए। SAFETY | మీ నిర్ధారణ అయింది. డొనేషన్ కోడ్: {code}. ఆసుపత్రి: {hospital}, {area}. వార్డ్ / గది: {ward}. కుటుంబ సంప్రదింపు: {requester_name}, {requester_phone}. ఆసుపత్రిలో ఈ కోడ్ చెప్పండి. SAFETY |
| `wa.standby` | We have enough donors for now, and you are on standby. We will contact you if needed. Your code: {code}. | अभी हमारे पास पर्याप्त डोनर हैं, और आप स्टैंडबाय पर हैं। ज़रूरत पड़ने पर संपर्क करेंगे। आपका कोड: {code}। | ప్రస్తుతం మాకు తగినంత దాతలు ఉన్నారు, మీరు స్టాండ్‌బైలో ఉన్నారు. అవసరమైతే సంప్రదిస్తాం. మీ కోడ్: {code}. |
| `wa.declined` | Thank you. We will contact you again only if needed. | धन्यवाद। ज़रूरत होने पर ही हम फिर संपर्क करेंगे। | ధన్యవాదాలు. అవసరమైనప్పుడే మళ్లీ సంప్రదిస్తాం. |
| `wa.not_eligible` | Thank you for your honest answers. You cannot donate this time. We appreciate your help. | आपके ईमानदार जवाबों के लिए धन्यवाद। इस बार आप रक्तदान नहीं कर सकते। आपकी मदद के लिए आभार। | మీ నిజాయితీ సమాధానాలకు ధన్యవాదాలు. ఈసారి మీరు రక్తదానం చేయలేరు. మీ సహాయానికి కృతజ్ఞతలు. |
| `wa.closed` | This request has already been fulfilled. Thank you for being ready to help. | यह अनुरोध पहले ही पूरा हो चुका है। मदद के लिए तैयार रहने के लिए धन्यवाद। | ఈ అభ్యర్థన ఇప్పటికే పూర్తయింది. సహాయం చేయడానికి సిద్ధంగా ఉన్నందుకు ధన్యవాదాలు. |
| `wa.cap` | We already have enough donors. Thank you so much for being ready. | हमारे पास पहले से पर्याप्त डोनर हैं। तैयार रहने के लिए बहुत धन्यवाद। | మాకు ఇప్పటికే తగినంత దాతలు ఉన్నారు. సిద్ధంగా ఉన్నందుకు చాలా ధన్యవాదాలు. |
| `wa.stop_confirm` | You will not get alerts from Blood any more. To start again, open your donor dashboard. Thank you for your help. | अब आपको Blood से अलर्ट नहीं मिलेंगे। फिर शुरू करने के लिए अपना डोनर डैशबोर्ड खोलिए। आपकी मदद के लिए धन्यवाद। | ఇకపై Blood నుండి మీకు అలర్ట్‌లు రావు. మళ్లీ ప్రారంభించడానికి మీ దాత డాష్‌బోర్డ్ తెరవండి. మీ సహాయానికి ధన్యవాదాలు. |
| `wa.already_confirmed` | You are already confirmed. Your donation code is {code}. | आप पहले से पुष्ट हैं। आपका डोनेशन कोड है {code}। | మీరు ఇప్పటికే నిర్ధారించబడ్డారు. మీ డొనేషన్ కోడ్ {code}. |
| `wa.help` | Please use the buttons to answer. To stop alerts, reply STOP. | कृपया जवाब देने के लिए बटन इस्तेमाल कीजिए। अलर्ट रोकने के लिए STOP लिखिए। | దయచేసి సమాధానం ఇవ్వడానికి బటన్లు వాడండి. అలర్ట్‌లు ఆపడానికి STOP అని రాయండి. |
| `wa.money_rule` | Blood never asks for money. Please do not pay or accept payment from anyone. | Blood कभी पैसे नहीं माँगता। कृपया किसी को पैसे न दें और न लें। | Blood ఎప్పుడూ డబ్బు అడగదు. దయచేసి ఎవరికీ డబ్బు ఇవ్వకండి, తీసుకోకండి. |

`SAFETY` means: append the safety line from the top of this file.

---

## 7. Errors (user-facing)

| Key | en | hi | te |
|---|---|---|---|
| `auth_required` | Please log in to continue. | आगे बढ़ने के लिए लॉग इन कीजिए। | కొనసాగడానికి దయచేసి లాగిన్ చేయండి. |
| `phone_not_verified` | Please verify your phone number first. | पहले अपना फ़ोन नंबर सत्यापित कीजिए। | ముందు మీ ఫోన్ నంబర్‌ను ధృవీకరించండి. |
| `rate_limited` | Too many tries. Please wait a little and try again. | बहुत ज़्यादा कोशिशें। थोड़ा रुककर फिर कोशिश कीजिए। | చాలా ప్రయత్నాలు జరిగాయి. కొంచెం ఆగి మళ్లీ ప్రయత్నించండి. |
| `duplicate_request` | You already have an active request for this patient and hospital. | इस मरीज़ और अस्पताल के लिए आपका एक अनुरोध पहले से चालू है। | ఈ రోగి, ఆసుపత్రికి మీకు ఇప్పటికే ఒక అభ్యర్థన ఉంది. |
| `service_paused` | The service is paused for a short time. Please call the blood banks listed. | सेवा थोड़ी देर के लिए रुकी है। कृपया दिए गए ब्लड बैंकों को फ़ोन कीजिए। | సేవ కొద్దిసేపు నిలిపివేయబడింది. దయచేసి ఇచ్చిన బ్లడ్ బ్యాంకులకు కాల్ చేయండి. |
| `invalid_input` | Please check the details you entered. | कृपया दी गई जानकारी जाँच लीजिए। | దయచేసి మీరు ఇచ్చిన వివరాలను చూడండి. |
| `not_found_or_forbidden` | We could not find this, or you do not have access. | यह नहीं मिला, या आपके पास पहुँच नहीं है। | ఇది కనిపించలేదు, లేదా మీకు అనుమతి లేదు. |
| `code_wrong` | That code is not correct. Please check with the donor. | यह कोड सही नहीं है। कृपया डोनर से पूछ लीजिए। | ఆ కోడ్ సరైనది కాదు. దయచేసి దాతను అడగండి. |
| `code_locked` | Too many wrong codes. Please try again in an hour. | बहुत ज़्यादा गलत कोड। कृपया एक घंटे बाद कोशिश कीजिए। | చాలా తప్పు కోడ్‌లు. దయచేసి ఒక గంట తర్వాత ప్రయత్నించండి. |
| `donor_not_eligible` | You cannot donate right now. Thank you for wanting to help. | आप अभी रक्तदान नहीं कर सकते। मदद करना चाहने के लिए धन्यवाद। | మీరు ఇప్పుడు రక్తదానం చేయలేరు. సహాయం చేయాలనుకున్నందుకు ధన్యవాదాలు. |
| `provider_unavailable` | We could not send messages right now. Our team has been alerted. | अभी संदेश नहीं भेज सके। हमारी टीम को सूचित कर दिया गया है। | ఇప్పుడు సందేశాలు పంపలేకపోయాం. మా బృందానికి తెలియజేశాం. |
| `unknown` | Something went wrong. Please try again. | कुछ गड़बड़ हुई। कृपया फिर कोशिश कीजिए। | ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి. |

---

## 8. Health quick-check question texts

(Keys and logic in PRD §8.3. Kind tone. "Yes" blocks.)

| Key | en | hi | te |
|---|---|---|---|
| `fever_today` | Do you have fever, cold, cough or feel unwell today? | क्या आज आपको बुखार, सर्दी, खाँसी है या तबीयत ठीक नहीं लग रही? | ఈ రోజు మీకు జ్వరం, జలుబు, దగ్గు ఉందా లేదా ఆరోగ్యం బాగోలేదా? |
| `recent_illness` | In the last 4 weeks, did you have fever, infection, jaundice, malaria, typhoid or dengue? | क्या पिछले 4 हफ़्तों में आपको बुखार, संक्रमण, पीलिया, मलेरिया, टाइफाइड या डेंगू हुआ? | గత 4 వారాల్లో మీకు జ్వరం, ఇన్ఫెక్షన్, కామెర్లు, మలేరియా, టైఫాయిడ్ లేదా డెంగ్యూ వచ్చిందా? |
| `on_antibiotics` | Are you taking antibiotics or any strong medicine now? | क्या आप अभी एंटीबायोटिक या कोई तेज़ दवा ले रहे हैं? | మీరు ఇప్పుడు యాంటీబయాటిక్స్ లేదా ఏదైనా బలమైన మందు వాడుతున్నారా? |
| `recent_vaccine` | Did you get any vaccine in the last 4 weeks? | क्या पिछले 4 हफ़्तों में आपने कोई टीका लगवाया? | గత 4 వారాల్లో మీరు ఏదైనా వ్యాక్సిన్ తీసుకున్నారా? |
| `recent_surgery` | Did you have surgery or major dental work in the last 6 months? | क्या पिछले 6 महीनों में आपकी सर्जरी या बड़ा दाँतों का इलाज हुआ? | గత 6 నెలల్లో మీకు శస్త్రచికిత్స లేదా పెద్ద దంత చికిత్స జరిగిందా? |
| `tattoo_piercing` | Did you get a tattoo, piercing or acupuncture in the last 6 months? | क्या पिछले 6 महीनों में आपने टैटू, पियर्सिंग या एक्यूपंक्चर करवाया? | గత 6 నెలల్లో మీరు టాటూ, పియర్సింగ్ లేదా అక్యుపంక్చర్ చేయించుకున్నారా? |
| `pregnant_or_nursing` | Are you pregnant or breastfeeding, or did you have a delivery or miscarriage in the last 6 months? | क्या आप गर्भवती हैं या स्तनपान करा रही हैं, या पिछले 6 महीनों में प्रसव या गर्भपात हुआ? | మీరు గర్భవతా లేదా పాలిస్తున్నారా, లేదా గత 6 నెలల్లో ప్రసవం లేదా గర్భస్రావం జరిగిందా? |
| `alcohol_24h` | Did you have alcohol in the last 24 hours? | क्या पिछले 24 घंटों में आपने शराब पी? | గత 24 గంటల్లో మీరు మద్యం సేవించారా? |
| `chronic` | Do you have heart disease, epilepsy, kidney disease, cancer, diabetes treated with insulin, a bleeding disorder, or HIV or hepatitis B/C? | क्या आपको हृदय रोग, मिर्गी, किडनी रोग, कैंसर, इंसुलिन वाला मधुमेह, खून बहने की बीमारी, या एचआईवी या हेपेटाइटिस बी/सी है? | మీకు గుండె జబ్బు, మూర్ఛ, కిడ్నీ జబ్బు, క్యాన్సర్, ఇన్సులిన్ చికిత్స అవసరమైన మధుమేహం, రక్తస్రావ సమస్య, లేదా HIV లేదా హెపటైటిస్ బి/సి ఉన్నాయా? |
| `malaria_travel` | Did you travel to a high-risk malaria area in the last 3 months? | क्या पिछले 3 महीनों में आप मलेरिया के ज़्यादा खतरे वाले इलाके में गए थे? | గత 3 నెలల్లో మీరు మలేరియా ప్రమాదం ఎక్కువగా ఉన్న ప్రాంతానికి వెళ్లారా? |

Block messages: `Thank you for answering honestly. You cannot donate right now. {when}` / `ईमानदार जवाब के लिए धन्यवाद। आप अभी रक्तदान नहीं कर सकते। {when}` / `నిజాయితీగా చెప్పినందుకు ధన్యవాదాలు. మీరు ఇప్పుడు రక్తదానం చేయలేరు. {when}` where `{when}` is "You can try again after {date}." (waiting reasons) or "Please ask a doctor." (chronic).

---

## 9. Emails (Supabase Auth templates — Siva pastes these in the dashboard)

**Confirm your email (email change):**
- Subject: `Confirm your email for Blood`
- Body: `Hello,\n\nPlease confirm your email address for your Blood donor profile:\n\n{{ .ConfirmationURL }}\n\nIf you did not ask for this, you can ignore this email. Blood never asks for money or OTP.\n\n— Blood`

Keep emails in English for the MVP (links work in every language).

---

## 10. Default requester message (shown for review before Send)

Built from the request; only the **note** is editable.

- en: `URGENT: {group} blood, {units_text} needed for {patient} at {hospital}, {area}. Needed within {needed_within}. If you can come, please reply YES. Contact: {requester} ({relation}). Sent through Blood. SAFETY`
- hi: `अत्यावश्यक: {patient} के लिए {hospital}, {area} में {group} रक्त की {units_text} चाहिए। {needed_within} में चाहिए। आप आ सकते हैं तो कृपया हाँ में जवाब दीजिए। संपर्क: {requester} ({relation})। Blood के माध्यम से भेजा गया। SAFETY`
- te: `అత్యవసరం: {patient} కోసం {hospital}, {area} లో {group} రక్తం {units_text} కావాలి. {needed_within} లో కావాలి. మీరు రాగలిగితే దయచేసి అవును అని సమాధానం ఇవ్వండి. సంప్రదింపు: {requester} ({relation}). Blood ద్వారా పంపబడింది. SAFETY`
