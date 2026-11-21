'use client';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { StaffLocation } from '@/lib/types';

function FitLocations({ locations }: { locations: StaffLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length) {
      map.fitBounds(locations.map(p => [p.lat, p.lng] as [number, number]), { padding: [32, 32], maxZoom: 13 });
    }
  }, [locations, map]);
  return null;
}

export default function StaffLocationMap({ locations }: { locations: StaffLocation[] }) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={4} scrollWheelZoom className="h-full min-h-[430px] w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitLocations locations={locations} />
      {locations.map(person => {
        const color = person.status === 'LIVE' ? '#16803D' : person.status === 'RECENT' ? '#D6A700' : '#64748B';
        return (
          <CircleMarker key={person.userId} center={[person.lat, person.lng]} radius={9} pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 }}>
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-slate-900">{person.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">{person.role} · {person.shift || 'No shift'}</p>
                <p className="text-[11px] text-slate-500">{person.venueId}</p>
                <p className="mt-2 text-[11px] font-semibold">{person.ageMinutes === 0 ? 'Updated just now' : `${person.ageMinutes} min ago`}</p>
                <p className="text-[10px] text-slate-400">GPS accuracy ±{Math.round(person.accuracy)} m</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
