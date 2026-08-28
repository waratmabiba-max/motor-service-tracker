import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Motor Service Tracker',
  description: 'Catat riwayat service motor Anda dengan mudah',
};

export const runtime = 'edge';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
