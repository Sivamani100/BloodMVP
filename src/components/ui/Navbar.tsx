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
  Lock,
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <RaktKhojLogo className="w-9 h-9" />
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              RaktKhoj
            </span>
          </Link>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language Pill Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="h-9 px-3.5 rounded-xl border border-gray-200 bg-white font-bold text-xs uppercase tracking-wider text-gray-800 hover:bg-gray-50 flex items-center gap-1 transition-colors"
                aria-label="Select Language"
              >
                <span>{locale.toUpperCase()}</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'hi', label: 'हिन्दी' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => switchLocale(item.code as Locale)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                          locale === item.code ? 'text-rose-600 bg-rose-50/50' : 'text-gray-700'
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
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
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
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800"
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
                    <Droplet className="w-4 h-4" />
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
                    <Heart className="w-4 h-4" />
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
                    <User className="w-4 h-4" />
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
                  <Info className="w-4 h-4 text-gray-400" />
                  <span>How it works</span>
                </div>
              </Link>

              <Link
                href="/privacy"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Privacy Policy</span>
                </div>
              </Link>

              <Link
                href="/terms"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Terms of Service</span>
                </div>
              </Link>

              <Link
                href="/admin"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400" />
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
