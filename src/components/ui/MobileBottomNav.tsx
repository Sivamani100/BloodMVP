'use client';

import React from 'react';
import { usePathname, Link } from '@/i18n/routing';
import {
  Home,
  Droplet,
  Heart,
  User,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide the floating tab bar inside dedicated full-screen wizards and live dispatch radar
  // where specialized bottom action sheets and sticky confirmation controls reside.
  const isDedicatedStep =
    pathname.startsWith('/need-blood') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/become-donor');

  if (isDedicatedStep) {
    return null;
  }

  const tabs = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Find Blood',
      href: '/need-blood',
      icon: Droplet,
      isActive: pathname.startsWith('/need-blood'),
    },
    {
      label: 'Donate',
      href: '/become-donor',
      icon: Heart,
      isActive: pathname.startsWith('/become-donor'),
    },
    {
      label: 'Profile',
      href: '/donor',
      icon: User,
      isActive: pathname.startsWith('/donor') || pathname.startsWith('/login'),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed z-40 left-4 right-4 max-w-md mx-auto bottom-[calc(16px+env(safe-area-inset-bottom,0px))] h-[64px] rounded-full ios-floating-pill p-1.5 flex items-center justify-around select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all duration-200 ios-press-subtle ${
              active ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-gray-700'
            }`}
          >
            {/* Soft subtle background pill highlight scaling behind the icon */}
            <div
              className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                active ? 'bg-[#007AFF]/10 scale-100' : 'bg-transparent scale-90'
              }`}
            >
              <Icon
                className={`w-[21px] h-[21px] transition-transform duration-200 ${
                  active ? 'stroke-[#007AFF] scale-105' : 'stroke-[#8E8E93]'
                }`}
                strokeWidth={active ? 2.3 : 1.75}
              />
            </div>

            {/* Micro Tab Label */}
            <span
              className={`text-[10.5px] leading-none mt-0.5 tracking-tight transition-colors duration-150 ${
                active ? 'font-semibold text-[#007AFF]' : 'font-medium text-[#8E8E93]'
              }`}
            >
              {tab.label}
            </span>

            {/* 3px active dot resting directly beneath active tab */}
            {active && (
              <span className="w-1 h-1 rounded-full bg-[#007AFF] mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
