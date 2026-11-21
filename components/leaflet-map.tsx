'use client';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Booth, VenueStats, StaffLocation } from '@/lib/types';

function InitialFit({ booths }: { booths: Booth[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    const points = booths.filter(b => Number.isFinite(Number(b.lat)) && Number.isFinite(Number(b.lng)));
    if (points.length) {
      map.fitBounds(points.map(p => [Number(p.lat), Number(p.lng)] as [number, number]), { padding: [28, 28], maxZoom: 8 });
      fitted.current = true;
    }
  }, [booths, map]);
  return null;
}

export default function LeafletMap({ booths, stats, locations = [], onSelect }: { booths: Booth[]; stats: VenueStats[]; locations?: StaffLocation[]; onSelect: (booth: Booth) => void }) {
  const statMap = new Map(stats.map(s => [s.venueId, s]));
  return (
    <MapContainer center={[-2.5, 118]} zoom={4} scrollWheelZoom className="h-full min-h-[470px] w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <InitialFit booths={booths} />
      {booths.map((booth) => {
        const stat = statMap.get(String(booth.venueId));
        const color = booth.type === 'REST_AREA' ? '#003399' : '#E30613';
        return <CircleMarker key={`venue-${booth.venueId}`} center={[Number(booth.lat), Number(booth.lng)]} radius={10} pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: color, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(booth) }}>
          <Popup eventHandlers={{ click: () => onSelect(booth) }}>
            <div className="min-w-[170px]">
              <p className="font-bold text-slate-900">{booth.name}</p>
              <p className="mt-1 text-[11px] text-slate-500">{booth.region} · {booth.type === 'REST_AREA' ? 'Rest Area' : 'Pelabuhan'}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]"><span>Visitors <b>{Number(stat?.visitors || 0).toLocaleString('id-ID')}</b></span><span>Sales <b>{Number(stat?.bottles || 0).toLocaleString('id-ID')} btl</b></span></div>
              <button type="button" className="mt-3 w-full rounded-lg bg-[#003399] px-3 py-2 text-[11px] font-bold text-white" onClick={(event) => { event.preventDefault(); L.DomEvent.stopPropagation(event.nativeEvent); onSelect(booth); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(booth); }}>Open venue detail</button>
            </div>
          </Popup>
        </CircleMarker>;
      })}
      {locations.map(person => <CircleMarker key={`staff-${person.userId}`} center={[person.lat, person.lng]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: person.status === 'LIVE' ? '#16803D' : person.status === 'RECENT' ? '#D6A700' : '#64748B', fillOpacity: .95 }}>
        <Popup><div className="min-w-[150px]"><p className="font-bold">{person.name}</p><p className="text-xs">{person.role} · {person.venueId}</p><p className="text-xs">{person.ageMinutes} menit lalu · ±{Math.round(person.accuracy)} m</p></div></Popup>
      </CircleMarker>)}
    </MapContainer>
  );
}
