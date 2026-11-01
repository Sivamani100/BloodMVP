export interface HealthQuestion {
  key: string;
  en: string;
  hi: string;
  te: string;
  genderFilter?: 'female_or_other';
  waitMonths?: number;
  isPermanentBlock?: boolean;
}

export const HEALTH_QUESTIONS: HealthQuestion[] = [
  {
    key: 'fever_today',
    en: 'Do you have fever, cold, cough or feel unwell today?',
    hi: 'क्या आज आपको बुखार, सर्दी, खाँसी है या तबीयत ठीक नहीं लग रही?',
    te: 'ఈ రోజు మీకు జ్వరం, జలుబు, దగ్గు ఉందా లేదా ఆరోగ్యం బాగోలేదా?',
    waitMonths: 0,
  },
  {
    key: 'recent_illness',
    en: 'In the last 4 weeks, did you have fever, infection, jaundice, malaria, typhoid or dengue?',
    hi: 'क्या पिछले 4 हफ़्तों में आपको बुखार, संक्रमण, पीलिया, मलेरिया, टाइफाइड या डेंगू हुआ?',
    te: 'గత 4 వారాల్లో మీకు జ్వరం, ఇన్ఫెక్షన్, కామెర్లు, మలేరియా, టైఫాయిడ్ లేదా డెంగ్యూ వచ్చిందా?',
    waitMonths: 1,
  },
  {
    key: 'on_antibiotics',
    en: 'Are you taking antibiotics or any strong medicine now?',
    hi: 'क्या आप अभी एंटीबायोटिक या कोई तेज़ दवा ले रहे हैं?',
    te: 'మీరు ఇప్పుడు యాంటీబయాటిక్స్ లేదా ఏదైనా బలమైన మందు వాడుతున్నారా?',
    waitMonths: 0,
  },
  {
    key: 'recent_vaccine',
    en: 'Did you get any vaccine in the last 4 weeks?',
    hi: 'क्या पिछले 4 हफ़्तों में आपने कोई टीका लगवाया?',
    te: 'గత 4 వారాల్లో మీరు ఏదైనా వ్యాక్సిన్ తీసుకున్నారా?',
    waitMonths: 1,
  },
  {
    key: 'recent_surgery',
    en: 'Did you have surgery or major dental work in the last 6 months?',
    hi: 'क्या पिछले 6 महीनों में आपकी सर्जरी या बड़ा दाँतों का इलाज हुआ?',
    te: 'గత 6 నెలల్లో మీకు శస్త్రచికిత్స లేదా పెద్ద దంత చికిత్స జరిగిందా?',
    waitMonths: 6,
  },
  {
    key: 'tattoo_piercing',
    en: 'Did you get a tattoo, piercing or acupuncture in the last 6 months?',
    hi: 'क्या पिछले 6 महीनों में आपने टैटू, पियर्सिंग या एक्यूपंक्चर करवाया?',
    te: 'గత 6 నెలల్లో మీరు టాటూ, పియర్సింగ్ లేదా అక్యుపంక్చర్ చేయించుకున్నారా?',
    waitMonths: 6,
  },
  {
    key: 'pregnant_or_nursing',
    en: 'Are you pregnant or breastfeeding, or did you have a delivery or miscarriage in the last 6 months?',
    hi: 'क्या आप गर्भवती हैं या स्तनपान करा रही हैं, या पिछले 6 महीनों में प्रसव या गर्भपात हुआ?',
    te: 'మీరు గర్భవతా లేదా పాలిస్తున్నారా, లేదా గత 6 నెలల్లో ప్రసవం లేదా గర్భస్రావం జరిగిందా?',
    genderFilter: 'female_or_other',
    waitMonths: 6,
  },
  {
    key: 'alcohol_24h',
    en: 'Did you have alcohol in the last 24 hours?',
    hi: 'क्या पिछले 24 घंटों में आपने शराब पी?',
    te: 'గత 24 గంటల్లో మీరు మద్యం సేవించారా?',
    waitMonths: 0,
  },
  {
    key: 'chronic',
    en: 'Do you have heart disease, epilepsy, kidney disease, cancer, diabetes treated with insulin, a bleeding disorder, or HIV or hepatitis B/C?',
    hi: 'क्या आपको हृदय रोग, मिर्गी, किडनी रोग, कैंसर, इंसुलिन वाला मधुमेह, खून बहने की बीमारी, या एचआईवी या हेपेटाइटिस बी/सी है?',
    te: 'మీకు గుండె జబ్బు, మూర్ఛ, కిడ్నీ జబ్బు, క్యాన్సర్, ఇన్సులిన్ చికిత్స అవసరమైన మధుమేహం, రక్తస్రావ సమస్య, లేదా HIV లేదా హెపటైటిస్ బి/సి ఉన్నాయా?',
    isPermanentBlock: true,
  },
  {
    key: 'malaria_travel',
    en: 'Did you travel to a high-risk malaria area in the last 3 months?',
    hi: 'क्या पिछले 3 महीनों में आप मलेरिया के ज़्यादा खतरे वाले इलाके में गए थे?',
    te: 'గత 3 నెలల్లో మీరు మలేరియా ప్రమాదం ఎక్కువగా ఉన్న ప్రాంతానికి వెళ్లారా?',
    waitMonths: 3,
  },
];

export function evaluateHealthAnswers(
  answers: Record<string, boolean>,
  gender: 'male' | 'female' | 'other'
): { healthOk: boolean; blockingReason: string | null; validUntil: Date } {
  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 6);

  for (const q of HEALTH_QUESTIONS) {
    if (q.genderFilter === 'female_or_other' && gender === 'male') {
      continue;
    }
    if (answers[q.key] === true) {
      return {
        healthOk: false,
        blockingReason: q.key,
        validUntil,
      };
    }
  }

  return {
    healthOk: true,
    blockingReason: null,
    validUntil,
  };
}
