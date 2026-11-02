import React from 'react';
import { DevicePreviewLayout } from '@/components/device-preview';

export const metadata = {
  title: 'Device Preview Studio | RaktKhoj / BloodMVP',
  description: 'Interactive Flutter-style device previewer with realistic hardware frames, dynamic island, rotation and scaling.',
};

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ route?: string }>;
}) {
  const { locale } = await params;
  const sParams = searchParams ? await searchParams : {};
  const defaultRoute = sParams.route || '/';

  return <DevicePreviewLayout initialLocale={locale} defaultRoute={defaultRoute} />;
}
