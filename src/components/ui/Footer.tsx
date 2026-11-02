'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const pathname = usePathname();

  // Hide global footer on wizard and live tracking screens
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/d/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  return (
    <footer className="bg-slate-50/80 border-t border-slate-100 py-8 px-4 text-center text-xs text-slate-500 mb-16">
      <div className="space-y-3.5">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified & Safe • No Money or OTP Sharing</span>
        </div>

        <div className="flex justify-center items-center gap-5 font-semibold text-slate-600">
          <Link href="/how-it-works" className="hover:text-rose-600 transition-colors">
            {tHome('how_it_works')}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-rose-600 transition-colors">
            {tHome('privacy')}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-rose-600 transition-colors">
            {tHome('terms')}
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
          <strong className="text-slate-700">BloodMVP</strong> is an emergency blood-donor rapid matching platform for East Godavari & surrounding regions. In life-threatening emergencies, call 108.
        </p>

        <p className="text-[10px] text-slate-400 font-medium pt-1">
          Crafted with <Heart className="w-2.5 h-2.5 inline fill-rose-500 text-rose-500 mx-0.5" /> for saving lives.
        </p>
      </div>
    </footer>
  );
}
