'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { LOCALES, Locale } from '@/lib/constants';
import { HeartHandshake, Globe } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as Locale;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-500/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">
            Blood<span className="text-blood-600">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-sm text-gray-700">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
              value={locale}
              onChange={onLanguageChange}
              className="bg-transparent font-medium focus:outline-hidden cursor-pointer"
              aria-label={t('language')}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          <Link
            href="/donor"
            className="hidden sm:inline-flex text-sm font-semibold text-gray-700 hover:text-blood-600 px-3 py-1.5 transition-colors"
          >
            {t('donor_dashboard')}
          </Link>
        </div>
      </div>
    </header>
  );
}

