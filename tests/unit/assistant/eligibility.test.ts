import { describe, it, expect } from 'vitest';
import { evaluate } from '@/server/assistant/eligibility';
import { ContactAnswers } from '@/server/assistant/script';

describe('CON-3 Eligibility Rules Engine', () => {
  const baseAnswers: ContactAnswers = {
    identity_confirmed: true,
    willing: true,
    donated_recently: false,
    unwell_today: false,
    recent_procedure: false,
    alcohol_24h: false,
    eta_minutes: 30,
    share_phone: true,
  };

  it('accepts eligible donor with all clean answers', () => {
    const res = evaluate(baseAnswers);
    expect(res.decision).toBe('accepted');
    expect(res.eta).toBe(30);
    expect(res.share).toBe(true);
  });

  it('flags wrong_number if identity_confirmed is false', () => {
    const res = evaluate({ ...baseAnswers, identity_confirmed: false });
    expect(res.decision).toBe('wrong_number');
    expect(res.reason).toBe('wrong_number');
  });

  it('declines if willing is false', () => {
    const res = evaluate({ ...baseAnswers, willing: false });
    expect(res.decision).toBe('declined');
    expect(res.reason).toBe('not_willing');
  });

  it('rejects if donated_recently is true', () => {
    const res = evaluate({ ...baseAnswers, donated_recently: true });
    expect(res.decision).toBe('not_eligible');
    expect(res.reason).toBe('donated_recently');
  });

  it('rejects if unwell_today is true', () => {
    const res = evaluate({ ...baseAnswers, unwell_today: true });
    expect(res.decision).toBe('not_eligible');
    expect(res.reason).toBe('unwell_today');
  });

  it('rejects if recent_procedure is true', () => {
    const res = evaluate({ ...baseAnswers, recent_procedure: true });
    expect(res.decision).toBe('not_eligible');
    expect(res.reason).toBe('recent_procedure');
  });

  it('rejects if alcohol_24h is true', () => {
    const res = evaluate({ ...baseAnswers, alcohol_24h: true });
    expect(res.decision).toBe('not_eligible');
    expect(res.reason).toBe('alcohol_24h');
  });

  it('returns undecided if any mandatory answer is missing', () => {
    const { eta_minutes, ...partial } = baseAnswers;
    const res = evaluate(partial);
    expect(res.decision).toBe('undecided');
  });
});

