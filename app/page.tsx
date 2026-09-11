'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAccounts, getCoinPackages } from '@/lib/store';
import { Account, CoinPackage } from '@/types';
import AccountCard from '@/components/AccountCard';
import CoinCard from '@/components/CoinCard';
import CheckoutModal from '@/components/CheckoutModal';
import { Gamepad2, Coins, ArrowRight, Sparkles, ShieldCheck, Zap, Star } from 'lucide-react';

export default function HomePage() {
  const [featuredAccounts, setFeaturedAccounts] = useState<Account[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoinPkg, setSelectedCoinPkg] = useState<CoinPackage | null>(null);

  useEffect(() => {
    async function loadData() {
      const [accs, coins] = await Promise.all([getAccounts(), getCoinPackages()]);
      setFeaturedAccounts(accs.slice(0, 3));
      setCoinPackages(coins.slice(0, 3));
    }
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('efootball_storage_update', handleUpdate);
    return () => window.removeEventListener('efootball_storage_update', handleUpdate);
  }, []);

  const handleCoinSelect = (pkg: CoinPackage) => {
    setSelectedCoinPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern relative">
      {/* Ambient Stadium Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 sm:w-[700px] h-80 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Top Mini Badge */}
        <div className="inline-flex items-center gap-2 bg-[#0e1422] border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-300 shadow-xl mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Suuqa #1 ee eFootball ee Soomaaliya</span>
        </div>

        {/* Main Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[1.08] mb-4">
          eFootball <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
            Accounts & Coins
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
          Hel Account-ka aad rabto ama Coins-ka eFootball si degdeg ah oo aad u fudud.
        </p>

        {/* TWO HUGE PRIMARY BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-16">
          {/* Button 1: Buy Account */}
          <Link
            href="/accounts"
            className="group relative overflow-hidden flex items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-600 text-black font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-95 transition-all border border-cyan-300/40"
          >
            <div className="p-2.5 bg-black/15 rounded-xl shadow-inner">
              <Gamepad2 className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <span>🎮 IIBSO ACCOUNT</span>
          </Link>

          {/* Button 2: Buy Coins */}
          <Link
            href="/coins"
            className="group relative overflow-hidden flex items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-base sm:text-lg uppercase tracking-wider shadow-2xl shadow-amber-500/25 hover:shadow-amber-400/40 hover:scale-[1.02] active:scale-95 transition-all border border-amber-300/40"
          >
            <div className="p-2.5 bg-black/15 rounded-xl shadow-inner">
              <Coins className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <span>🪙 IIBSO COINS</span>
          </Link>
        </div>

        {/* VERY SIMPLE 3-STEP EXPLANATION */}
        <div className="bg-[#0b0f17]/95 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl backdrop-blur-md">
          <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-6 text-center flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Sida Ay U Shaqeyso — 3 Tallaabo oo Fudud
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#101624] border border-slate-800 shadow-sm hover:border-cyan-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-lg mb-3 shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-white text-base mb-1">1. Dooro</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dooro account-ka aad xiisaynayso ama xirmada coins-ka aad rabto.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#101624] border border-slate-800 shadow-sm hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-lg mb-3 shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-white text-base mb-1">2. Bixi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lacagta ku dir EVC Plus oo soo geli sawirka rasiidka lacag-bixinta.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#101624] border border-slate-800 shadow-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-black text-lg mb-3 shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-white text-base mb-1">3. Hel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xogta account-ka ama coins-ka toos ugu hel WhatsApp ama Email.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-cyan-400">Dooro waxaad rabto</span>
            <span>➔</span>
            <span className="text-amber-400">Dir rasiidka lacagta</span>
            <span>➔</span>
            <span className="text-emerald-400">Hel dalabkaaga</span>
          </div>
        </div>

      </section>

      {/* FEATURED ACCOUNTS PREVIEW */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
              Accounts-ka La Doortay
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Shax heer sare ah oo diyaar u ah tartamada iyo ranked</p>
          </div>
          <Link
            href="/accounts"
            className="flex items-center gap-1 text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800"
          >
            <span>Arag Dhammaan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </section>

      {/* POPULAR COIN PACKAGES PREVIEW */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              Xirmooyinka Coins-ka ugu Caansan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ku shubo degdeg ah si aad u hesho Epic Booster iyo Show Time</p>
          </div>
          <Link
            href="/coins"
            className="flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800"
          >
            <span>Arag Xirmooyinka</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coinPackages.map((pkg) => (
            <CoinCard key={pkg.id} coinPackage={pkg} onSelect={handleCoinSelect} />
          ))}
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productType="COINS"
        coinPackage={selectedCoinPkg}
      />
    </div>
  );
}
