
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'KRATINGDAENG | HOMECOMING ACTIVATION 2027',
  description:
    'Kratingdaeng Homecoming Activation 2027. Campaign monitoring, booth operations, field reporting and sales performance across Indonesia.',
  applicationName: 'Kratingdaeng Homecoming 2027',
  themeColor: '#003399',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kratingdaeng HC2027',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
