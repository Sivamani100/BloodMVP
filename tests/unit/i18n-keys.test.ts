import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import te from '@/messages/te.json';
import hi from '@/messages/hi.json';

function getDeepKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getDeepKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n Translation Key Parity', () => {
  const enKeys = getDeepKeys(en);
  const teKeys = getDeepKeys(te);
  const hiKeys = getDeepKeys(hi);

  it('ensures en.json and te.json have identical key structures', () => {
    expect(teKeys).toEqual(enKeys);
  });

  it('ensures en.json and hi.json have identical key structures', () => {
    expect(hiKeys).toEqual(enKeys);
  });
});
