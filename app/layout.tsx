import type { Metadata } from 'next';
import { Exo, Arimo } from 'next/font/google';
import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import ServiceWorkerRegister from '@/components/service-worker-register';

const exo = Exo({ subsets: ['latin'], weight: ['700'], variable: '--font-exo', display: 'swap' });
const arimo = Arimo({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-arimo', display: 'swap' });

export const metadata: Metadata = {
  title: 'Kratingdaeng | Homecoming Activation 2027',
  description: 'Live event and booth activation operations dashboard — Keeping You Going All the Way.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${exo.variable} ${arimo.variable}`}>
        <AuthProvider><ServiceWorkerRegister />{children}</AuthProvider>
      </body>
    </html>
  );
}
