import { describe, it, expect } from 'vitest';
import { processIVRStep } from '@/server/assistant/ivr-flow';

describe('IVR State Machine', () => {
  const baseParams = {
    contactId: 'c1',
    lang: 'en' as const,
    request: {
      id: 'r1',
      status: 'searching',
      blood_group: 'O+',
      units_needed: 2,
      hospital_name: 'GGH Hospital',
      hospital_area: 'Rajahmundry',
    },
    donor: {
      id: 'd1',
      first_name: 'Anil',
      gender: 'male' as const,
      opted_out: false,
    },
    contact: {
      id: 'c1',
      status: 'contacting',
      answers: {},
      donation_code: '482197',
    },
    publicAppUrl: 'http://localhost:3000',
  };

  it('generates identity confirmation gather on first answer', () => {
    const res = processIVRStep(baseParams);
    expect(res.twiml).toContain('<Gather');
    expect(res.twiml).toContain('Am I speaking with Anil?');
    expect(res.nextStep).toBe('identity');
    expect(res.hangup).toBe(false);
  });

  it('exits with wrong_number when identity is answered 2', () => {
    const res = processIVRStep({
      ...baseParams,
      stepKey: 'identity',
      digits: '2',
    });
    expect(res.finalDecision).toBe('wrong_number');
    expect(res.twiml).toContain('<Hangup/>');
    expect(res.hangup).toBe(true);
  });

  it('advances to willing when identity is answered 1', () => {
    const res = processIVRStep({
      ...baseParams,
      stepKey: 'identity',
      digits: '1',
    });
    expect(res.nextStep).toBe('willing');
    expect(res.twiml).toContain('Can you help?');
    expect(res.hangup).toBe(false);
  });

  it('immediately exits with not_eligible if alcohol_24h is answered 1 (yes)', () => {
    const res = processIVRStep({
      ...baseParams,
      stepKey: 'alcohol_24h',
      digits: '1',
    });
    expect(res.finalDecision).toBe('not_eligible');
    expect(res.twiml).toContain('You cannot donate this time');
    expect(res.hangup).toBe(true);
  });

  it('completes full accept path with donation code spelled out', () => {
    const res = processIVRStep({
      ...baseParams,
      stepKey: 'share_phone',
      digits: '1',
      contact: {
        ...baseParams.contact,
        answers: {
          identity_confirmed: true,
          willing: true,
          donated_recently: false,
          unwell_today: false,
          recent_procedure: false,
          alcohol_24h: false,
          eta_minutes: 30,
        },
      },
    });

    expect(res.finalDecision).toBe('accepted');
    expect(res.twiml).toContain('4, 8, 2, 1, 9, 7');
    expect(res.twiml).toContain('Blood never asks for money');
    expect(res.hangup).toBe(true);
  });
});

