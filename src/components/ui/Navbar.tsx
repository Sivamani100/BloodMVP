'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { RaktKhojLogo } from './RaktKhojLogo';
import {
  CupertinoMenu,
  CupertinoGlobe,
  CupertinoPersonOutline,
  CupertinoChevronDown,
  CupertinoChevronRight,
  CupertinoXmark,
  CupertinoCheckmark,
  CupertinoHeartFill,
  CupertinoDropFill,
  CupertinoShieldFill,
  CupertinoDocTextFill,
  CupertinoInfoCircleFill,
  CupertinoLockFill,
  CupertinoPersonFill,
} from './CupertinoIcons';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  function switchLocale(nextLocale: Locale) {
    setLangMenuOpen(false);
    setDrawerOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  // If inside certain dedicated mobile full-screen wizard subpaths, hide standard navbar
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  const currentLangLabel =
    locale === 'te' ? 'తెలుగు' : locale === 'hi' ? 'हिन्दी' : 'English';

  return (
    <>
      {/* Floating Apple iOS App Bar - Seamless without harsh bottom borders */}
      <header className="sticky top-0 z-40 bg-[#FAFAFC]/90 backdrop-blur-xl pt-2 pb-2 transition-all">
        {/* Soft pastel ambient blush glow in top-right corner matching reference */}
        <div className="pointer-events-none absolute -top-8 -right-8 w-60 h-60 rounded-full bg-rose-100/50 blur-3xl -z-10" />

        <div className="max-w-lg mx-auto px-4 flex items-center justify-between gap-3">
          {/* Left: Cupertino Menu Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <CupertinoMenu className="w-5 h-5 text-gray-800" />
          </button>

          {/* Center: Cupertino Language Pill Button: "🌐 English ⌄" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-12 px-4.5 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center gap-2 text-[15px] font-semibold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              aria-label="Select App Language"
            >
              <CupertinoGlobe className="w-5 h-5 text-[#FF2D55] shrink-0" />
              <span className="tracking-tight">{currentLangLabel}</span>
              <CupertinoChevronDown
                className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 shrink-0 ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* iOS Style Action Sheet Dropdown */}
            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/15 backdrop-blur-2xs"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    Language / భాష / भाषा
                  </div>
                  {[
                    { code: 'en', label: 'English', sub: 'English' },
                    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
                    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                  ].map((item) => {
                    const isSelected = locale === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => switchLocale(item.code as Locale)}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl text-[15px] font-semibold flex items-center justify-between transition-all my-0.5 cursor-pointer ${
                          isSelected
                            ? 'text-[#FF2D55] bg-rose-50/80 font-black'
                            : 'text-gray-800 hover:bg-gray-100/70'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {item.sub}
                          </span>
                        </div>
                        {isSelected && (
                          <CupertinoCheckmark className="w-4 h-4 text-[#FF2D55]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right: Cupertino Profile Button with Red Notification Dot */}
          <Link
            href="/donor"
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all relative shrink-0 cursor-pointer"
            aria-label="User Profile"
          >
            <CupertinoPersonOutline className="w-5 h-5 text-gray-800" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF2D55] ring-[1.5px] ring-white" />
          </Link>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col p-6 z-50 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <RaktKhojLogo className="w-8 h-8" />
                <span className="font-black text-2xl text-gray-950 tracking-tight">
                  RaktKhoj
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:text-gray-950 active:scale-90 transition-all cursor-pointer"
                aria-label="Close Menu"
              >
                <CupertinoXmark className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-5 space-y-2 grow overflow-y-auto">
              <Link
                href="/need-blood"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-rose-50 hover:text-[#FF2D55] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#FF2D55] flex items-center justify-center border border-rose-100/60 shadow-2xs">
                    <CupertinoDropFill className="w-5 h-5" />
                  </div>
                  <span>Find Blood Now</span>
                </div>
                <CupertinoChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/become-donor"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-rose-50 hover:text-[#FF2D55] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#FF2D55] flex items-center justify-center border border-rose-100/60 shadow-2xs">
                    <CupertinoHeartFill className="w-5 h-5" />
                  </div>
                  <span>Become a Donor</span>
                </div>
                <CupertinoChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/donor"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center border border-gray-200/60 shadow-2xs">
                    <CupertinoPersonFill className="w-5 h-5" />
                  </div>
                  <span>Donor Dashboard</span>
                </div>
                <CupertinoChevronRight className="w-5 h-5 text-gray-400" />
              </Link>

              <div className="pt-3 pb-1">
                <div className="h-px bg-gray-100" />
              </div>

              <Link
                href="/how-it-works"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                    <CupertinoInfoCircleFill className="w-5 h-5" />
                  </div>
                  <span>How It Works</span>
                </div>
                <CupertinoChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                href="/privacy"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                    <CupertinoShieldFill className="w-5 h-5" />
                  </div>
                  <span>Privacy Policy</span>
                </div>
                <CupertinoChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                href="/terms"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center">
                    <CupertinoDocTextFill className="w-5 h-5" />
                  </div>
                  <span>Terms of Service</span>
                </div>
                <CupertinoChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-base font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                    <CupertinoLockFill className="w-5 h-5" />
                  </div>
                  <span>Admin Panel</span>
                </div>
                <CupertinoChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">
                RaktKhoj · Instant Blood Matching System
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
