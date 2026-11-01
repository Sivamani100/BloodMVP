import { RINGS_KM, GATES_KM, WAVE_MINUTES, UrgencyLevel } from '@/lib/constants';

export function nextRing(currentRingKm: number): number | null {
  const currentIndex = RINGS_KM.indexOf(currentRingKm as any);
  if (currentIndex === -1) {
    return RINGS_KM[0];
  }
  if (currentIndex + 1 < RINGS_KM.length) {
    return RINGS_KM[currentIndex + 1];
  }
  return null;
}

export function isGate(ringKm: number): boolean {
  return GATES_KM.includes(ringKm as any);
}

export function getWaveMinutes(urgency: UrgencyLevel, customOverrides?: Record<string, number>): number {
  if (customOverrides && customOverrides[urgency]) {
    return customOverrides[urgency];
  }
  return WAVE_MINUTES[urgency] || 3;
}
