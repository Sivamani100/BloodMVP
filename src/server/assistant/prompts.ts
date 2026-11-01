import { Locale } from '@/lib/constants';

export const SPOKEN_GROUPS: Record<Locale, Record<string, string>> = {
  en: {
    'A+': 'A positive',
    'A-': 'A negative',
    'B+': 'B positive',
    'B-': 'B negative',
    'O+': 'O positive',
    'O-': 'O negative',
    'AB+': 'A B positive',
    'AB-': 'A B negative',
  },
  hi: {
    'A+': 'ए पॉज़िटिव',
    'A-': 'ए निगेटिव',
    'B+': 'बी पॉज़िटिव',
    'B-': 'बी निगेटिव',
    'O+': 'ओ पॉज़िटिव',
    'O-': 'ओ निगेटिव',
    'AB+': 'ए बी पॉज़िटिव',
    'AB-': 'ए बी निगेटिव',
  },
  te: {
    'A+': 'ఏ పాజిటివ్',
    'A-': 'ఏ నెగటివ్',
    'B+': 'బీ పాజిటివ్',
    'B-': 'బీ నెగటివ్',
    'O+': 'ఓ పాజిటివ్',
    'O-': 'ఓ నెగటివ్',
    'AB+': 'ఏ బీ పాజిటివ్',
    'AB-': 'ఏ బీ నెగటివ్',
  },
};

export function spokenGroup(group: string, lang: Locale = 'en'): string {
  return SPOKEN_GROUPS[lang]?.[group] || group;
}

export function spokenUnits(units: number, lang: Locale = 'en'): string {
  if (lang === 'te') {
    return units === 1 ? '1 యూనిట్' : `${units} యూనిట్లు`;
  }
  if (lang === 'hi') {
    return `${units} यूनिट`;
  }
  return units === 1 ? '1 unit' : `${units} units`;
}

export function spellDigits(code: string): string {
  if (!code) return '';
  return code.split('').join(', ');
}

export const IVR_PROMPTS: Record<Locale, Record<string, string>> = {
  en: {
    identity:
      'Hello. This is Blood, an automated assistant for urgent blood requests. Am I speaking with {first_name}? Press 1 for yes. Press 2 for no.',
    willing:
      'A patient urgently needs {group} blood, {units_text}, at {hospital}, {area}. Can you help? Press 1 for yes. Press 2 for no.',
    donated_recently:
      'Have you donated blood in the last {months} months? Press 1 for yes. Press 2 for no.',
    unwell_today:
      'Do you have fever, cold or any infection today? Press 1 for yes. Press 2 for no.',
    recent_procedure:
      'In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you taking antibiotics? Press 1 for yes. Press 2 for no.',
    alcohol_24h:
      'Have you had alcohol in the last 24 hours? Press 1 for yes. Press 2 for no.',
    eta:
      'Can you reach the hospital within 30 minutes? Press 1 for within 30 minutes. Press 2 for about one hour. Press 3 for more than one hour.',
    share_phone:
      "May we share your phone number with the patient's family, so they can call you? Press 1 for yes. Press 2 for no.",
    retry_12: 'Sorry, I did not get that. Please press 1 or 2.',
    retry_123: 'Sorry, I did not get that. Please press 1, 2 or 3.',
    end_accepted:
      'Thank you, {first_name}. Your donation code is {code_spelled}. Please tell this code at the hospital. We have sent the details on WhatsApp. The final health check is done by the doctor. Blood never asks for money. Goodbye.',
    end_standby:
      'Thank you, {first_name}. We have enough donors for now, and you are on standby. We will contact you if needed. Your code is {code_spelled}. Blood never asks for money. Goodbye.',
    end_declined:
      'Thank you for your time. We will contact you again only if needed. Goodbye.',
    end_not_eligible:
      'Thank you for your honest answers. You cannot donate this time. We appreciate your help. Goodbye.',
    end_wrong_number:
      'Sorry for the disturbance. We called the wrong person. Goodbye.',
    end_no_input:
      'We could not hear a reply. We have sent a WhatsApp message. Please reply there. Thank you. Goodbye.',
    end_closed:
      'This request has already been fulfilled. Thank you for being ready to help. Goodbye.',
    end_cap:
      'We already have enough donors. Thank you so much for being ready. Goodbye.',
  },
  hi: {
    identity:
      'नमस्ते। मैं Blood का ऑटोमेटेड असिस्टेंट हूँ, अत्यावश्यक रक्त अनुरोधों के लिए। क्या {first_name} जी से बात हो रही है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    willing:
      'एक मरीज़ को {hospital}, {area} में तुरंत {group} रक्त की {units_text} ज़रूरत है। क्या आप मदद कर सकते हैं? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    donated_recently:
      'क्या आपने पिछले {months} महीनों में रक्तदान किया है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    unwell_today:
      'क्या आज आपको बुखार, सर्दी-ज़ुकाम या कोई संक्रमण है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    recent_procedure:
      'क्या पिछले कुछ हफ़्तों में आपकी सर्जरी हुई है, टीका लगा है, टैटू या पियर्सिंग करवाई है, या आप एंटीबायोटिक ले रहे हैं? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    alcohol_24h:
      'क्या आपने पिछले 24 घंटों में शराब पी है? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    eta:
      'क्या आप 30 मिनट में अस्पताल पहुँच सकते हैं? 30 मिनट के अंदर के लिए 1 दबाइए। लगभग एक घंटे के लिए 2 दबाइए। एक घंटे से ज़्यादा के लिए 3 दबाइए।',
    share_phone:
      'क्या हम आपका फ़ोन नंबर मरीज़ के परिवार को दे सकते हैं, ताकि वे आपको फ़ोन कर सकें? हाँ के लिए 1 दबाइए। नहीं के लिए 2 दबाइए।',
    retry_12: 'माफ़ कीजिए, जवाब समझ नहीं आया। कृपया 1 या 2 दबाइए।',
    retry_123: 'माफ़ कीजिए, जवाब समझ नहीं आया। कृपया 1, 2 या 3 दबाइए।',
    end_accepted:
      'धन्यवाद {first_name} जी। आपका डोनेशन कोड है {code_spelled}। कृपया अस्पताल में यह कोड बताइए। विवरण हमने व्हाट्सऐप पर भेज दिया है। अंतिम स्वास्थ्य जाँच डॉक्टर करेंगे। Blood कभी पैसे नहीं माँगता। नमस्ते।',
    end_standby:
      'धन्यवाद {first_name} जी। अभी हमारे पास पर्याप्त डोनर हैं, और आप स्टैंडबाय पर हैं। ज़रूरत पड़ने पर हम आपसे संपर्क करेंगे। आपका कोड है {code_spelled}। Blood कभी पैसे नहीं माँगता। नमस्ते।',
    end_declined:
      'आपके समय के लिए धन्यवाद। ज़रूरत होने पर ही हम दोबारा संपर्क करेंगे। नमस्ते।',
    end_not_eligible:
      'आपके ईमानदार जवाबों के लिए धन्यवाद। इस बार आप रक्तदान नहीं कर सकते। आपकी मदद के लिए आभार। नमस्ते।',
    end_wrong_number:
      'परेशानी के लिए क्षमा कीजिए। गलती से आपको फ़ोन लग गया। नमस्ते।',
    end_no_input:
      'हमें कोई जवाब सुनाई नहीं दिया। हमने व्हाट्सऐप पर संदेश भेजा है, कृपया वहाँ जवाब दीजिए। धन्यवाद। नमस्ते।',
    end_closed:
      'यह अनुरोध पहले ही पूरा हो चुका है। मदद के लिए तैयार रहने के लिए धन्यवाद। नमस्ते।',
    end_cap:
      'हमारे पास पहले से पर्याप्त डोनर हैं। तैयार रहने के लिए बहुत धन्यवाद। नमस्ते।',
  },
  te: {
    identity:
      'నమస్కారం. నేను Blood ఆటోమేటెడ్ అసిస్టెంట్‌ని, అత్యవసర రక్త అభ్యర్థనల కోసం. {first_name} గారితో మాట్లాడుతున్నానా? అవును అయితే 1 నొక్కండి. కాదు అయితే 2 నొక్కండి.',
    willing:
      '{hospital}, {area} లో ఒక రోగికి అత్యవసరంగా {group} రక్తం {units_text} కావాలి. మీరు సహాయం చేయగలరా? అవును అయితే 1 నొక్కండి. కాదు అయితే 2 నొక్కండి.',
    donated_recently:
      'గత {months} నెలల్లో మీరు రక్తదానం చేశారా? చేశాను అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి.',
    unwell_today:
      'ఈ రోజు మీకు జ్వరం, జలుబు లేదా ఏదైనా ఇన్ఫెక్షన్ ఉందా? ఉంది అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి.',
    recent_procedure:
      'గత కొన్ని వారాల్లో మీకు శస్త్రచికిత్స, వ్యాక్సిన్, టాటూ లేదా పియర్సింగ్ జరిగిందా, లేదా యాంటీబయాటిక్స్ వాడుతున్నారా? అవును అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి.',
    alcohol_24h:
      'గత 24 గంటల్లో మీరు మద్యం సేవించారా? అవును అయితే 1 నొక్కండి. లేదు అయితే 2 నొక్కండి.',
    eta:
      'మీరు 30 నిమిషాల్లో ఆసుపత్రికి చేరుకోగలరా? 30 నిమిషాల్లో అయితే 1 నొక్కండి. సుమారు ఒక గంటలో అయితే 2 నొక్కండి. ఒక గంట కంటే ఎక్కువ సమయం పడితే 3 నొక్కండి.',
    share_phone:
      'రోగి కుటుంబం మీకు ఫోన్ చేయడానికి, మీ ఫోన్ నంబర్‌ను వారితో పంచుకోవచ్చా? అవును అయితే 1 నొక్కండి. వద్దు అయితే 2 నొక్కండి.',
    retry_12: 'క్షమించండి, అర్థం కాలేదు. దయచేసి 1 లేదా 2 నొక్కండి.',
    retry_123: 'క్షమించండి, అర్థం కాలేదు. దయచేసి 1, 2 లేదా 3 నొక్కండి.',
    end_accepted:
      'ధన్యవాదాలు {first_name} గారు. మీ డొనేషన్ కోడ్ {code_spelled}. ఆసుపత్రిలో ఈ కోడ్ చెప్పండి. వివరాలు వాట్సాప్‌లో పంపాము. చివరి ఆరోగ్య పరీక్ష డాక్టర్ చేస్తారు. Blood ఎప్పుడూ డబ్బు అడగదు. నమస్కారం.',
    end_standby:
      'ధన్యవాదాలు {first_name} గారు. ప్రస్తుతం మాకు తగినంత దాతలు ఉన్నారు, మీరు స్టాండ్‌బైలో ఉన్నారు. అవసరమైతే మిమ్మల్ని సంప్రదిస్తాము. మీ కోడ్ {code_spelled}. Blood ఎప్పుడూ డబ్బు అడగదు. నమస్కారం.',
    end_declined:
      'మీ సమయానికి ధన్యవాదాలు. అవసరమైనప్పుడే మళ్లీ సంప్రదిస్తాము. నమస్కారం.',
    end_not_eligible:
      'మీ నిజాయితీ సమాధానాలకు ధన్యవాదాలు. ఈసారి మీరు రక్తదానం చేయలేరు. మీ సహాయానికి కృతజ్ఞతలు. నమస్కారం.',
    end_wrong_number:
      'ఇబ్బందికి క్షమించండి. పొరపాటున మీకు కాల్ వచ్చింది. నమస్కారం.',
    end_no_input:
      'మాకు ఏ సమాధానం వినిపించలేదు. వాట్సాప్‌లో సందేశం పంపాము, దయచేసి అక్కడ సమాధానం ఇవ్వండి. ధన్యవాదాలు. నమస్కారం.',
    end_closed:
      'ఈ అభ్యర్థన ఇప్పటికే పూర్తయింది. సహాయం చేయడానికి సిద్ధంగా ఉన్నందుకు ధన్యవాదాలు. నమస్కారం.',
    end_cap:
      'మాకు ఇప్పటికే తగినంత దాతలు ఉన్నారు. సిద్ధంగా ఉన్నందుకు చాలా ధన్యవాదాలు. నమస్కారం.',
  },
};

export function renderPrompt(
  key: string,
  lang: Locale = 'en',
  vars: Record<string, string | number> = {}
): string {
  let text = IVR_PROMPTS[lang]?.[key] || IVR_PROMPTS.en[key] || '';
  for (const [varName, varVal] of Object.entries(vars)) {
    text = text.replaceAll(`{${varName}}`, String(varVal));
  }
  return text;
}

