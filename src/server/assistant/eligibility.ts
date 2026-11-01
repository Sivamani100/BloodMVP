import { ContactAnswers } from './script';

export interface EvaluationResult {
  decision: 'accepted' | 'declined' | 'not_eligible' | 'wrong_number' | 'undecided';
  reason?: string;
  eta?: number;
  share?: boolean;
}

export function evaluate(
  answers: ContactAnswers,
  donor?: { gender?: string; languages?: string[] } | null,
  now = new Date()
): EvaluationResult {
  // 1. Identity confirmation check (call flow)
  if (answers.identity_confirmed === false) {
    return { decision: 'wrong_number', reason: 'wrong_number' };
  }

  // 2. Willingness check
  if (answers.willing === false) {
    return { decision: 'declined', reason: 'not_willing' };
  }

  // 3. Donated recently check
  if (answers.donated_recently === true) {
    return { decision: 'not_eligible', reason: 'donated_recently' };
  }

  // 4. Unwell today check
  if (answers.unwell_today === true) {
    return { decision: 'not_eligible', reason: 'unwell_today' };
  }

  // 5. Recent procedure / medication check
  if (answers.recent_procedure === true) {
    return { decision: 'not_eligible', reason: 'recent_procedure' };
  }

  // 6. Alcohol in last 24h check
  if (answers.alcohol_24h === true) {
    return { decision: 'not_eligible', reason: 'alcohol_24h' };
  }

  // 7. Check if required fields are still missing
  // Note: identity_confirmed is required if present or phone flow, but for WhatsApp willing is first.
  if (answers.willing === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.donated_recently === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.unwell_today === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.recent_procedure === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.alcohol_24h === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.eta_minutes === undefined) {
    return { decision: 'undecided' };
  }
  if (answers.share_phone === undefined) {
    return { decision: 'undecided' };
  }

  // 8. All answered and none blocking
  return {
    decision: 'accepted',
    eta: answers.eta_minutes,
    share: answers.share_phone,
  };
}

