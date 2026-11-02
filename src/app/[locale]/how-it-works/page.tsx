import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Droplet, PhoneCall, CheckCircle2, Shield } from 'lucide-react';

export default function HowItWorksPage() {
  const t = useTranslations('home');

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-28">
      <div className="px-1">
        <h1 className="ios-large-title text-[30px] sm:text-[34px] font-bold text-gray-950 tracking-tight leading-tight">
          How It Works
        </h1>
        <p className="ios-body text-[15px] text-[#8E8E93] mt-1.5 leading-snug">
          Connecting families in urgent need with willing, verified donors near the hospital within minutes.
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] font-bold text-[14px] flex items-center justify-center">
              1
            </div>
            <h2 className="font-semibold text-[16px] text-gray-950 tracking-tight">
              Immediate Blood Bank Check
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 pl-11 leading-relaxed">
            When you pick a blood group and location, RaktKhoj first displays nearby licensed blood banks with their latest verified stock. If a bank has units in stock, you can go or call directly.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/12 text-[#34C759] font-bold text-[14px] flex items-center justify-center">
              2
            </div>
            <h2 className="font-semibold text-[16px] text-gray-950 tracking-tight">
              Simultaneous Call + WhatsApp Alert
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 pl-11 leading-relaxed">
            Pressing &quot;Search donors&quot; activates our matching engine. Registered donors in widening distance rings (0.5 km up to 100 km) receive an automated phone call and a WhatsApp alert at the exact same time in Telugu, Hindi or English.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#AF52DE]/12 text-[#AF52DE] font-bold text-[14px] flex items-center justify-center">
              3
            </div>
            <h2 className="font-semibold text-[16px] text-gray-950 tracking-tight">
              Deterministic Eligibility Rules
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 pl-11 leading-relaxed">
            Donors answer a few quick questions (recent donations, fever, medications, travel). A deterministic rules engine ensures medical eligibility. Those who answer YES and pass appear live on the requester&apos;s screen.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/12 text-[#FF3B30] font-bold text-[14px] flex items-center justify-center">
              4
            </div>
            <h2 className="font-semibold text-[16px] text-gray-950 tracking-tight">
              Donation Code Verification
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 pl-11 leading-relaxed">
            Accepted donors receive a secret 6-digit Donation Code. When the donor arrives at the hospital, they share this code to verify the donation happened.
          </p>
        </div>
      </div>

      <div className="p-4 bg-[#34C759]/10 rounded-[20px] border border-[#34C759]/20 shadow-ios-floating flex items-center gap-3 text-[#1C7430] text-[13px] font-medium leading-snug">
        <ShieldCheck className="w-5 h-5 text-[#34C759] shrink-0" />
        <span>RaktKhoj never asks for money or OTP. The doctor at the blood bank does the final medical exam.</span>
      </div>
    </div>
  );
}

