import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/ui/Navbar';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { Footer } from '@/components/ui/Footer';
import '@/app/globals.css';

export const metadata = {
  title: 'Blood — Urgent Blood Donor Connection',
  description: 'Connect with verified, willing, nearby blood donors in minutes.',
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
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between antialiased bg-[#F2F2F7]">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="grow pb-24 sm:pb-28">{children}</main>
          <Footer />
          <MobileBottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

