import { Inter } from 'next/font/google';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Motor Service Tracker',
  description: 'Catat riwayat service motor Anda dengan mudah',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Motor Service Tracker',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MotoTrack" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <ServiceWorkerRegister />
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
