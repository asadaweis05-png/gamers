'use client';

import { useState, useEffect } from 'react';
import { getAccounts } from '@/lib/store';
import { Account } from '@/types';
import AccountCard from '@/components/AccountCard';
import { Gamepad2, ShieldCheck } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'SHAX_HEER_SARE' | 'BUDGET'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      setIsLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      setIsLoading(false);
    }
    fetchAccounts();

    const handleUpdate = () => fetchAccounts();
    window.addEventListener('efootball_storage_update', handleUpdate);
    return () => window.removeEventListener('efootball_storage_update', handleUpdate);
  }, []);

  const filteredAccounts = accounts.filter((acc) => {
    if (filter === 'AVAILABLE') return acc.status === 'AVAILABLE';
    if (filter === 'SHAX_HEER_SARE') return acc.rating >= 3150;
    if (filter === 'BUDGET') return acc.price <= 35;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span>Accounts-ka eFootball Mobile ee La Hubiyey</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-3">
          Iibso Accounts <span className="text-cyan-400">eFootball</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Ka dooro accounts tayo sare leh oo wata ciyaartooyda Big Time, Epic Booster, iyo Show Time. 100% ammaan ah oo Konami ID ah.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Dhammaan Accounts-ka ({accounts.length})
        </button>
        <button
          onClick={() => setFilter('AVAILABLE')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'AVAILABLE'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          🟢 Hadda Diyaar ah ({accounts.filter(a => a.status === 'AVAILABLE').length})
        </button>
        <button
          onClick={() => setFilter('SHAX_HEER_SARE')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'SHAX_HEER_SARE'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          ⭐ Shax Heer Sare (3150+ Rating)
        </button>
        <button
          onClick={() => setFilter('BUDGET')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'BUDGET'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          💰 Ka yar $40
        </button>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 bg-slate-900/60 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Wax Account ah Lagama Helin</h3>
          <p className="text-xs text-slate-400 mb-4">Ma jiraan accounts ku jira qaybtan aad dooratay hadda.</p>
          <button
            onClick={() => setFilter('ALL')}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
          >
            Muuji Dhammaan Accounts-ka
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {/* Trust Notice */}
      <div className="mt-16 bg-[#0f141f] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-black text-white">100% Damaanad & Ammaan</h4>
            <p className="text-xs text-slate-400">Dhammaan accounts-ku waa sharci oo si toos ah Konami ID loogu wareejinayaa.</p>
          </div>
        </div>
        <a
          href="https://wa.me/252618889900"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-colors inline-block"
        >
          Dalbo Shax Gaar ah
        </a>
      </div>

    </div>
  );
}
