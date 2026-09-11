'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Coins, Gamepad2, Search, User, LogOut, Lock, X } from 'lucide-react';
import { getCurrentCustomer, logoutCustomer, registerOrLoginCustomer } from '@/lib/store';
import { CustomerUser } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      setCurrentUser(getCurrentCustomer());
    };
    checkUser();
    window.addEventListener('efootball_storage_update', checkUser);
    return () => window.removeEventListener('efootball_storage_update', checkUser);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;
    setAuthLoading(true);
    try {
      const user = await registerOrLoginCustomer(authEmail.trim(), authPassword.trim());
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
    } finally {
      setAuthLoading(false);
    }
  };

  const links = [
    { href: '/accounts', label: 'Iibso Account', icon: Gamepad2 },
    { href: '/coins', label: 'Iibso Coins', icon: Coins },
    { href: '/track', label: 'La Soco Dalabka', icon: Search },
  ];

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-gray-300 text-xs font-semibold py-1.5 px-4 text-center border-b border-gray-600/20 tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        ⚡ Xaqiijin degdeg ah & u dirid toos ah WhatsApp ama Email!
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-700 via-gray-600 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-500/25 group-hover:scale-105 group-hover:shadow-gray-400/40 transition-all">
              <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-white flex items-center gap-1.5">
                eFOOTBALL <span className="text-cyan-400 text-xs font-black bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/80 tracking-widest">PRO</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Official Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0e1422]/90 p-1.5 rounded-full border border-slate-800/90 shadow-inner">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold shadow-md shadow-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: User Account / Sign In */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#0f172a] border border-cyan-500/40 py-1.5 px-3 rounded-full text-xs">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-200 font-semibold truncate max-w-[120px]">
                  {currentUser.email.split('@')[0]}
                </span>
                <button
                  onClick={logoutCustomer}
                  title="Ka bax account-ka"
                  className="text-slate-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold text-slate-200 hover:text-cyan-400 px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gal Account</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              EVC Plus 24/7
            </div>
          </div>
        </div>
      </header>

      {/* Customer Quick Login Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0d121c] border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-black text-white text-base">Gal Account-kaaga</h3>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Geli email-kaaga iyo password-kaaga si aad u hesho dalabyadaadii hore.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="magacaaga@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer mt-2"
              >
                {authLoading ? 'WAA LA HUBINAYAA...' : 'GAL AMA IS DIWAANGELI'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080c14]/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-2xl">
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
