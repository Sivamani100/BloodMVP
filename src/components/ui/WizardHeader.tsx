'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { ChevronLeft, X, Globe, Check } from 'lucide-react';

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
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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

  function switchLocale(nextLocale: Locale) {
    setLangMenuOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="sticky top-0 z-40 ios-glass hairline-b">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* Back Button (iOS Chevron + Label) */}
        <button
          type="button"
          onClick={handleBack}
          className="-ml-2 px-2 h-9 rounded-full flex items-center gap-0.5 text-[#007AFF] hover:bg-[#007AFF]/10 active:opacity-60 transition-all select-none"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-5 h-5 text-[#007AFF] -mr-0.5" strokeWidth={2.5} />
          <span className="text-[17px] font-normal leading-none tracking-[-0.01em]">Back</span>
        </button>

        {/* Center Title (HIG Headline) */}
        <h1 className="font-semibold text-[17px] text-gray-900 tracking-[-0.01em] truncate max-w-[180px] sm:max-w-[220px] text-center select-none">
          {title}
        </h1>

        {/* Right Action Icons: Language Pill & SF Symbol Close */}
        <div className="flex items-center gap-1.5 -mr-1">
          {/* Language Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-7 px-2 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 font-semibold text-[11px] uppercase text-gray-700 flex items-center gap-1 ios-press"
              aria-label="Language"
            >
              <span>{locale.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-[16px] shadow-ios-float z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'hi', label: 'हिन्दी' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => switchLocale(item.code as Locale)}
                      className={`w-full text-left px-3 py-1.5 rounded-[10px] text-[13px] font-medium flex items-center justify-between transition-colors ios-press-subtle ${
                        locale === item.code ? 'text-[#007AFF] bg-[#007AFF]/10 font-semibold' : 'text-gray-800 hover:bg-black/[0.04]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {locale === item.code && <Check className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Close Button (SF Symbol: xmark.circle.fill) */}
          {showClose && (
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 flex items-center justify-center text-[#3C3C43] ios-press"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* Razor-thin iOS Native Progress Track */}
      {typeof progressPercent === 'number' && (
        <div className="w-full h-[2px] bg-black/[0.06] overflow-hidden">
          <div
            className="h-full bg-[#FF3B30] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
