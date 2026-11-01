import { describe, it, expect } from 'vitest';
import {
  YES_KEYWORDS,
  NO_KEYWORDS,
  STOP_KEYWORDS,
  isStopKeyword,
  normalizeInput,
} from '@/server/assistant/wa-flow';

describe('WhatsApp Keywords & Normalization', () => {
  it('correctly normalizes strings by lowercasing and stripping punctuation', () => {
    expect(normalizeInput('  YES!  ')).toBe('yes');
    expect(normalizeInput('STOP.')).toBe('stop');
  });

  it('detects STOP in English, Telugu, and Hindi', () => {
    expect(isStopKeyword('stop')).toBe(true);
    expect(isStopKeyword('STOP')).toBe(true);
    expect(isStopKeyword('ఆపండి')).toBe(true);
    expect(isStopKeyword('रुकें')).toBe(true);
    expect(isStopKeyword('unsubscribe')).toBe(true);
    expect(isStopKeyword('hello')).toBe(false);
  });

  it('recognizes YES keywords across all three languages', () => {
    expect(YES_KEYWORDS.has('yes')).toBe(true);
    expect(YES_KEYWORDS.has('అవును')).toBe(true);
    expect(YES_KEYWORDS.has('हाँ')).toBe(true);
    expect(YES_KEYWORDS.has('haan')).toBe(true);
  });

  it('recognizes NO keywords across all three languages', () => {
    expect(NO_KEYWORDS.has('no')).toBe(true);
    expect(NO_KEYWORDS.has('కాదు')).toBe(true);
    expect(NO_KEYWORDS.has('नहीं')).toBe(true);
    expect(NO_KEYWORDS.has('nahi')).toBe(true);
  });
});
