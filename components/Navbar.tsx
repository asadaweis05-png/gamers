'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Coins, Gamepad2, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/accounts', label: 'Iibso Account', icon: Gamepad2 },
    { href: '/coins', label: 'Iibso Coins', icon: Coins },
    { href: '/track', label: 'La Soco Dalabka', icon: Search },
    { href: '/admin', label: 'Maamulka', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-blue-900 via-cyan-950 to-blue-900 text-cyan-200 text-xs font-semibold py-1.5 px-4 text-center border-b border-cyan-500/20 tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        ⚡ Xaqiijin degdeg ah & u dirid toos ah WhatsApp ama Email!
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-white flex items-center gap-1.5">
                eFOOTBALL <span className="text-cyan-400 text-sm font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">SHOP</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-1">
                Accounts & Coins Somaliyeed
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-full border border-slate-800">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Support Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            24/7 EVC Plus & WhatsApp
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b0e14]/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-500/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
