import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import '@/app/globals.css';

export const metadata = {
  title: 'BloodMVP — Rapid Blood Donor Connection',
  description: 'Connect with verified, willing, nearby blood donors in minutes across East Godavari.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="bg-[#E5E5EA]">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#E5E5EA] flex flex-col items-center justify-between antialiased selection:bg-rose-500 selection:text-white">
        <NextIntlClientProvider messages={messages}>
          {/* Apple Mobile-First Canvas (iOS System Grouped Background #F2F2F7) */}
          <div className="w-full max-w-[420px] min-h-screen bg-[#F2F2F7] shadow-2xl shadow-slate-900/15 flex flex-col justify-between relative border-x border-slate-300/40">
            <Navbar />
            <main className="grow pb-24">{children}</main>
            <Footer />
            <MobileBottomNav />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
