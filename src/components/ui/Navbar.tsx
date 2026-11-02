'use client';

import React, { useState, useEffect } from 'react';
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
  Lock,
  Globe,
  Check,
} from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic Collapse Behavior on scroll
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 16);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function switchLocale(nextLocale: Locale) {
    setLangMenuOpen(false);
    setDrawerOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  // If inside certain dedicated mobile full-screen wizard subpaths, hide standard navbar
  // so the wizard page's own native header is displayed!
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  return (
    <>
      {/* Floating Top App Bar with Dynamic Collapse Mechanics */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ease-out pt-3 pb-3 px-4 ${
          isScrolled
            ? 'ios-glass hairline-b shadow-2xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-md mx-auto h-11 flex items-center justify-between relative">
          {/* Left Gutter: Resting State Brand Title */}
          <Link
            href="/"
            className="flex items-center gap-2.5 ios-press z-10 select-none group"
          >
            <RaktKhojLogo
              className={`transition-all duration-200 ${
                isScrolled ? 'w-7 h-7 rounded-[8px]' : 'w-8 h-8 rounded-[9px]'
              }`}
            />
            <span
              className={`font-bold tracking-tight text-gray-950 transition-all duration-200 ${
                isScrolled
                  ? 'opacity-0 max-w-0 overflow-hidden text-[17px]'
                  : 'opacity-100 max-w-[200px] text-[24px] sm:text-[26px]'
              }`}
            >
              RaktKhoj
            </span>
          </Link>

          {/* Scrolling State: Centered 17pt Bold Headline */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none select-none text-center ${
              isScrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <span className="ios-headline text-[17px] font-semibold text-gray-950 tracking-tight">
              RaktKhoj
            </span>
          </div>

          {/* Far Right Boundary: Grouped Inline Action Items */}
          <div className="flex items-center gap-2 z-10">
            {/* Language Capsule */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-8 px-2.5 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 font-semibold text-[13px] text-gray-800 flex items-center gap-1.5 ios-press"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" strokeWidth={1.75} />
                <span>{locale.toUpperCase()}</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-[16px] shadow-ios-float z-50 p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                      Language
                    </div>
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'hi', label: 'हिन्दी' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => switchLocale(item.code as Locale)}
                        className={`w-full text-left px-3 py-2 rounded-[10px] text-[15px] font-medium flex items-center justify-between transition-colors ios-press-subtle ${
                          locale === item.code ? 'text-[#007AFF] bg-[#007AFF]/10 font-semibold' : 'text-gray-800 hover:bg-black/[0.04]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {locale === item.code && <Check className="w-4 h-4 text-[#007AFF]" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Menu Circle Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 flex items-center justify-center text-gray-800 ios-press"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4 text-gray-800" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer (iOS Modal Sheet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-[320px] bg-[#F2F2F7] h-full shadow-2xl flex flex-col p-5 z-50 rounded-l-[28px] animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 pt-1 px-1">
              <div className="flex items-center gap-2.5">
                <RaktKhojLogo className="w-8 h-8 rounded-[8px]" />
                <span className="font-bold text-[20px] tracking-tight text-gray-950">RaktKhoj</span>
              </div>
              {/* iOS xmark.circle.fill */}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 flex items-center justify-center text-[#3C3C43] ios-press"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Navigation Group 1: Core Actions (iOS Inset Grouped) */}
            <div className="py-2 space-y-4 grow overflow-y-auto no-scrollbar">
              <div className="bg-white rounded-[14px] border border-black/[0.06] shadow-2xs overflow-hidden divide-y divide-black/[0.05]">
                <Link
                  href="/need-blood"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 text-[16px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[8px] bg-[#FF3B30] text-white flex items-center justify-center shadow-xs">
                      <Droplet className="w-4 h-4 fill-white" strokeWidth={1.75} />
                    </div>
                    <span className="font-medium text-gray-900">Find Blood Now</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                </Link>

                <Link
                  href="/become-donor"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 text-[16px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[8px] bg-[#34C759] text-white flex items-center justify-center shadow-xs">
                      <Heart className="w-4 h-4 fill-white" strokeWidth={1.75} />
                    </div>
                    <span className="font-medium text-gray-900">Become a Donor</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                </Link>

                <Link
                  href="/donor"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 text-[16px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center shadow-xs">
                      <User className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-gray-900">Donor Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                </Link>
              </div>

              {/* Navigation Group 2: Information (iOS Inset Grouped) */}
              <div className="space-y-1">
                <div className="px-3 text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Information
                </div>
                <div className="bg-white rounded-[14px] border border-black/[0.06] shadow-2xs overflow-hidden divide-y divide-black/[0.05]">
                  <Link
                    href="/how-it-works"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-[15px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[6px] bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
                        <Info className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="text-gray-800">How it works</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                  </Link>

                  <Link
                    href="/privacy"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-[15px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[6px] bg-[#8E8E93]/20 text-[#3C3C43] flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="text-gray-800">Privacy Policy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                  </Link>

                  <Link
                    href="/terms"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-[15px] text-gray-900 hover:bg-black/[0.02] ios-press-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[6px] bg-[#8E8E93]/20 text-[#3C3C43] flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="text-gray-800">Terms of Service</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-[15px] text-gray-500 hover:bg-black/[0.02] ios-press-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-[6px] bg-[#8E8E93]/20 text-gray-500 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span>Admin Control Room</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C7C7CC]" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-black/[0.06] text-center">
              <p className="text-[12px] text-[#8E8E93]">
                RaktKhoj — Swift Blood Dispatch
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
