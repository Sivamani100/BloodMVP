import { Locale } from '@/lib/constants';
import { getVoiceForLocale } from './voices';
import { renderPrompt, spellDigits, spokenGroup, spokenUnits } from './prompts';
import { StepKey, ContactAnswers } from './script';
import { evaluate } from './eligibility';

export interface IVRStepParams {
  contactId: string;
  stepKey?: StepKey;
  digits?: string;
  lang: Locale;
  attempt?: number;
  request: {
    id: string;
    status: string;
    blood_group: string;
    units_needed: number;
    hospital_name: string;
    hospital_area?: string | null;
  };
  donor: {
    id: string;
    first_name: string;
    gender: 'male' | 'female' | 'other';
    opted_out: boolean;
  };
  contact: {
    id: string;
    status: string;
    answers: ContactAnswers;
    donation_code?: string | null;
  };
  publicAppUrl: string;
}

export interface IVRResult {
  twiml: string;
  updatedAnswers?: ContactAnswers;
  nextStep?: StepKey;
  finalDecision?: 'accepted' | 'declined' | 'not_eligible' | 'wrong_number' | 'cancelled';
  hangup: boolean;
}

export function buildTwimlSay(text: string, lang: Locale): string {
  const v = getVoiceForLocale(lang);
  return `<Say voice="${v.voice}" language="${v.language}">${escapeXml(text)}</Say>`;
}

export function buildTwimlGather(
  promptText: string,
  actionUrl: string,
  lang: Locale,
  numDigits = 1,
  timeout = 6
): string {
  const v = getVoiceForLocale(lang);
  return `<Gather input="dtmf" numDigits="${numDigits}" timeout="${timeout}" action="${escapeXml(actionUrl)}" method="POST">
  <Say voice="${v.voice}" language="${v.language}">${escapeXml(promptText)}</Say>
</Gather>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function processIVRStep(params: IVRStepParams): IVRResult {
  const { contactId, stepKey, digits, lang, attempt = 1, request, donor, contact, publicAppUrl } = params;

  // Guard: if request closed or donor opted out
  if (!['searching', 'waiting_requester', 'enough_donors'].includes(request.status) || donor.opted_out) {
    const text = renderPrompt('end_closed', lang);
    return {
      twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
      finalDecision: 'cancelled',
      hangup: true,
    };
  }

  const answers: ContactAnswers = { ...contact.answers };
  const vars: Record<string, string | number> = {
    app_name: 'Blood',
    first_name: donor.first_name,
    group: spokenGroup(request.blood_group, lang),
    units_text: spokenUnits(request.units_needed, lang),
    hospital: request.hospital_name,
    area: request.hospital_area || '',
    months: donor.gender === 'male' ? 3 : 4,
    code_spelled: spellDigits(contact.donation_code || '123456'),
  };

  const baseUrl = `${publicAppUrl}/api/webhooks/twilio/voice/step?c=${contactId}&l=${lang}`;

  // Initial call answer (no stepKey yet)
  if (!stepKey) {
    const prompt = renderPrompt('identity', lang, vars);
    const gather = buildTwimlGather(prompt, `${baseUrl}&s=identity&try=1`, lang);
    return {
      twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
      updatedAnswers: { ...answers, _call_step: 'identity' },
      nextStep: 'identity',
      hangup: false,
    };
  }

  // Handle current step response
  switch (stepKey) {
    case 'identity': {
      if (digits === '1') {
        answers.identity_confirmed = true;
        const prompt = renderPrompt('willing', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=willing&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'willing' },
          nextStep: 'willing',
          hangup: false,
        };
      } else if (digits === '2') {
        answers.identity_confirmed = false;
        const text = renderPrompt('end_wrong_number', lang, vars);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
          updatedAnswers: answers,
          finalDecision: 'wrong_number',
          hangup: true,
        };
      }
      break;
    }

    case 'willing': {
      if (digits === '1') {
        answers.willing = true;
        const prompt = renderPrompt('donated_recently', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=donated_recently&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'donated_recently' },
          nextStep: 'donated_recently',
          hangup: false,
        };
      } else if (digits === '2') {
        answers.willing = false;
        const text = renderPrompt('end_declined', lang, vars);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
          updatedAnswers: answers,
          finalDecision: 'declined',
          hangup: true,
        };
      }
      break;
    }

    case 'donated_recently': {
      if (digits === '1' || digits === '2') {
        answers.donated_recently = digits === '1';
        if (answers.donated_recently) {
          const text = renderPrompt('end_not_eligible', lang, vars);
          return {
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
            updatedAnswers: answers,
            finalDecision: 'not_eligible',
            hangup: true,
          };
        }
        const prompt = renderPrompt('unwell_today', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=unwell_today&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'unwell_today' },
          nextStep: 'unwell_today',
          hangup: false,
        };
      }
      break;
    }

    case 'unwell_today': {
      if (digits === '1' || digits === '2') {
        answers.unwell_today = digits === '1';
        if (answers.unwell_today) {
          const text = renderPrompt('end_not_eligible', lang, vars);
          return {
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
            updatedAnswers: answers,
            finalDecision: 'not_eligible',
            hangup: true,
          };
        }
        const prompt = renderPrompt('recent_procedure', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=recent_procedure&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'recent_procedure' },
          nextStep: 'recent_procedure',
          hangup: false,
        };
      }
      break;
    }

    case 'recent_procedure': {
      if (digits === '1' || digits === '2') {
        answers.recent_procedure = digits === '1';
        if (answers.recent_procedure) {
          const text = renderPrompt('end_not_eligible', lang, vars);
          return {
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
            updatedAnswers: answers,
            finalDecision: 'not_eligible',
            hangup: true,
          };
        }
        const prompt = renderPrompt('alcohol_24h', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=alcohol_24h&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'alcohol_24h' },
          nextStep: 'alcohol_24h',
          hangup: false,
        };
      }
      break;
    }

    case 'alcohol_24h': {
      if (digits === '1' || digits === '2') {
        answers.alcohol_24h = digits === '1';
        if (answers.alcohol_24h) {
          const text = renderPrompt('end_not_eligible', lang, vars);
          return {
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
            updatedAnswers: answers,
            finalDecision: 'not_eligible',
            hangup: true,
          };
        }
        const prompt = renderPrompt('eta', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=eta&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'eta' },
          nextStep: 'eta',
          hangup: false,
        };
      }
      break;
    }

    case 'eta': {
      if (digits === '1' || digits === '2' || digits === '3') {
        answers.eta_minutes = digits === '1' ? 30 : digits === '2' ? 60 : 90;
        const prompt = renderPrompt('share_phone', lang, vars);
        const gather = buildTwimlGather(prompt, `${baseUrl}&s=share_phone&try=1`, lang);
        return {
          twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
          updatedAnswers: { ...answers, _call_step: 'share_phone' },
          nextStep: 'share_phone',
          hangup: false,
        };
      }
      break;
    }

    case 'share_phone': {
      if (digits === '1' || digits === '2') {
        answers.share_phone = digits === '1';
        const evalRes = evaluate(answers, donor);
        if (evalRes.decision === 'accepted') {
          const isStandby = request.status === 'enough_donors';
          const endKey = isStandby ? 'end_standby' : 'end_accepted';
          const text = renderPrompt(endKey, lang, vars);
          return {
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
            updatedAnswers: answers,
            finalDecision: 'accepted',
            hangup: true,
          };
        }
      }
      break;
    }
  }

  // If no input or invalid input
  if (attempt < 2) {
    const isEta = stepKey === 'eta';
    const retryText = renderPrompt(isEta ? 'retry_123' : 'retry_12', lang);
    const origPrompt = renderPrompt(stepKey, lang, vars);
    const fullPrompt = `${retryText} ${origPrompt}`;
    const gather = buildTwimlGather(fullPrompt, `${baseUrl}&s=${stepKey}&try=2`, lang);
    return {
      twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${gather}</Response>`,
      updatedAnswers: answers,
      nextStep: stepKey,
      hangup: false,
    };
  }

  // Second failure -> end call with no input prompt
  const text = renderPrompt('end_no_input', lang, vars);
  return {
    twiml: `<?xml version="1.0" encoding="UTF-8"?><Response>${buildTwimlSay(text, lang)}<Hangup/></Response>`,
    updatedAnswers: answers,
    hangup: true,
  };
}

