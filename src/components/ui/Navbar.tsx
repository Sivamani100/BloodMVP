'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Locale } from '@/lib/constants';
import { BloodMVPLogo } from './BloodMVPLogo';
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
  Zap,
  Activity,
  MapPin,
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-rose-100/70 shadow-xs">
        <div className="max-w-[430px] mx-auto px-4 h-15 flex items-center justify-between">
          {/* Logo & Brand: BloodMVP */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <BloodMVPLogo className="w-8 h-8" />
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Blood<span className="text-rose-600">MVP</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200/80 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1" />
                LIVE
              </span>
            </div>
          </Link>

          {/* Right Header Actions: Language + Menu */}
          <div className="flex items-center gap-2">
            {/* Language Pill Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-8 px-2.5 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/60 font-black text-[11px] uppercase tracking-wider text-rose-900 flex items-center gap-1 transition-colors"
                aria-label="Select Language"
              >
                <span>{locale.toUpperCase()}</span>
                <span className="text-[9px] text-rose-500 font-normal">▼</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-rose-100 rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'hi', label: 'हिन्दी' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => switchLocale(item.code as Locale)}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between hover:bg-rose-50 hover:text-rose-600 transition-colors ${
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

            {/* Hamburger Menu Pill Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4 text-slate-700" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Body Container - Native Mobile feel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Top */}
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
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Droplet className="w-4 h-4 text-rose-500" />
                    <span>Home</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/need-blood"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-100 font-bold text-sm text-rose-700 transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 font-semibold text-sm text-slate-800 transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 font-semibold text-sm text-slate-800 transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 font-semibold text-sm text-slate-800 transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 font-semibold text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span>Admin Operations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>100% Free & Anti-Spam Protected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                BloodMVP — Rapid Life-Saving Blood Matching System. Built for Rajahmundry & East Godavari.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
