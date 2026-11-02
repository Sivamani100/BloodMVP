import React from 'react';

export function BloodMVPLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="bloodMvpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="45%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
          <linearGradient id="innerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFE4E6" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFE4E6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle App Icon Base */}
        <rect width="64" height="64" rx="18" fill="url(#bloodMvpGradient)" />
        <rect width="64" height="64" rx="18" fill="url(#innerGlow)" />

        {/* Subtle Outer Ring */}
        <rect x="1" y="1" width="62" height="62" rx="17" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

        {/* Sculpted Blood Droplet with Heart Curve */}
        <path
          d="M32 11C32 11 17 27.5 17 37C17 45.28 23.72 52 32 52C40.28 52 47 45.28 47 37C47 27.5 32 11 32 11Z"
          fill="white"
          fillOpacity="0.18"
        />

        {/* Foreground Solid Droplet */}
        <path
          d="M32 14C32 14 20 28.5 20 37C20 43.63 25.37 49 32 49C38.63 49 44 43.63 44 37C44 28.5 32 14 32 14Z"
          fill="white"
          className="drop-shadow-sm"
        />

        {/* ECG Heartbeat Pulse across the droplet */}
        <path
          d="M23 37.5H27L29.5 32.5L32.5 42L35 34.5L37 37.5H41"
          stroke="#E11D48"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Specular Highlight Sheen */}
        <ellipse
          cx="26"
          cy="26"
          rx="2.5"
          ry="5.5"
          fill="white"
          fillOpacity="0.75"
          transform="rotate(-28 26 26)"
        />
      </svg>
    </div>
  );
}

// Backward compatibility alias
export const RaktKhojLogo = BloodMVPLogo;

