'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { WizardHeader } from '@/components/ui/WizardHeader';
import {
  MapPin,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Navigation,
} from 'lucide-react';

export default function DonorContactViewPage() {
  const params = useParams();
  const contactId = params.contactId as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: view, error } = await supabase.rpc('get_donor_request_view', {
        p_contact_id: contactId,
      });

      if (!error && view) {
        setData(view);
      }
      setLoading(false);
    }

    loadData();
  }, [contactId, supabase]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="text-sm font-semibold text-gray-700">Loading emergency details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto text-center space-y-3">
          <h1 className="text-xl font-bold text-gray-900">Request Expired or Closed</h1>
          <p className="text-xs text-gray-500">
            Emergency request not found or access has expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="py-3 px-6 bg-red-600 text-white font-bold rounded-2xl text-xs"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white pb-20 text-gray-900">
      <WizardHeader
        title="Donation Details"
        onBack={() => router.push('/donor')}
        showClose={false}
      />

      <div className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Confirmed Banner */}
        <div className="p-6 rounded-3xl bg-[#ECFDF5] border border-emerald-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-black text-emerald-950">
            You are Confirmed to Donate
          </h1>
          <p className="text-xs text-emerald-800 leading-relaxed max-w-xs mx-auto">
            Thank you for stepping up! Please proceed to the hospital and present your official Donation Code.
          </p>
        </div>

        {/* Donation Code Card */}
        {data.donation_code && (
          <div className="p-6 rounded-3xl bg-[#FFF1F2] border-2 border-red-400 text-center space-y-2 shadow-xs">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">
              Your Official Donation Code
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-red-600 tracking-widest py-1">
              {data.donation_code}
            </div>
            <p className="text-xs text-gray-600">
              Show this 6-digit code to the patient&apos;s family or blood bank desk when you arrive.
            </p>
          </div>
        )}

        {/* Hospital Details Card */}
        <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-sm text-gray-900">Hospital Location</h2>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-gray-950">{data.hospital_name}</h3>
            {data.hospital_area && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{data.hospital_area}</span>
              </p>
            )}
          </div>

          {data.ward_info && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-800">
              Ward / Room: {data.ward_info}
            </div>
          )}

          {data.hospital_lat && data.hospital_lng && (
            <div className="pt-1">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${data.hospital_lat},${data.hospital_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Directions in Google Maps</span>
              </a>
            </div>
          )}
        </div>

        {/* Family Contact Card */}
        {data.requester_phone && (
          <div className="p-5 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-sm text-gray-950">{data.requester_name}</p>
              <p className="text-xs text-gray-500 capitalize">{data.relation || 'Patient Family'}</p>
            </div>

            <a
              href={`tel:${data.requester_phone}`}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Family</span>
            </a>
          </div>
        )}

        {/* Safety Reminder */}
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Blood donation is 100% voluntary. The medical officer performs the final pre-donation test.</span>
        </div>
      </div>
    </div>
  );
}
