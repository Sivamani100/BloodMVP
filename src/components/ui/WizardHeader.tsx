'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { CupertinoXmark } from './CupertinoIcons';

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

  // Parse step number from title (e.g. "Step 1 of 5" -> 1, total 5)
  let currentStep = 1;
  let totalSteps = 5;
  const match = title.match(/Step\s+(\d+)\s+of\s+(\d+)/i);
  if (match) {
    currentStep = parseInt(match[1], 10);
    totalSteps = parseInt(match[2], 10) || 5;
  } else if (progressPercent !== undefined) {
    currentStep = Math.max(1, Math.round(progressPercent / 20));
    totalSteps = 5;
  }

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.04] transition-all">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Back Button: Clean iOS '<' Chevron */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer -ml-1"
          aria-label="Go Back"
        >
          <svg
            className="w-6 h-6 text-gray-900"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center Title (Step indicator) */}
        <h1 className="font-bold text-base text-gray-900 tracking-tight text-center select-none truncate px-2">
          {title}
        </h1>

        {/* Right Action: Clean Close Button */}
        {showClose ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer -mr-1"
            aria-label="Close"
          >
            <CupertinoXmark className="w-5 h-5 text-gray-900" />
          </button>
        ) : (
          <div className="w-10 h-10 -mr-1" aria-hidden="true" />
        )}
      </div>

      {/* Prominent Segmented Step Progress Bar - Solid Red (h-2 / 8px rounded pills) */}
      <div className="max-w-md mx-auto px-5 pb-3.5 pt-1 flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
          const isActive = s <= currentStep;
          return (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                isActive ? 'bg-[#E11D48]' : 'bg-gray-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
