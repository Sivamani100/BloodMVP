'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { BloodMVPLogo } from './BloodMVPLogo';
import {
  Bell,
  X,
  Droplet,
  Heart,
  User,
  Shield,
  Info,
  ChevronRight,
  Lock,
  Zap,
  Wifi,
  Signal,
  BatteryMedium,
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

  // If inside dedicated full-screen wizard subpaths, hide standard navbar
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F2F2F7]/90 backdrop-blur-2xl transition-all">
        {/* Apple Dynamic Island & Status Bar Header (Matching Reference Shot) */}
        <div className="max-w-[420px] mx-auto px-7 pt-3 pb-1 flex items-center justify-between text-xs font-semibold text-slate-900 select-none">
          <span className="font-bold text-[13px] tracking-tight">9:41</span>
          {/* Dynamic Island pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse mr-1.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 text-slate-900">
            <Signal className="w-3.5 h-3.5 fill-current" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Apple Navigation Bar: Avatar, BloodMVP, Bell Notification */}
        <div className="max-w-[420px] mx-auto px-6 h-12 flex items-center justify-between">
          {/* Left: Avatar button (Opens Drawer/Language) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-xs active:scale-95 transition-transform"
            aria-label="Profile Menu"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {/* Center: BloodMVP Brand Title */}
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Blood<span className="text-[#E11D48]">MVP</span>
            </span>
          </Link>

          {/* Right: Notification Bell & Language Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-7 px-2.5 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 font-bold text-[10px] uppercase tracking-wider text-slate-800 flex items-center gap-1 transition-all"
                aria-label="Language"
              >
                <span>{locale.toUpperCase()}</span>
                <span className="text-[7px] text-slate-400">▼</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'hi', label: 'हिन्दी' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => switchLocale(item.code as Locale)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                          locale === item.code ? 'text-rose-600 bg-rose-50/70 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {locale === item.code && <span className="text-rose-600 font-black">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell with indicator */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-black/5 relative active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-800" strokeWidth={2.2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-[#F2F2F7]" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BloodMVPLogo className="w-7 h-7" />
                  <span className="font-extrabold text-lg text-slate-900">
                    Blood<span className="text-rose-600">MVP</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Droplet className="w-4 h-4 text-rose-500" />
                    <span>Home Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/need-blood"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-rose-700 font-bold text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>Emergency Request</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </Link>

                <Link
                  href="/become-donor"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Become a Donor</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Donor Login / Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/how-it-works"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-slate-600" />
                    <span>How BloodMVP Works</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span>Admin Operations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>100% Free Public Pilot</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                BloodMVP &bull; Fast-Response Blood Network for East Godavari.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
