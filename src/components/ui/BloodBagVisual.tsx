import React from 'react';

export function BloodBagVisual({ className = 'w-44 h-64' }: { className?: string }) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 240 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Metallic hook gradient */}
          <linearGradient id="metalHook" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Translucent plastic bag gradient */}
          <linearGradient id="bagOutline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.6" />
          </linearGradient>

          {/* Liquid blood gradient */}
          <radialGradient id="bloodFluid" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="60%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>

          {/* Fluid highlight */}
          <linearGradient id="fluidSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="30%" stopColor="white" stopOpacity="0" />
            <stop offset="85%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Top Hanging Silver Rod & Clip */}
        <path d="M120 0 L120 42" stroke="url(#metalHook)" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="120" cy="42" rx="7" ry="5" fill="url(#metalHook)" />
        <path d="M114 42 C114 36 126 36 126 42 L126 55 C126 58 114 58 114 55 Z" fill="#CBD5E1" />

        {/* Bag Plastic Outer Border & Eyelet */}
        <path
          d="M60 60 Q120 54 180 60 Q192 70 190 110 L188 240 Q186 280 160 286 L80 286 Q54 280 52 240 L50 110 Q48 70 60 60 Z"
          fill="rgba(255, 255, 255, 0.15)"
          stroke="url(#bagOutline)"
          strokeWidth="3.5"
        />

        {/* Hanging eyelet hole */}
        <ellipse cx="120" cy="67" rx="8" ry="4.5" fill="none" stroke="white" strokeWidth="2.5" />

        {/* Liquid Blood Inside Bag */}
        <path
          d="M58 84 Q120 80 182 84 Q186 120 184 235 Q182 278 156 282 L84 282 Q58 278 56 235 L54 120 Q56 86 58 84 Z"
          fill="url(#bloodFluid)"
        />

        {/* Inner Liquid Meniscus Curve at Top */}
        <path
          d="M58 84 C80 88, 160 88, 182 84 C175 92, 65 92, 58 84 Z"
          fill="#F43F5E"
          opacity="0.8"
        />

        {/* Glass reflection / Sheen on left & right edge */}
        <path
          d="M58 84 Q120 80 182 84 Q186 120 184 235 Q182 278 156 282 L84 282 Q58 278 56 235 L54 120 Q56 86 58 84 Z"
          fill="url(#fluidSheen)"
        />

        {/* White Prescription / Lab Label */}
        <g transform="translate(74, 115)">
          {/* Label Card */}
          <rect
            width="92"
            height="86"
            rx="6"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
          />

          {/* Red blood droplet on label */}
          <path
            d="M24 14 C24 14 17 22 17 26.5 C17 30.5 20.1 33.5 24 33.5 C27.9 33.5 31 30.5 31 26.5 C31 22 24 14 24 14 Z"
            fill="#DC2626"
          />

          {/* Form lines */}
          <line x1="38" y1="20" x2="80" y2="20" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="28" x2="74" y2="28" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="44" x2="78" y2="44" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="52" x2="68" y2="52" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

          {/* Barcode */}
          <g transform="translate(18, 62)">
            <rect x="0" y="0" width="2" height="13" fill="#334155" />
            <rect x="4" y="0" width="1.5" height="13" fill="#334155" />
            <rect x="7" y="0" width="3" height="13" fill="#334155" />
            <rect x="12" y="0" width="1" height="13" fill="#334155" />
            <rect x="15" y="0" width="2.5" height="13" fill="#334155" />
            <rect x="20" y="0" width="1.5" height="13" fill="#334155" />
            <rect x="24" y="0" width="4" height="13" fill="#334155" />
            <rect x="30" y="0" width="1.5" height="13" fill="#334155" />
            <rect x="33" y="0" width="2.5" height="13" fill="#334155" />
            <rect x="38" y="0" width="1" height="13" fill="#334155" />
            <rect x="42" y="0" width="3" height="13" fill="#334155" />
            <rect x="48" y="0" width="2" height="13" fill="#334155" />
            <rect x="52" y="0" width="3.5" height="13" fill="#334155" />
          </g>
        </g>

        {/* Bottom Dual Ports */}
        {/* Left Port */}
        <rect x="94" y="284" width="14" height="22" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="91" y="303" width="20" height="6" rx="2" fill="#E2E8F0" />

        {/* Right Port with Red Tube Connection */}
        <rect x="132" y="284" width="14" height="22" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="129" y="303" width="20" height="6" rx="2" fill="#E2E8F0" />

        {/* Curving Infusion Tubing with Blood Running Through It */}
        <path
          d="M139 308 C 142 340, 175 345, 185 380 C 190 400, 170 420, 160 450"
          stroke="#991B1B"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        {/* Highlight inside tube */}
        <path
          d="M139 308 C 142 340, 175 345, 185 380 C 190 400, 170 420, 160 450"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

