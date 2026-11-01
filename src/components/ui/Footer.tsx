import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');

  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-10 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{tCommon('safety')}</span>
        </div>

        <div className="flex justify-center items-center gap-6 pt-2 font-medium">
          <Link href="/how-it-works" className="hover:text-blood-600 transition-colors">
            {tHome('how_it_works')}
          </Link>
          <Link href="/privacy" className="hover:text-blood-600 transition-colors">
            {tHome('privacy')}
          </Link>
          <Link href="/terms" className="hover:text-blood-600 transition-colors">
            {tHome('terms')}
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Emergency blood-donor connection pilot. Not a replacement for 108 ambulance or licensed blood banks.
        </p>
      </div>
    </footer>
  );
}

