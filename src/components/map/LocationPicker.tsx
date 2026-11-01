'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search, Navigation, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, placeName?: string) => void;
}

// Lazy load leaflet map components to prevent SSR errors
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);

export function LocationPicker({
  initialLat = 17.0005,
  initialLng = 81.804,
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Import Leaflet on client side to configure default marker icon
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeafletLoaded(true);
    });
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const newLat = parseFloat(first.lat);
          const newLng = parseFloat(first.lon);
          setPosition([newLat, newLng]);
          onLocationSelect(newLat, newLng, first.display_name);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setPosition([newLat, newLng]);
        onLocationSelect(newLat, newLng, 'Current Location');
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className="space-y-3">
      {/* Search and GPS controls */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospital or area name..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blood-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="px-3.5 py-2 bg-blood-50 hover:bg-blood-100 text-blood-700 border border-blood-200 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Use my location"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Map view */}
      <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100">
        {leafletLoaded ? (
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom={false}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: (e: any) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setPosition([pos.lat, pos.lng]);
                  onLocationSelect(pos.lat, pos.lng);
                },
              }}
            />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            Loading map...
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Tip: You can drag the marker directly to the exact hospital entrance.
      </p>
    </div>
  );
}
