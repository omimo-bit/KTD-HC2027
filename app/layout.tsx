import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import ServiceWorkerRegister from '@/components/service-worker-register';
import { appAsset } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Kratingdaeng | Homecoming Activation 2027',
  description: 'Live event and booth activation operations dashboard — Keeping You Going All the Way.',
  manifest: appAsset('/manifest.webmanifest'),
  applicationName: 'KD Homecoming',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'KD Homecoming' },
  icons: {
    icon: [appAsset('/icons/icon-192.png'), appAsset('/icons/icon-512.png')],
    apple: appAsset('/icons/apple-touch-icon.png')
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#003399'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider><ServiceWorkerRegister />{children}</AuthProvider>
      </body>
    </html>
  );
}
