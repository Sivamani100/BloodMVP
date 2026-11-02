import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-28">
      <div className="px-1">
        <h1 className="ios-large-title text-[30px] sm:text-[34px] font-bold text-gray-950 tracking-tight leading-tight">
          Privacy Policy
        </h1>
        <p className="ios-footnote text-[13px] text-[#8E8E93] mt-1">
          Last updated: October 2026 · Compliant with India DPDP Act standards
        </p>
      </div>

      <div className="space-y-3.5 text-[14px] text-gray-700 leading-relaxed">
        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2.5">
          <h2 className="text-[16px] font-semibold text-gray-950 flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span>1. What We Collect and How It Is Protected</span>
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
            <li><strong>Phone Number:</strong> Stored securely to deliver login OTPs and emergency matching alerts.</li>
            <li><strong>Health Answers:</strong> Stored with military-grade <strong>AES-256-GCM encryption</strong>. No requester, staff, or browser user can read your health answers.</li>
            <li><strong>Home Location:</strong> Stored as a coordinate to calculate distance. Only distance bands (e.g. &quot;3 to 5 km&quot;) are shown to families. Your exact home address is never revealed.</li>
          </ul>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2.5">
          <h2 className="text-[16px] font-semibold text-gray-950 flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#34C759]/12 text-[#34C759] flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <span>2. Strict Privacy Matrix (Who Sees What)</span>
          </h2>
          <p className="text-gray-600">
            Requesters never see a donor&apos;s phone number, email, address, date of birth, or health answers. A donor&apos;s phone number is revealed <strong>only after the donor explicitly accepts a request and gives consent</strong> to share their number with the family.
          </p>
          <p className="text-gray-600">
            Donors never see the requester&apos;s phone number or the exact hospital ward pin until they accept.
          </p>
        </div>

        <div className="p-4 bg-white rounded-[22px] border border-black/[0.06] shadow-ios-floating space-y-2.5">
          <h2 className="text-[16px] font-semibold text-gray-950 flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span>3. Account Deletion and Opt-Out</span>
          </h2>
          <p className="text-gray-600">
            You can reply <strong>STOP</strong> to any WhatsApp message to immediately cease all alerts. You can also delete your account at any time from your donor dashboard. Account deletion permanently erases all profile, location, and health records instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

