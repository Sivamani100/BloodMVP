import React from 'react';
import { AlertCircle, FileCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Terms of Service</h1>
        <p className="text-sm text-gray-600 mt-2">Blood Emergency Matching Pilot · Rajahmundry, Andhra Pradesh</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blood-600" />
            <span>1. Medical Disclaimer &amp; Emergency Helpline Notice</span>
          </h2>
          <p>
            Blood is an informational volunteer connection platform. <strong>It does not provide medical advice, emergency transport, or blood testing services.</strong>
          </p>
          <p>
            In any medical emergency, families must always contact the <strong>108 Ambulance service</strong> and visit government or licensed blood centres directly. Blood is an additional tool, not a sole emergency provider.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blood-600" />
            <span>2. Strict Anti-Commercial &amp; No-Money Rule</span>
          </h2>
          <p>
            Voluntary blood donation in India is strictly non-remunerated under the Drugs and Cosmetics Act. <strong>Blood never asks for money, processing fees, or OTPs.</strong> Any requester or donor attempting to buy, sell, or demand money for blood donations will be immediately banned and reported to authorities.
          </p>
        </div>
      </div>
    </div>
  );
}

