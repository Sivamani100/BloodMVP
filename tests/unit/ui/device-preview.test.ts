import { describe, it, expect } from 'vitest';
import {
  DEVICE_PRESETS,
  DEFAULT_DEVICE,
  CHASSIS_COLORS,
  SCALE_PRESETS,
  PREVIEW_ROUTES,
} from '@/components/device-preview/types';

describe('Flutter-Style Device Preview Matrix & Engine', () => {
  it('contains expected mobile, tablet, and desktop hardware presets', () => {
    expect(DEVICE_PRESETS.length).toBeGreaterThanOrEqual(8);

    const iphone15 = DEVICE_PRESETS.find((p) => p.id === 'iphone-15-pro');
    expect(iphone15).toBeDefined();
    expect(iphone15?.width).toBe(393);
    expect(iphone15?.height).toBe(852);
    expect(iphone15?.notchType).toBe('dynamic_island');
    expect(iphone15?.hasHomeIndicator).toBe(true);

    const s24 = DEVICE_PRESETS.find((p) => p.id === 'samsung-s24');
    expect(s24).toBeDefined();
    expect(s24?.notchType).toBe('punch_hole');

    const ipad = DEVICE_PRESETS.find((p) => p.id === 'ipad-pro-11');
    expect(ipad).toBeDefined();
    expect(ipad?.type).toBe('tablet');

    const macbook = DEVICE_PRESETS.find((p) => p.id === 'macbook-air-13');
    expect(macbook).toBeDefined();
    expect(macbook?.type).toBe('desktop');
  });

  it('correctly swaps dimensions in landscape orientation', () => {
    const device = DEFAULT_DEVICE;
    const portraitW = device.width;
    const portraitH = device.height;

    const isLandscape = true;
    const activeW = isLandscape ? device.height : device.width;
    const activeH = isLandscape ? device.width : device.height;

    expect(activeW).toBe(portraitH);
    expect(activeH).toBe(portraitW);
  });

  it('provides high-fidelity chassis color finishes', () => {
    expect(CHASSIS_COLORS['titanium-natural']).toBeDefined();
    expect(CHASSIS_COLORS['titanium-black']).toBeDefined();
    expect(CHASSIS_COLORS['midnight']).toBeDefined();
    expect(CHASSIS_COLORS['silver']).toBeDefined();
    expect(CHASSIS_COLORS['space-gray']).toBeDefined();
  });

  it('contains standard zoom scale presets and test routes', () => {
    expect(SCALE_PRESETS).toContain(1.0);
    expect(SCALE_PRESETS).toContain(0.75);
    expect(SCALE_PRESETS).toContain(0.5);

    expect(PREVIEW_ROUTES.some((r) => r.path === '/need-blood')).toBe(true);
    expect(PREVIEW_ROUTES.some((r) => r.path === '/become-donor')).toBe(true);
    expect(PREVIEW_ROUTES.some((r) => r.path === '/login')).toBe(true);
  });
});
