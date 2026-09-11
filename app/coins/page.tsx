'use client';

import { useState, useEffect } from 'react';
import { getCoinPackages } from '@/lib/store';
import { CoinPackage } from '@/types';
import CoinCard from '@/components/CoinCard';
import CheckoutModal from '@/components/CheckoutModal';
import { Coins, HelpCircle } from 'lucide-react';

export default function CoinsPage() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);

  useEffect(() => {
    async function loadPackages() {
      setIsLoading(true);
      const data = await getCoinPackages();
      setPackages(data.filter((p) => p.isActive));
      setIsLoading(false);
    }
    loadPackages();

    const handleUpdate = () => loadPackages();
    window.addEventListener('efootball_storage_update', handleUpdate);
    return () => window.removeEventListener('efootball_storage_update', handleUpdate);
  }, []);

  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 mb-3">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Adeeg Toos ah oo Lagu Shubayo Coins-ka</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-3">
          Iibso Coins-ka <span className="text-amber-400">eFootball 🪙</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Coins si toos ah loogu shubayo Konami ID-gaaga si degdeg ah oo 100% ammaan ah. Furo xirmooyinka Epic & Show Time maanta!
        </p>
      </div>

      {/* Coin Packages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <CoinCard
              key={pkg.id}
              coinPackage={pkg}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      )}

      {/* Simple Fulfillment FAQ / Safety Notice */}
      <div className="mt-16 bg-[#0f141f] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto">
        <h3 className="text-base font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          Sida Ay U Shaqeyso Ku Shubista Coins-ku
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">1. Geli Konami UID</span>
            <p className="text-slate-400">Qor lambarkaaga ciyaarta (User ID / Konami ID) marka aad dalbaneyso.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">2. Xaqiijin Degdeg ah</span>
            <p className="text-slate-400">Waxaan xaqiijineynaa rasiidkaaga EVC Plus daqiiqado gudahood.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">3. Toos ugu Shubis</span>
            <p className="text-slate-400">Coins-ku waxay toos ugu soo dhacayaan account-kaaga adiga oo aan password bixin!</p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        productType="COINS"
        coinPackage={selectedPackage}
      />

    </div>
  );
}
