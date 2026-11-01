'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Loader2,
  Navigation,
} from 'lucide-react';

export default function DonorContactViewPage() {
  const params = useParams();
  const contactId = params.contactId as string;

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
  }, [contactId]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-gray-500">Loading emergency details...</div>;
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-500">
        Emergency request not found or access expired.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Confirmed Banner */}
      <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-200" />
        <h1 className="text-2xl font-black">You are Confirmed to Donate</h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
          Thank you for volunteering! Please proceed to the hospital and present your Donation Code.
        </p>
      </div>

      {/* Donation Code Box */}
      {data.donation_code && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blood-500 text-center space-y-2 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Your Official Donation Code
          </span>
          <div className="font-mono text-4xl sm:text-5xl font-black text-blood-600 tracking-widest">
            {data.donation_code}
          </div>
          <p className="text-xs text-gray-500">
            Tell this 6-digit code to the family or blood bank desk when you arrive.
          </p>
        </div>
      )}

      {/* Hospital details */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blood-600" />
          <h2 className="text-lg font-bold text-gray-900">Hospital &amp; Room Details</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-800">
          <p className="font-extrabold text-base text-gray-950">
            {data.hospital_name}
          </p>
          {data.hospital_area && (
            <p className="text-gray-600 text-xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{data.hospital_area}</span>
            </p>
          )}

          {data.ward_info && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800">
              Ward / Room: {data.ward_info}
            </div>
          )}
        </div>

        {data.hospital_lat && data.hospital_lng && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${data.hospital_lat},${data.hospital_lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Directions in Google Maps</span>
          </a>
        )}
      </div>

      {/* Family Contact */}
      {data.requester_phone && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-gray-900">Patient Family Contact</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-gray-950">{data.requester_name}</p>
              <p className="text-xs text-gray-500">{data.relation}</p>
            </div>
            <a
              href={`tel:${data.requester_phone}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Family</span>
            </a>
          </div>
        </div>
      )}

      {/* Safety reminder */}
      <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>Blood never asks for money. The blood bank doctor conducts the final health exam.</span>
      </div>
    </div>
  );
}
