'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { RaktKhojLogo } from './RaktKhojLogo';
import {
  Menu,
  X,
  Heart,
  Droplet,
  User,
  Shield,
  FileText,
  Info,
  ChevronRight,
  ChevronDown,
  Globe,
  Lock,
  Check,
} from 'lucide-react';

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
      {/* Real iOS App Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F2F2F7]/95 backdrop-blur-xl border-b border-black/[0.05]">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: iOS Menu button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-gray-900 active:scale-90 transition-transform"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 text-gray-900" strokeWidth={2.2} />
          </button>

          {/* Center: iOS Language Selection Dropdown: "English ⌄" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-10 px-4 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center gap-1.5 text-xs font-bold text-gray-900 active:scale-95 transition-all"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#E11D48]" strokeWidth={2.2} />
              <span>{currentLangLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={2.5}
              />
            </button>

            {/* iOS Action Sheet / Popover Dropdown */}
            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-black/[0.08] rounded-[24px] shadow-2xl z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Select Language
                  </div>
                  {[
                    { code: 'en', label: 'English', sub: 'Default' },
                    { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
                    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => switchLocale(item.code as Locale)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        locale === item.code
                          ? 'bg-rose-50 text-[#E11D48]'
                          : 'text-gray-800 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="leading-tight">{item.label}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {item.sub}
                        </span>
                      </div>
                      {locale === item.code && (
                        <Check className="w-4 h-4 text-[#E11D48]" strokeWidth={2.8} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: iOS Profile button */}
          <Link
            href="/donor"
            className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-gray-900 active:scale-90 transition-transform relative"
            aria-label="User Profile"
          >
            <User className="w-5 h-5 text-gray-900" strokeWidth={2.2} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#E11D48] border-2 border-white" />
          </Link>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <RaktKhojLogo className="w-7 h-7" />
                <span className="font-extrabold text-xl text-gray-900">RaktKhoj</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-4 space-y-1 grow overflow-y-auto">
              <Link
                href="/need-blood"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-gray-800 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Droplet className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span>Find Blood Now</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/become-donor"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-gray-800 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span>Become a Donor</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                href="/donor"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span>Donor Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              <div className="pt-3 pb-1">
                <div className="h-px bg-gray-100" />
              </div>

              <Link
                href="/how-it-works"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-gray-400" strokeWidth={2.2} />
                  <span>How it works</span>
                </div>
              </Link>

              <Link
                href="/privacy"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" strokeWidth={2.2} />
                  <span>Privacy Policy</span>
                </div>
              </Link>

              <Link
                href="/terms"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" strokeWidth={2.2} />
                  <span>Terms of Service</span>
                </div>
              </Link>

              <Link
                href="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400" strokeWidth={2.2} />
                  <span>Admin Panel</span>
                </div>
              </Link>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                RaktKhoj — Rapid Blood Matching
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
