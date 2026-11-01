'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { ArrowLeft, X } from 'lucide-react';

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
    <div className="sticky top-0 z-40 bg-white">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" strokeWidth={2.2} />
        </button>

        {/* Center Title */}
        <h1 className="font-bold text-lg text-gray-950 tracking-tight select-none">
          {title}
        </h1>

        {/* Right Action Icons: Language Pill & Close */}
        <div className="flex items-center gap-2">
          {/* Language Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white font-bold text-xs uppercase text-gray-800 hover:bg-gray-50 flex items-center transition-colors"
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
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'hi', label: 'हिन्दी' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => switchLocale(item.code as Locale)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-rose-50 ${
                        locale === item.code ? 'text-rose-600 bg-rose-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {locale === item.code && <span className="text-rose-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Close Button */}
          {showClose && (
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-800" strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* Thin Progress Bar below header if progressPercent is provided */}
      {progressPercent !== undefined && (
        <div className="w-full bg-gray-100 h-[3px] relative overflow-hidden">
          <div
            className="bg-red-500 h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

