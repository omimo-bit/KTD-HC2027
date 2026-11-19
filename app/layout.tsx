import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'Kratingdaeng | Homecoming Activation 2027',
  description: 'Live event and booth activation operations dashboard — Keeping You Going All the Way.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
