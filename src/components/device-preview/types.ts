/**
 * Device Preview System - Types & Configuration Matrix
 * Flutter-style Device Emulation Engine for Next.js
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type NotchType = 'dynamic_island' | 'notch' | 'punch_hole' | 'none';
export type PlatformOS = 'ios' | 'android' | 'macos' | 'windows';

export interface DevicePreset {
  id: string;
  name: string;
  brand: string;
  type: DeviceType;
  os: PlatformOS;
  width: number;
  height: number;
  dpr: number;
  notchType: NotchType;
  bezelWidth: number; // in px
  cornerRadius: number; // in px
  hasHomeIndicator: boolean;
  hasHardwareButtons: boolean;
  hasSpeakerGrill?: boolean;
  defaultChassisColor?: string;
  description?: string;
}

export interface ChassisColor {
  id: string;
  name: string;
  outerRing: string;
  innerBezel: string;
  buttonColor: string;
  accentText: string;
}

export interface DevicePreviewState {
  deviceId: string;
  isLandscape: boolean;
  scale: number; // 0.3 to 1.5
  isAutoFit: boolean;
  showFrame: boolean;
  showStatusBar: boolean;
  chassisColorId: string;
  currentRoute: string;
  theme: 'light' | 'dark';
}

/**
 * Standard Hardware Presets Matrix
 */
export const DEVICE_PRESETS: DevicePreset[] = [
  // --- Mobile: Apple iOS ---
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    type: 'mobile',
    os: 'ios',
    width: 393,
    height: 852,
    dpr: 3,
    notchType: 'dynamic_island',
    bezelWidth: 10,
    cornerRadius: 52,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    hasSpeakerGrill: true,
    defaultChassisColor: 'titanium-natural',
    description: 'Compact 6.1" OLED, Dynamic Island',
  },
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    type: 'mobile',
    os: 'ios',
    width: 430,
    height: 932,
    dpr: 3,
    notchType: 'dynamic_island',
    bezelWidth: 10,
    cornerRadius: 54,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    hasSpeakerGrill: true,
    defaultChassisColor: 'titanium-black',
    description: 'Large 6.7" OLED, Dynamic Island',
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13 / 14',
    brand: 'Apple',
    type: 'mobile',
    os: 'ios',
    width: 390,
    height: 844,
    dpr: 3,
    notchType: 'notch',
    bezelWidth: 11,
    cornerRadius: 48,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    hasSpeakerGrill: true,
    defaultChassisColor: 'midnight',
    description: 'Classic Ear Notch, 6.1" Retina',
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE (3rd Gen)',
    brand: 'Apple',
    type: 'mobile',
    os: 'ios',
    width: 375,
    height: 667,
    dpr: 2,
    notchType: 'none',
    bezelWidth: 16,
    cornerRadius: 36,
    hasHomeIndicator: false,
    hasHardwareButtons: true,
    hasSpeakerGrill: true,
    defaultChassisColor: 'silver',
    description: '4.7" Classic 16:9 Aspect Ratio',
  },

  // --- Mobile: Android ---
  {
    id: 'samsung-s24',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    type: 'mobile',
    os: 'android',
    width: 412,
    height: 915,
    dpr: 3.5,
    notchType: 'punch_hole',
    bezelWidth: 8,
    cornerRadius: 36,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    defaultChassisColor: 'titanium-black',
    description: '6.8" Flat Edge AMOLED, Infinity-O',
  },
  {
    id: 'google-pixel-8',
    name: 'Google Pixel 8',
    brand: 'Google',
    type: 'mobile',
    os: 'android',
    width: 412,
    height: 892,
    dpr: 2.6,
    notchType: 'punch_hole',
    bezelWidth: 9,
    cornerRadius: 44,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    defaultChassisColor: 'silver',
    description: '6.2" Actua Display, Center Punch-hole',
  },

  // --- Tablets ---
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    brand: 'Apple',
    type: 'tablet',
    os: 'ios',
    width: 834,
    height: 1194,
    dpr: 2,
    notchType: 'none',
    bezelWidth: 14,
    cornerRadius: 32,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    defaultChassisColor: 'space-gray',
    description: 'Liquid Retina XDR, Quad Speakers',
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    brand: 'Apple',
    type: 'tablet',
    os: 'ios',
    width: 744,
    height: 1133,
    dpr: 2,
    notchType: 'none',
    bezelWidth: 14,
    cornerRadius: 28,
    hasHomeIndicator: true,
    hasHardwareButtons: true,
    defaultChassisColor: 'silver',
    description: '8.3" Ultra-portable Tablet',
  },

  // --- Desktops / Laptops ---
  {
    id: 'macbook-air-13',
    name: 'MacBook Air 13"',
    brand: 'Apple',
    type: 'desktop',
    os: 'macos',
    width: 1280,
    height: 832,
    dpr: 2,
    notchType: 'notch',
    bezelWidth: 12,
    cornerRadius: 20,
    hasHomeIndicator: false,
    hasHardwareButtons: false,
    defaultChassisColor: 'silver',
    description: '13.6" Liquid Retina Laptop',
  },
  {
    id: 'desktop-hd',
    name: 'Desktop Viewport (1080p)',
    brand: 'Generic',
    type: 'desktop',
    os: 'windows',
    width: 1440,
    height: 900,
    dpr: 1,
    notchType: 'none',
    bezelWidth: 14,
    cornerRadius: 12,
    hasHomeIndicator: false,
    hasHardwareButtons: false,
    defaultChassisColor: 'space-gray',
    description: 'Standard 16:10 Workstation Display',
  },
];

export const DEFAULT_DEVICE = DEVICE_PRESETS[0];

/**
 * Chassis Color Finish Options
 */
export const CHASSIS_COLORS: Record<string, ChassisColor> = {
  'titanium-natural': {
    id: 'titanium-natural',
    name: 'Natural Titanium',
    outerRing: 'bg-gradient-to-b from-[#8f8b86] via-[#b8b3ad] to-[#7a7672] shadow-2xl',
    innerBezel: 'bg-[#18181b]',
    buttonColor: 'bg-[#9f9b95]',
    accentText: 'text-amber-300',
  },
  'titanium-black': {
    id: 'titanium-black',
    name: 'Black Titanium',
    outerRing: 'bg-gradient-to-b from-[#2d2e33] via-[#43444a] to-[#1c1d21] shadow-2xl',
    innerBezel: 'bg-[#0f0f11]',
    buttonColor: 'bg-[#37383e]',
    accentText: 'text-gray-300',
  },
  'midnight': {
    id: 'midnight',
    name: 'Midnight Navy',
    outerRing: 'bg-gradient-to-b from-[#1a2333] via-[#24334a] to-[#111824] shadow-2xl',
    innerBezel: 'bg-[#090d16]',
    buttonColor: 'bg-[#1e2c40]',
    accentText: 'text-blue-300',
  },
  'silver': {
    id: 'silver',
    name: 'Starlight Silver',
    outerRing: 'bg-gradient-to-b from-[#d4d6db] via-[#f1f3f7] to-[#b0b3ba] shadow-2xl',
    innerBezel: 'bg-[#1e2024]',
    buttonColor: 'bg-[#cbd0d9]',
    accentText: 'text-emerald-300',
  },
  'space-gray': {
    id: 'space-gray',
    name: 'Space Gray',
    outerRing: 'bg-gradient-to-b from-[#3d3f45] via-[#565961] to-[#282a2e] shadow-2xl',
    innerBezel: 'bg-[#121316]',
    buttonColor: 'bg-[#484b52]',
    accentText: 'text-gray-300',
  },
};

/**
 * Standard Zoom Scale Increments
 */
export const SCALE_PRESETS = [0.5, 0.67, 0.75, 0.85, 1.0, 1.25] as const;

/**
 * App Test Routes for quick navigation inside preview iframe
 */
export interface PreviewRoute {
  label: string;
  path: string;
  description: string;
  iconName?: string;
}

export const PREVIEW_ROUTES: PreviewRoute[] = [
  { label: 'Home', path: '/', description: 'Landing & Quick Blood Request' },
  { label: 'Need Blood', path: '/need-blood', description: 'Urgent Request Wizard' },
  { label: 'Become Donor', path: '/become-donor', description: '6-Step Donor Registration' },
  { label: 'Login / OTP', path: '/login', description: 'Authentication & OTP verification' },
  { label: 'Admin Hub', path: '/admin', description: 'Live Request & Donor Dispatch Center' },
  { label: 'How It Works', path: '/how-it-works', description: 'Emergency Pipeline Guide' },
];
