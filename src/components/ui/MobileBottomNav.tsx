'use client';

import React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import {
  CreditCard,
  Heart,
  Building2,
  Settings,
  User,
  Zap,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on live wave tracking and inside active multi-step wizards
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
      aria-label="Apple Tab Bar"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-[420px] mx-auto px-6 pb-4 pointer-events-auto">
        <div className="h-15 rounded-[28px] bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.08)] px-5 flex items-center justify-between select-none">
          {/* Tab 1: Home / Wallet (Active dark in reference) */}
          <Link
            href="/"
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isHome ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
            }`}
            aria-label="Home"
          >
            <div className={`p-1.5 rounded-xl transition-all ${isHome ? 'bg-slate-100' : ''}`}>
              <CreditCard className="w-5 h-5" strokeWidth={isHome ? 2.6 : 2} />
            </div>
          </Link>

          {/* Tab 2: Donate / Heart */}
          <Link
            href="/become-donor"
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isDonor ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
            }`}
            aria-label="Donate"
          >
            <div className={`p-1.5 rounded-xl transition-all ${isDonor ? 'bg-slate-100' : ''}`}>
              <Heart className="w-5 h-5" strokeWidth={isDonor ? 2.6 : 2} />
            </div>
          </Link>

          {/* Tab 3: Need Blood / Emergency Zap */}
          <Link
            href="/need-blood"
            className="p-2 rounded-2xl transition-all active:scale-90 text-slate-400 hover:text-slate-700"
            aria-label="Emergency Request"
          >
            <div className="p-1.5 rounded-xl transition-all hover:bg-slate-100">
              <Zap className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
            </div>
          </Link>

          {/* Tab 4: Profile / Settings */}
          <Link
            href="/login"
            className={`p-2 rounded-2xl transition-all active:scale-90 ${
              isAccount ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
            }`}
            aria-label="Account"
          >
            <div className={`p-1.5 rounded-xl transition-all ${isAccount ? 'bg-slate-100' : ''}`}>
              <Settings className="w-5 h-5" strokeWidth={isAccount ? 2.6 : 2} />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
