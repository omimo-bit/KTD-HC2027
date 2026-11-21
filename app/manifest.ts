import type { MetadataRoute } from 'next';
import { APP_BASE_PATH } from '@/lib/config';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const base = APP_BASE_PATH || '';
  return {
    id: `${base}/`,
    name: 'Kratingdaeng Homecoming Activation 2027',
    short_name: 'KD Homecoming',
    description: 'Activation Operations Control Tower',
    start_url: `${base}/`,
    scope: `${base}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#003399',
    orientation: 'any',
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${base}/icons/apple-touch-icon.png`, sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: `${base}/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
}
