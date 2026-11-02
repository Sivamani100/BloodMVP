'use client';

import React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import {
  Home,
  PlusCircle,
  Heart,
  User,
  ShieldCheck,
  Building2,
  Sparkles,
  Zap,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on live wave tracking and inside active multi-step wizards
  // to avoid overlapping with wizard action buttons
  const isDedicatedScreen =
    pathname.startsWith('/r/') ||
    pathname.startsWith('/d/') ||
    pathname.startsWith('/need-blood/details') ||
    pathname === '/need-blood';

  if (isDedicatedScreen) {
    return null;
  }

  const isHome = pathname === '/';
  const isDonor = pathname.startsWith('/become-donor') || pathname.startsWith('/donor');
  const isBanks = pathname.startsWith('/how-it-works');
  const isAccount = pathname.startsWith('/login') || pathname.startsWith('/admin');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-[430px] mx-auto px-4 pb-3 pt-1 pointer-events-auto">
        <div className="rounded-[26px] bg-white/95 backdrop-blur-xl border border-rose-100/80 shadow-[0_10px_35px_-5px_rgba(225,29,72,0.18)] px-3 py-2 flex items-center justify-around">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 ${
              isHome
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isHome ? 'bg-rose-50 text-rose-600' : ''
              }`}
            >
              <Home className="w-5 h-5" strokeWidth={isHome ? 2.5 : 2} />
            </div>
            <span className="text-[10px] tracking-tight">Home</span>
          </Link>

          {/* 2. Need Blood (Hero Center Button) */}
          <Link
            href="/need-blood"
            className="flex flex-col items-center -mt-5 group active:scale-95 transition-transform"
          >
            <div className="relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/35 border-4 border-white">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white" />
              </span>
              <Zap className="w-6 h-6 fill-white text-white drop-shadow-sm" />
            </div>
            <span className="text-[10px] font-black text-rose-700 tracking-tight mt-1">
              Need Blood
            </span>
          </Link>

          {/* 3. Become a Donor */}
          <Link
            href="/become-donor"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 ${
              isDonor
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isDonor ? 'bg-rose-50 text-rose-600' : ''
              }`}
            >
              <Heart className="w-5 h-5" strokeWidth={isDonor ? 2.5 : 2} />
            </div>
            <span className="text-[10px] tracking-tight">Donate</span>
          </Link>

          {/* 4. Login / Profile */}
          <Link
            href="/login"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-95 ${
              isAccount
                ? 'text-rose-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isAccount ? 'bg-rose-50 text-rose-600' : ''
              }`}
            >
              <User className="w-5 h-5" strokeWidth={isAccount ? 2.5 : 2} />
            </div>
            <span className="text-[10px] tracking-tight">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
