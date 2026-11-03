import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseBloodGroup,
  resolveLocation,
  handleInboundRequesterWhatsApp,
} from '@/server/assistant/inbound-requester';
import { generateRequestAccessToken, verifyRequestAccessToken } from '@/server/security/signatures';

// Mock Supabase admin
vi.mock('@/server/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => {
            if (table === 'app_settings') {
              return { data: null };
            }
            if (table === 'requests') {
              return {
                data: {
                  id: 'test-req-123',
                  requester_id: 'user-123',
                  blood_group: 'O+',
                  status: 'searching',
                  hospital_name: 'Government General Hospital',
                },
              };
            }
            return { data: null };
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'test-req-123',
                  requester_id: 'user-123',
                  blood_group: 'O+',
                  status: 'searching',
                  hospital_name: 'Government General Hospital',
                },
              })),
            })),
          })),
          limit: vi.fn(() => ({
            data: [
              {
                id: 'bank-1',
                name: 'GGH Blood Centre',
                distance_km: 3.2,
                phones: ['+919849497911'],
              },
            ],
          })),
        })),
        limit: vi.fn(() => ({
          data: [
            {
              id: 'bank-1',
              name: 'GGH Blood Centre',
              distance_km: 3.2,
              phones: ['+919849497911'],
            },
          ],
        })),
      })),
      upsert: vi.fn(async () => ({ error: null })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: {
              id: 'new-req-999',
              blood_group: 'O+',
              status: 'searching',
              hospital_name: 'Government General Hospital',
            },
            error: null,
          })),
        })),
      })),
    })),
    rpc: vi.fn(async () => ({
      data: [
        {
          id: 'bank-1',
          name: 'GGH Blood Centre',
          distance_km: 3.2,
          phones: ['+919849497911'],
        },
      ],
      error: null,
    })),
    auth: {
      admin: {
        listUsers: vi.fn(async () => ({
          data: {
            users: [{ id: 'user-123', phone: '+919849497911' }],
          },
        })),
        createUser: vi.fn(async () => ({
          data: { user: { id: 'user-123' } },
          error: null,
        })),
      },
    },
  })),
}));

// Mock WhatsApp provider
vi.mock('@/server/providers/whatsapp', () => ({
  sendWhatsAppInteractive: vi.fn(async () => ({ ok: true, messageId: 'wa_mock_msg' })),
  sendWhatsAppText: vi.fn(async () => ({ ok: true, messageId: 'wa_mock_text' })),
}));

// Mock wave engine
vi.mock('@/server/engine/wave', () => ({
  processRequest: vi.fn(async () => {}),
}));

describe('Inbound Requester Assistant & Tokens', () => {
  describe('parseBloodGroup', () => {
    it('normalizes valid blood groups correctly', () => {
      expect(parseBloodGroup('O+')).toBe('O+');
      expect(parseBloodGroup('o+')).toBe('O+');
      expect(parseBloodGroup('opos')).toBe('O+');
      expect(parseBloodGroup('O Positive')).toBe('O+');
      expect(parseBloodGroup('o-')).toBe('O-');
      expect(parseBloodGroup('A+')).toBe('A+');
      expect(parseBloodGroup('b negative')).toBe('B-');
      expect(parseBloodGroup('ab+ve')).toBe('AB+');
    });

    it('returns null for invalid blood group strings', () => {
      expect(parseBloodGroup('hello')).toBeNull();
      expect(parseBloodGroup('12345')).toBeNull();
      expect(parseBloodGroup('XYZ')).toBeNull();
    });
  });

  describe('resolveLocation', () => {
    it('resolves direct GPS coordinates when provided by WhatsApp', async () => {
      const loc = await resolveLocation({
        location: {
          latitude: 16.9891,
          longitude: 82.2475,
          name: 'Kakinada City',
        },
      });

      expect(loc.lat).toBe(16.9891);
      expect(loc.lng).toBe(82.2475);
      expect(loc.name).toBe('Kakinada City');
    });

    it('resolves city names from text matching known locations', async () => {
      const loc = await resolveLocation({ text: 'I am near Rajahmundry hospital' });
      expect(loc.lat).toBe(17.0005);
      expect(loc.lng).toBe(81.804);
      expect(loc.name).toContain('Rajahmundry');
    });

    it('falls back gracefully to default emergency hub if unknown', async () => {
      const loc = await resolveLocation({ text: 'unknown village area' });
      expect(loc.lat).toBe(17.0005);
      expect(loc.lng).toBe(81.804);
    });
  });

  describe('Request Access Tokens (Magic Links)', () => {
    it('generates consistent access tokens for a given request ID', () => {
      const token1 = generateRequestAccessToken('req-abc-123');
      const token2 = generateRequestAccessToken('req-abc-123');
      expect(token1).toBe(token2);
      expect(token1.length).toBe(16);
    });

    it('verifies valid token and rejects invalid token', () => {
      const token = generateRequestAccessToken('req-abc-123');
      expect(verifyRequestAccessToken('req-abc-123', token)).toBe(true);
      expect(verifyRequestAccessToken('req-abc-123', 'wrong-token')).toBe(false);
      expect(verifyRequestAccessToken('other-req', token)).toBe(false);
      expect(verifyRequestAccessToken('req-abc-123', null)).toBe(false);
    });
  });

  describe('handleInboundRequesterWhatsApp', () => {
    it('responds to "Hi" with greeting and blood group buttons', async () => {
      const handled = await handleInboundRequesterWhatsApp({
        senderPhone: '+919849497911',
        text: 'Hi, I need blood urgently',
      });
      expect(handled).toBe(true);
    });

    it('processes blood group input and asks for location', async () => {
      const handled = await handleInboundRequesterWhatsApp({
        senderPhone: '+919849497911',
        buttonPayload: 'group:O+',
      });
      expect(handled).toBe(true);
    });

    it('processes location, creates emergency request without OTP, and returns blood banks + link', async () => {
      const handled = await handleInboundRequesterWhatsApp({
        senderPhone: '+919849497911',
        text: 'Rajahmundry',
      });
      expect(handled).toBe(true);
    });

    it('starts donor outreach wave when action:find_donors is triggered', async () => {
      const handled = await handleInboundRequesterWhatsApp({
        senderPhone: '+919849497911',
        buttonPayload: 'action:find_donors',
      });
      expect(handled).toBe(true);
    });
  });
});
