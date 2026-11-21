'use client';

import { useEffect } from 'react';
import { APP_BASE_PATH } from '@/lib/config';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const workerUrl = `${APP_BASE_PATH}/sw.js`;
    const scope = `${APP_BASE_PATH || ''}/`;
    void navigator.serviceWorker.register(workerUrl, { scope }).catch(() => undefined);
  }, []);
  return null;
}
