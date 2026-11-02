'use client';

import React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import {
  Home,
  Zap,
  Heart,
  User,
  Activity,
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
  const isNeedBlood = pathname.startsWith('/need-blood');
  const isDonor = pathname.startsWith('/become-donor') || pathname.startsWith('/donor');
  const isAccount = pathname.startsWith('/login') || pathname.startsWith('/admin');

  return (
    <nav
      aria-label="Apple Tab Bar"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-[420px] mx-auto px-4 pb-3 pointer-events-auto">
        <div className="h-16 rounded-[24px] bg-white/90 backdrop-blur-2xl border border-black/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-3 flex items-center justify-around">
          {/* Tab 1: Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-90 ${
              isHome ? 'text-[#E11D48]' : 'text-[#8E8E93] hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={isHome ? 2.6 : 2} />
            <span className={`text-[10px] tracking-tight ${isHome ? 'font-bold' : 'font-medium'}`}>
              Home
            </span>
          </Link>

          {/* Tab 2: Need Blood (Apple Urgent Tab) */}
          <Link
            href="/need-blood"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-90 ${
              isNeedBlood ? 'text-[#E11D48]' : 'text-[#8E8E93] hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Zap className="w-5 h-5" strokeWidth={isNeedBlood ? 2.6 : 2} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            </div>
            <span className={`text-[10px] tracking-tight ${isNeedBlood ? 'font-bold' : 'font-medium'}`}>
              Need Blood
            </span>
          </Link>

          {/* Tab 3: Donate */}
          <Link
            href="/become-donor"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-90 ${
              isDonor ? 'text-[#E11D48]' : 'text-[#8E8E93] hover:text-slate-900'
            }`}
          >
            <Heart className="w-5 h-5" strokeWidth={isDonor ? 2.6 : 2} />
            <span className={`text-[10px] tracking-tight ${isDonor ? 'font-bold' : 'font-medium'}`}>
              Donate
            </span>
          </Link>

          {/* Tab 4: Profile / Login */}
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all active:scale-90 ${
              isAccount ? 'text-[#E11D48]' : 'text-[#8E8E93] hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" strokeWidth={isAccount ? 2.6 : 2} />
            <span className={`text-[10px] tracking-tight ${isAccount ? 'font-bold' : 'font-medium'}`}>
              Profile
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
