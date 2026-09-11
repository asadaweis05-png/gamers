import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'eFootball Digital Marketplace | Iibso Accounts & Coins',
  description: 'Suuqa ugu weyn uguna aaminka badan ee eFootball mobile accounts iyo coins top-up. Lacag-bixin EVC Plus oo xaqiijin degdeg ah leh.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07090e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="so" className="dark">
      <body className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
