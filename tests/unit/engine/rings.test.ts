import { describe, it, expect } from 'vitest';
import { nextRing, isGate, getWaveMinutes } from '@/server/engine/rings';
import { RINGS_KM, GATES_KM } from '@/lib/constants';

describe('BR-6 Engine Rings and Gates', () => {
  it('correctly follows distance ring order 0.5 to 100 km', () => {
    expect(RINGS_KM).toEqual([0.5, 1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 70, 90, 100]);
    expect(nextRing(0.5)).toBe(1);
    expect(nextRing(50)).toBe(70);
    expect(nextRing(90)).toBe(100);
    expect(nextRing(100)).toBeNull();
  });

  it('identifies 70, 90, and 100 km as gates', () => {
    expect(GATES_KM).toEqual([70, 90, 100]);
    expect(isGate(70)).toBe(true);
    expect(isGate(90)).toBe(true);
    expect(isGate(100)).toBe(true);
    expect(isGate(50)).toBe(false);
    expect(isGate(30)).toBe(false);
  });

  it('returns default wave wait minutes per urgency level', () => {
    expect(getWaveMinutes('now')).toBe(3);
    expect(getWaveMinutes('six_hours')).toBe(8);
    expect(getWaveMinutes('twenty_four_hours')).toBe(20);
    expect(getWaveMinutes('planned')).toBe(60);
  });
});
