import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  accuracy,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom vector marker icon using Lucide style HTML divIcon to ensure no broken asset URLs
  const createCustomPinIcon = () => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-full border-2 border-white shadow-2xl transform -translate-x-1/2 -translate-y-1/2 animate-bounce-short cursor-grab active:cursor-grabbing">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="absolute -bottom-1 w-3 h-1 bg-black/40 rounded-full blur-[1px]"></span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not created yet
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Draggable Marker
      const marker = L.marker([latitude, longitude], {
        draggable: true,
        icon: createCustomPinIcon(),
        title: 'Drag me to set delivery location',
      }).addTo(map);

      marker.bindPopup(
        `<div class="text-xs font-bold text-emerald-900 p-1">
          📍 Drag marker to pinpoint your exact delivery address
        </div>`
      );

      // Listen for marker dragend
      marker.on('dragend', (event: any) => {
        const markerPos = event.target.getLatLng();
        onLocationSelect(markerPos.lat, markerPos.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Update map center & marker position when props change
      const map = mapInstanceRef.current;
      const marker = markerRef.current;

      if (map && marker) {
        map.setView([latitude, longitude], map.getZoom() || 16);
        marker.setLatLng([latitude, longitude]);
      }
    }

    // Fix map rendering issue on container resize
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map when lat/lng change from outside
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 16);
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 px-1">
        <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Interactive Location Map (OpenStreetMap)</span>
        </span>
        <span className="text-[11px] text-gray-500 font-mono">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-md bg-gray-100 dark:bg-gray-800">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Overlay instruction pill */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-[11px] font-bold text-gray-800 dark:text-gray-200 shadow-sm flex items-center gap-1.5 pointer-events-none">
          <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Drag marker to pinpoint exact delivery door</span>
        </div>

        {accuracy && (
          <div className="absolute bottom-3 right-3 z-20 bg-emerald-950/80 text-emerald-200 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono border border-emerald-500/30">
            GPS Accuracy: ~{Math.round(accuracy)}m
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic px-1 flex items-center gap-1">
        <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>
          Tip: Moving the green marker on the map will automatically update your delivery address details.
        </span>
      </p>
    </div>
  );
};
