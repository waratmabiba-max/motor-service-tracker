import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Motor Service Tracker',
  description: 'Catat riwayat service motor Anda dengan mudah',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
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
      <body className={`${inter.className} bg-gray-50`}>
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
