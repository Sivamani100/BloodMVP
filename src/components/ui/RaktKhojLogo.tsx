import React from 'react';

export function RaktKhojLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Soft rounded square with crimson gradient */}
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="url(#logoGrad)" />
        {/* White blood droplet cutout with inner soft red ring */}
        <path
          d="M24 10C24 10 14 22 14 28.5C14 34.02 18.48 38.5 24 38.5C29.52 38.5 34 34.02 34 28.5C34 22 24 10 24 10Z"
          fill="white"
        />
        <path
          d="M24 18C24 18 18 25.5 18 29.5C18 32.81 20.69 35.5 24 35.5C27.31 35.5 30 32.81 30 29.5C30 25.5 24 18 24 18Z"
          fill="#BE123C"
        />
        {/* Highlight sheen */}
        <ellipse cx="21" cy="27" rx="2" ry="3.5" fill="white" fillOpacity="0.4" transform="rotate(-25 21 27)" />
      </svg>
    </div>
  );
}
