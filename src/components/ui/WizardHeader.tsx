'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { CupertinoChevronLeft, CupertinoXmark } from './CupertinoIcons';

interface WizardHeaderProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  progressPercent?: number; // 0 to 100
  showClose?: boolean;
}

export function WizardHeader({
  title,
  onBack,
  onClose,
  progressPercent,
  showClose = true,
}: WizardHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  }

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.04] transition-all">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Back Button: Clean iOS '<' Chevron */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <CupertinoChevronLeft className="w-5 h-5 text-gray-800 -translate-x-0.5" />
        </button>

        {/* Center Title (Step indicator) */}
        <h1 className="font-black text-base sm:text-[17px] text-gray-950 tracking-tight text-center select-none truncate px-2">
          {title}
        </h1>

        {/* Right Action: Simple Clean Close Button */}
        {showClose ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
            aria-label="Close"
          >
            <CupertinoXmark className="w-4 h-4 text-gray-700" />
          </button>
        ) : (
          <div className="w-10 h-10" aria-hidden="true" />
        )}
      </div>

      {/* Smooth Apple Health Progress Track */}
      {progressPercent !== undefined && (
        <div className="w-full bg-gray-100/80 h-[3px] relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#BE123C] h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
