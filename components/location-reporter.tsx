'use client';

import { useEffect } from 'react';
import type { SessionUser } from '@/lib/types';
import { apiPost } from '@/lib/api';

/** Sends a location heartbeat only while an authenticated field PWA is open. */
export default function LocationReporter({ token, user }: { token: string; user: SessionUser | null }) {
  useEffect(() => {
    if (!token || !user || !['TL', 'SPG', 'CREW'].includes(user.role)) return;
    if (!('geolocation' in navigator)) return;

    let lastSent = 0;
    let lastPosition: GeolocationPosition | null = null;
    let active = true;
    const send = (position: GeolocationPosition) => {
      if (!active) return;
      const now = Date.now();
      if (now - lastSent < 60_000) return;
      lastSent = now;
      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      void apiPost('locationPing', token, {
        lat: latitude, lng: longitude, accuracy, speed, heading, venueId: user.venueId
      }).catch(() => {
        // The next GPS heartbeat retries when the network is available again.
      });
    };
    const watchId = navigator.geolocation.watchPosition(
      position => { lastPosition = position; send(position); },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 }
    );
    // watchPosition can stay quiet while a device is stationary; reuse the latest fix for a heartbeat.
    const heartbeat = window.setInterval(() => { if (lastPosition) send(lastPosition); }, 15_000);

    return () => {
      active = false;
      window.clearInterval(heartbeat);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [token, user?.userId, user?.role, user?.venueId]);

  return null;
}
