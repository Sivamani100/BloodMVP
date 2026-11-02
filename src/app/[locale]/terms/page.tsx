import React from 'react';
import { AlertCircle, FileCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-28">
      <div className="px-1">
        <h1 className="ios-large-title text-[30px] sm:text-[34px] font-bold text-gray-950 tracking-tight leading-tight">
          Terms of Service
        </h1>
        <p className="ios-footnote text-[13px] text-[#8E8E93] mt-1">
          RaktKhoj Emergency Matching Pilot · Rajahmundry, Andhra Pradesh
        </p>
      </div>

      <div className="space-y-3.5 text-[14px] text-gray-700 leading-relaxed">
        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2.5">
          <h2 className="text-[16px] font-semibold text-gray-950 flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#FF9500]/12 text-[#FF9500] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span>1. Medical Disclaimer &amp; Emergency Notice</span>
          </h2>
          <p className="text-gray-600">
            RaktKhoj is an informational volunteer connection platform. <strong>It does not provide medical advice, emergency transport, or blood testing services.</strong>
          </p>
          <p className="text-gray-600">
            In any medical emergency, families must always contact the <strong>108 Ambulance service</strong> and visit government or licensed blood centres directly.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2.5">
          <h2 className="text-[16px] font-semibold text-gray-950 flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#34C759]/12 text-[#34C759] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <span>2. Strict Anti-Commercial &amp; No-Money Rule</span>
          </h2>
          <p className="text-gray-600">
            Voluntary blood donation in India is strictly non-remunerated under the Drugs and Cosmetics Act. <strong>RaktKhoj never asks for money, processing fees, or OTPs.</strong> Any requester or donor attempting to buy, sell, or demand money for blood donations will be immediately banned and reported to authorities.
          </p>
        </div>
      </div>
    </div>
  );
}

