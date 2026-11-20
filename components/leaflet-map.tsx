'use client';

import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { Booth, VenueStats } from '@/lib/types';

function FitPoints({ booths }: { booths: Booth[] }) {
  const map = useMap();
  useEffect(() => {
    const points = booths.filter(b => Number.isFinite(Number(b.lat)) && Number.isFinite(Number(b.lng)));
    if (points.length) map.fitBounds(points.map(p => [Number(p.lat), Number(p.lng)] as [number, number]), { padding: [28, 28] });
  }, [booths, map]);
  return null;
}

export default function LeafletMap({ booths, stats, onSelect }: { booths: Booth[]; stats: VenueStats[]; onSelect: (booth: Booth) => void }) {
  const statMap = new Map(stats.map(s => [s.venueId, s]));
  return (
    <MapContainer center={[-2.5, 118]} zoom={4} scrollWheelZoom className="h-full min-h-[470px] w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitPoints booths={booths} />
      {booths.map((booth, index) => {
        const stat = statMap.get(String(booth.venueId));
        const portColor = index % 2 === 0 ? '#E30613' : '#D6A700';
        const color = booth.type === 'REST_AREA' ? '#003399' : portColor;
        return <CircleMarker key={booth.venueId} center={[Number(booth.lat), Number(booth.lng)]} radius={10} pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: color, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(booth) }}>
          <Popup><div className="min-w-[170px]"><p className="font-bold text-slate-900">{booth.name}</p><p className="mt-1 text-[11px] text-slate-500">{booth.region} · {booth.type === 'REST_AREA' ? 'Rest Area' : 'Pelabuhan'}</p><div className="mt-2 grid grid-cols-2 gap-2 text-[11px]"><span>Visitors <b>{Number(stat?.visitors || 0).toLocaleString('id-ID')}</b></span><span>Sales <b>{Number(stat?.bottles || 0).toLocaleString('id-ID')} btl</b></span></div><button className="mt-3 w-full rounded-lg bg-[#003399] px-3 py-2 text-[11px] font-bold text-white" onClick={() => onSelect(booth)}>Open venue detail</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer>
  );
}
