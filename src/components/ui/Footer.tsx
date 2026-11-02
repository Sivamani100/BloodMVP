'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const pathname = usePathname();

  // Hide global footer on wizard and live tracking screens
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  return (
    <footer className="bg-[#F2F2F7] hairline-t py-8 text-center text-sm text-[#8E8E93]">
      <div className="max-w-md mx-auto px-4 space-y-3.5">
        <div className="inline-flex items-center gap-1.5 bg-[#34C759]/10 text-[#34C759] text-[12px] font-semibold px-3 py-1 rounded-full border border-[#34C759]/20">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759] shrink-0" strokeWidth={2} />
          <span>{tCommon('safety')}</span>
        </div>

        <div className="flex justify-center items-center gap-5 pt-1 text-[13px] font-medium text-[#8E8E93]">
          <Link href="/how-it-works" className="hover:text-gray-900 transition-colors">
            {tHome('how_it_works')}
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            {tHome('privacy')}
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            {tHome('terms')}
          </Link>
        </div>

        <p className="text-[11px] text-[#8E8E93]/80 leading-relaxed max-w-xs mx-auto">
          Emergency blood-donor connection platform. Not a replacement for 108 ambulance or licensed blood banks.
        </p>
      </div>
    </footer>
  );
}
