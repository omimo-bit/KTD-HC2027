import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kratingdaeng Homecoming Activation 2027',
    short_name: 'KD Homecoming',
    description: 'Activation Operations Control Tower',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#003399',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  };
}
