import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Authentic Apple iOS Cupertino / SF Symbols Vector Library
 * Precision-drawn according to Apple Human Interface Guidelines SF Symbols specifications.
 */

// SF Symbol: line.3.horizontal (iOS Menu / Hamburger)
export function CupertinoMenu({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      className={className}
      {...props}
    >
      <line x1="3.5" y1="6" x2="20.5" y2="6" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <line x1="3.5" y1="18" x2="20.5" y2="18" />
    </svg>
  );
}

// SF Symbol: globe (iOS International / Language)
export function CupertinoGlobe({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5a14 14 0 0 0-3.6 9.5 14 14 0 0 0 3.6 9.5 14 14 0 0 0 3.6-9.5A14 14 0 0 0 12 2.5z" />
    </svg>
  );
}

// SF Symbol: person (iOS Profile Avatar Outline)
export function CupertinoPersonOutline({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

// SF Symbol: person.crop.circle.fill (iOS Profile Avatar)
export function CupertinoPersonCircle({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.8a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6zm0 14.4c-2.7 0-5.1-1.32-6.57-3.34.05-2.17 4.38-3.36 6.57-3.36s6.52 1.19 6.57 3.36C17.1 18.88 14.7 20.2 12 20.2z" />
    </svg>
  );
}

// SF Symbol: person.fill
export function CupertinoPersonFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 12c2.4 0 4.2-1.9 4.2-4.3C16.2 5.3 14.4 3.5 12 3.5S7.8 5.3 7.8 7.7c0 2.4 1.8 4.3 4.2 4.3zm0 2.2c-2.9 0-8.8 1.5-8.8 4.4V20.5h17.6v-1.9c0-2.9-5.9-4.4-8.8-4.4z" />
    </svg>
  );
}

// SF Symbol: chevron.down
export function CupertinoChevronDown({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// SF Symbol: chevron.right
export function CupertinoChevronRight({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// SF Symbol: xmark
export function CupertinoXmark({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className={className}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// SF Symbol: xmark.circle.fill
export function CupertinoXmarkCircleFill({ className = 'w-7 h-7', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm3.8 13.8a1 1 0 0 1-1.42 0L12 13.41l-2.38 2.39a1 1 0 1 1-1.42-1.42L10.59 12 8.2 9.62a1 1 0 0 1 1.42-1.42L12 10.59l2.38-2.39a1 1 0 0 1 1.42 1.42L13.41 12l2.39 2.38a1 1 0 0 1 0 1.42z" />
    </svg>
  );
}

// SF Symbol: checkmark
export function CupertinoCheckmark({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M5 13l4.5 4.5L19 7" />
    </svg>
  );
}

// SF Symbol: bolt.fill
export function CupertinoBoltFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M13.2 2L4.5 13.5h7.2l-1.8 8.5 9.6-12h-7.2l2.4-8z" />
    </svg>
  );
}

// SF Symbol: heart.fill (Apple Health Heart)
export function CupertinoHeartFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// SF Symbol: calendar (Apple Calendar with top bindings)
export function CupertinoCalendar({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4.5" width="18" height="17" rx="4" />
      <line x1="16" y1="2" x2="16" y2="6.5" strokeWidth="2.8" />
      <line x1="8" y1="2" x2="8" y2="6.5" strokeWidth="2.8" />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2.2" />
      <circle cx="8" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// SF Symbol: drop.fill (Blood Droplet)
export function CupertinoDropFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

// SF Symbol: rosette (National Award / Ribbon)
export function CupertinoRosette({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="8.5" r="6" />
      <path d="M15.5 13.5 17.5 22l-5.5-3-5.5 3 2-8.5" />
    </svg>
  );
}

// SF Symbol: person.2.fill (Registered Donors)
export function CupertinoPerson2Fill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

// SF Symbol: cross.case.fill / building.2.fill (Blood Centers)
export function CupertinoCrossCaseFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M19 6h-3V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9-2h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z" />
    </svg>
  );
}

// SF Symbol: sparkles
export function CupertinoSparkles({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M9.5 2L8 6.5 3.5 8 8 9.5 9.5 14l1.5-4.5L15.5 8 11 6.5 9.5 2zm8 10l-.9 2.6L14 15.5l2.6.9.9 2.6.9-2.6 2.6-.9-2.6-.9-.9-2.6z" />
    </svg>
  );
}

// SF Symbol: checkmark.shield.fill (Trust & Safety)
export function CupertinoCheckmarkShieldFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2.2 2.2 4.4-4.4" strokeWidth="2.8" />
    </svg>
  );
}

// SF Symbol: shield.fill
export function CupertinoShieldFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

// SF Symbol: doc.text.fill
export function CupertinoDocTextFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

// SF Symbol: info.circle.fill
export function CupertinoInfoCircleFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

// SF Symbol: lock.fill
export function CupertinoLockFill({ className = 'w-6 h-6', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

