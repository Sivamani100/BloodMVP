import { describe, it, expect } from 'vitest';
import {
  handleWAFlowStep,
  parseButtonId,
  buildButtonId,
} from '@/server/assistant/wa-flow';

describe('WhatsApp Conversational Flow', () => {
  const dummyRequest = {
    status: 'searching',
    hospital_name: 'GSL General Hospital',
    hospital_area: 'Rajahmundry',
  };

  const dummyDonor = {
    first_name: 'Suresh',
    gender: 'male' as const,
  };

  it('builds and parses button IDs correctly', () => {
    const btnId = buildButtonId('c123', 'willing', 'yes');
    expect(btnId).toBe('a|c123|willing|yes');

    const parsed = parseButtonId(btnId);
    expect(parsed).toEqual({
      contactId: 'c123',
      step: 'willing',
      value: 'yes',
    });

    expect(parseButtonId('invalid-btn-id')).toBeNull();
  });

  it('declines immediately when donor responds NO to willing', () => {
    const res = handleWAFlowStep({
      contactId: 'c1',
      step: 'willing',
      value: 'no',
      lang: 'en',
      answers: {},
      request: dummyRequest,
      donor: dummyDonor,
    });

    expect(res.finalDecision).toBe('declined');
    expect(res.updatedAnswers?.willing).toBe(false);
  });

  it('advances through health screening questions on YES willing', () => {
    let answers = {};

    // 1. Willing -> Yes
    let res = handleWAFlowStep({
      contactId: 'c1',
      step: 'willing',
      value: 'yes',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('donated_recently');
    expect(res.buttons).toBeDefined();
    answers = res.updatedAnswers!;

    // 2. Donated recently -> No
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'donated_recently',
      value: 'no',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('unwell_today');
    answers = res.updatedAnswers!;

    // 3. Unwell today -> No
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'unwell_today',
      value: 'no',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('recent_procedure');
    answers = res.updatedAnswers!;

    // 4. Recent procedure -> No
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'recent_procedure',
      value: 'no',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('alcohol_24h');
    answers = res.updatedAnswers!;

    // 5. Alcohol 24h -> No
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'alcohol_24h',
      value: 'no',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('eta');
    answers = res.updatedAnswers!;

    // 6. ETA -> 30 mins
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'eta',
      value: '30',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
    });
    expect(res.finalDecision).toBeUndefined();
    expect(res.updatedAnswers?._wa_step).toBe('share_phone');
    expect(res.updatedAnswers?.eta_minutes).toBe(30);
    answers = res.updatedAnswers!;

    // 7. Share phone -> Yes => ACCEPTED!
    res = handleWAFlowStep({
      contactId: 'c1',
      step: 'share_phone',
      value: 'yes',
      lang: 'en',
      answers,
      request: dummyRequest,
      donor: dummyDonor,
      donationCode: '849201',
    });
    expect(res.finalDecision).toBe('accepted');
    expect(res.text).toContain('849201');
    expect(res.text).toContain('GSL General Hospital');
    expect(res.text).toContain('Blood never asks for money');
  });

  it('rejects donor as not_eligible if they had alcohol within 24h', () => {
    const res = handleWAFlowStep({
      contactId: 'c1',
      step: 'alcohol_24h',
      value: 'yes',
      lang: 'en',
      answers: { willing: true, donated_recently: false, unwell_today: false, recent_procedure: false },
      request: dummyRequest,
      donor: dummyDonor,
    });

    expect(res.finalDecision).toBe('not_eligible');
    expect(res.text).toContain('cannot donate this time');
  });

  it('handles standby notification if request already has enough donors', () => {
    const standbyRequest = {
      ...dummyRequest,
      status: 'enough_donors',
    };

    const res = handleWAFlowStep({
      contactId: 'c1',
      step: 'share_phone',
      value: 'yes',
      lang: 'en',
      answers: {
        willing: true,
        donated_recently: false,
        unwell_today: false,
        recent_procedure: false,
        alcohol_24h: false,
        eta_minutes: 45,
      },
      request: standbyRequest,
      donor: dummyDonor,
      donationCode: '998877',
    });

    expect(res.finalDecision).toBe('accepted');
    expect(res.text).toContain('standby');
    expect(res.text).toContain('998877');
  });
});
