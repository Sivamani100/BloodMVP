import { describe, it, expect } from 'vitest';
import { RINGS_KM } from '@/lib/constants';
import { getWaveMinutes } from '@/server/engine/rings';
import { checkActivation, REQUIRED_CONSENTS } from '@/lib/donor-rules';

describe('Engine Logic & Expansion', () => {
  describe('Expansion Rings & Wave Timing', () => {
    it('defines standard emergency expansion rings starting from 0.5km up to 100km', () => {
      expect(RINGS_KM[0]).toBe(0.5);
      expect(RINGS_KM[RINGS_KM.length - 1]).toBe(100);
      expect(RINGS_KM).toContain(50);
    });

    it('assigns correct wave minutes based on urgency level', () => {
      // Default in constants: now -> 3m, six_hours -> 8m, 24h -> 20m, planned -> 60m
      expect(getWaveMinutes('now')).toBe(3);
      expect(getWaveMinutes('six_hours')).toBe(8);
      expect(getWaveMinutes('twenty_four_hours')).toBe(20);
      expect(getWaveMinutes('planned')).toBe(60);
    });

    it('uses configured app_settings overrides when provided', () => {
      const customOverrides = {
        now: 5,
        six_hours: 10,
        twenty_four_hours: 20,
        planned: 45,
      };
      expect(getWaveMinutes('now', customOverrides)).toBe(5);
      expect(getWaveMinutes('six_hours', customOverrides)).toBe(10);
    });
  });

  describe('Donor Activation Gate Check', () => {
    const validConsents = [...REQUIRED_CONSENTS];

    it('activates fully qualified donor who satisfies all requirements', () => {
      const res = checkActivation({
        dob: '1995-05-15',
        weight_kg: 68,
        gender: 'male',
        last_donation_date: null,
        email_verified: true,
        phone_verified: true,
        consents: validConsents,
        health_ok: true,
        blood_group: 'O+',
        has_location: true,
      });

      expect(res.isEligible).toBe(true);
      expect(res.missingReasons).toHaveLength(0);
    });

    it('fails activation if weight is below 45kg', () => {
      const res = checkActivation({
        dob: '1995-05-15',
        weight_kg: 42,
        gender: 'female',
        last_donation_date: null,
        email_verified: true,
        phone_verified: true,
        consents: validConsents,
        health_ok: true,
        blood_group: 'B+',
        has_location: true,
      });

      expect(res.isEligible).toBe(false);
      expect(res.missingReasons).toContain('weight_under_45');
    });

    it('fails activation if any mandatory consent is missing', () => {
      const missingConsents = ['contact_calls_whatsapp', 'data_storage'];
      const res = checkActivation({
        dob: '1995-05-15',
        weight_kg: 70,
        gender: 'male',
        last_donation_date: null,
        email_verified: true,
        phone_verified: true,
        consents: missingConsents,
        health_ok: true,
        blood_group: 'A+',
        has_location: true,
      });

      expect(res.isEligible).toBe(false);
      expect(res.missingReasons).toContain('consents_incomplete');
    });

    it('fails activation if health screening is blocked or pending', () => {
      const res = checkActivation({
        dob: '1995-05-15',
        weight_kg: 75,
        gender: 'male',
        last_donation_date: null,
        email_verified: true,
        phone_verified: true,
        consents: validConsents,
        health_ok: false,
        blood_group: 'AB+',
        has_location: true,
      });

      expect(res.isEligible).toBe(false);
      expect(res.missingReasons).toContain('health_check_pending_or_blocked');
    });
  });
});
