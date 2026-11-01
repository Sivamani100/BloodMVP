import { Locale } from '@/lib/constants';
import { StepKey, ContactAnswers } from './script';
import { evaluate } from './eligibility';

export const YES_KEYWORDS = new Set([
  'yes',
  'y',
  'ok',
  'okay',
  'ya',
  'haan',
  'ha',
  'haa',
  'ji',
  'jee',
  'avunu',
  'avunandi',
  'అవును',
  'హా',
  'हां',
  'हाँ',
  'जी',
]);

export const NO_KEYWORDS = new Set([
  'no',
  'n',
  'nope',
  'nahi',
  'nahin',
  'kaadu',
  'ledu',
  'కాదు',
  'లేదు',
  'नहीं',
  'ना',
]);

export const STOP_KEYWORDS = new Set([
  'stop',
  'unsubscribe',
  'cancel alerts',
  'stop alerts',
  'ఆపండి',
  'ఆపు',
  'रुकें',
  'रुको',
  'बंद',
]);

export function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

export function isStopKeyword(text: string): boolean {
  return STOP_KEYWORDS.has(normalizeInput(text));
}

export function parseButtonId(buttonId: string): {
  contactId: string;
  step: StepKey | 'stop';
  value: string;
} | null {
  const parts = buttonId.split('|');
  if (parts.length < 4 || parts[0] !== 'a') return null;
  return {
    contactId: parts[1],
    step: parts[2] as StepKey | 'stop',
    value: parts[3],
  };
}

export function buildButtonId(contactId: string, step: StepKey | 'stop', value: string): string {
  return `a|${contactId}|${step}|${value}`;
}

export interface WAFlowNextMessage {
  type: 'interactive' | 'text';
  text: string;
  buttons?: Array<{ id: string; title: string }>;
  finalDecision?: 'accepted' | 'declined' | 'not_eligible' | 'opt_out';
  updatedAnswers?: ContactAnswers;
}

export function handleWAFlowStep(params: {
  contactId: string;
  step: StepKey;
  value: string;
  lang: Locale;
  answers: ContactAnswers;
  request: {
    status: string;
    hospital_name: string;
    hospital_area?: string | null;
  };
  donor: {
    first_name: string;
    gender: 'male' | 'female' | 'other';
  };
  donationCode?: string | null;
}): WAFlowNextMessage {
  const { contactId, step, value, lang, answers, request, donor, donationCode } = params;
  const updatedAnswers: ContactAnswers = {
    ...answers,
    _last_inbound_at: new Date().toISOString(),
  };

  const months = donor.gender === 'male' ? 3 : 4;

  if (step === 'willing') {
    if (value === 'no') {
      updatedAnswers.willing = false;
      return {
        type: 'text',
        text: 'Thank you. We will contact you again only if needed.',
        finalDecision: 'declined',
        updatedAnswers,
      };
    }
    updatedAnswers.willing = true;
    updatedAnswers._wa_step = 'donated_recently';
    return {
      type: 'interactive',
      text: `Have you donated blood in the last ${months} months?`,
      buttons: [
        { id: buildButtonId(contactId, 'donated_recently', 'yes'), title: 'Yes' },
        { id: buildButtonId(contactId, 'donated_recently', 'no'), title: 'No' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'donated_recently') {
    updatedAnswers.donated_recently = value === 'yes';
    if (value === 'yes') {
      return {
        type: 'text',
        text: 'Thank you for your honest answers. You cannot donate this time. We appreciate your help.',
        finalDecision: 'not_eligible',
        updatedAnswers,
      };
    }
    updatedAnswers._wa_step = 'unwell_today';
    return {
      type: 'interactive',
      text: 'Do you have fever, cold or any infection today?',
      buttons: [
        { id: buildButtonId(contactId, 'unwell_today', 'yes'), title: 'Yes' },
        { id: buildButtonId(contactId, 'unwell_today', 'no'), title: 'No' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'unwell_today') {
    updatedAnswers.unwell_today = value === 'yes';
    if (value === 'yes') {
      return {
        type: 'text',
        text: 'Thank you for your honest answers. You cannot donate this time. We appreciate your help.',
        finalDecision: 'not_eligible',
        updatedAnswers,
      };
    }
    updatedAnswers._wa_step = 'recent_procedure';
    return {
      type: 'interactive',
      text: 'In the last few weeks, did you have surgery, a vaccine, a tattoo or piercing, or are you taking antibiotics?',
      buttons: [
        { id: buildButtonId(contactId, 'recent_procedure', 'yes'), title: 'Yes' },
        { id: buildButtonId(contactId, 'recent_procedure', 'no'), title: 'No' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'recent_procedure') {
    updatedAnswers.recent_procedure = value === 'yes';
    if (value === 'yes') {
      return {
        type: 'text',
        text: 'Thank you for your honest answers. You cannot donate this time. We appreciate your help.',
        finalDecision: 'not_eligible',
        updatedAnswers,
      };
    }
    updatedAnswers._wa_step = 'alcohol_24h';
    return {
      type: 'interactive',
      text: 'Have you had alcohol in the last 24 hours?',
      buttons: [
        { id: buildButtonId(contactId, 'alcohol_24h', 'yes'), title: 'Yes' },
        { id: buildButtonId(contactId, 'alcohol_24h', 'no'), title: 'No' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'alcohol_24h') {
    updatedAnswers.alcohol_24h = value === 'yes';
    if (value === 'yes') {
      return {
        type: 'text',
        text: 'Thank you for your honest answers. You cannot donate this time. We appreciate your help.',
        finalDecision: 'not_eligible',
        updatedAnswers,
      };
    }
    updatedAnswers._wa_step = 'eta';
    return {
      type: 'interactive',
      text: 'How soon can you reach the hospital?',
      buttons: [
        { id: buildButtonId(contactId, 'eta', '30'), title: 'Within 30 min' },
        { id: buildButtonId(contactId, 'eta', '60'), title: 'About 1 hour' },
        { id: buildButtonId(contactId, 'eta', '90'), title: 'Over 1 hour' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'eta') {
    updatedAnswers.eta_minutes = parseInt(value, 10) || 30;
    updatedAnswers._wa_step = 'share_phone';
    return {
      type: 'interactive',
      text: "May we share your phone number with the patient's family, so they can call you?",
      buttons: [
        { id: buildButtonId(contactId, 'share_phone', 'yes'), title: 'Yes, share' },
        { id: buildButtonId(contactId, 'share_phone', 'no'), title: 'No' },
      ],
      updatedAnswers,
    };
  }

  if (step === 'share_phone') {
    updatedAnswers.share_phone = value === 'yes';
    const evalRes = evaluate(updatedAnswers, donor);
    if (evalRes.decision === 'accepted') {
      const isStandby = request.status === 'enough_donors';
      const code = donationCode || '123456';
      const text = isStandby
        ? `We have enough donors for now, and you are on standby. We will contact you if needed. Your code: ${code}. Blood never asks for money.`
        : `You are confirmed! Your Donation Code is ${code}. Please tell this code at ${request.hospital_name}. The doctor does the final check. Blood never asks for money.`;

      return {
        type: 'text',
        text,
        finalDecision: 'accepted',
        updatedAnswers,
      };
    }
  }

  return {
    type: 'text',
    text: 'Please use the buttons to reply. If you wish to stop alerts, reply STOP.',
    updatedAnswers,
  };
}
