'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAccountById } from '@/lib/store';
import { Account } from '@/types';
import CheckoutModal from '@/components/CheckoutModal';
import { 
  Star, Flame, Sparkles, ArrowLeft, 
  ShieldCheck, Gamepad2 
} from 'lucide-react';

export default function AccountDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      if (!id) return;
      setIsLoading(true);
      const acc = await getAccountById(id);
      setAccount(acc);
      setIsLoading(false);
    }
    loadAccount();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Waxaa la soo gelinayaa faahfaahinta...</span>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-8 max-w-md text-center">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white mb-2">Account-ka Lama Helin</h2>
          <p className="text-xs text-slate-400 mb-6">Account-ka lambarkiisu yahay "{id}" ma jiro ama waa laga saaray nidaamka.</p>
          <Link
            href="/accounts"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase"
          >
            Arag Accounts-ka Kale
          </Link>
        </div>
      </div>
    );
  }

  const isSold = account.status === 'SOLD';
  const images = account.images?.length > 0 ? account.images : ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dib ugu noqo Accounts-ka</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: SCREENSHOTS & MEDIA (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Large Image */}
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <img
              src={images[selectedImageIndex]}
              alt={account.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f141f] via-transparent to-black/20" />

            {/* Rating Tag */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-amber-300">
                {account.rating} RATING
              </span>
            </div>

            {/* Status Tag */}
            <div className="absolute top-4 right-4">
              {isSold ? (
                <span className="bg-red-950/90 text-red-400 border border-red-800 text-xs font-black uppercase px-3 py-1.5 rounded-xl">
                  WAA LA IIBSADAY
                </span>
              ) : (
                <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 text-xs font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HADDA WAA DIYAAR
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Account Description */}
          <div className="bg-[#0f141f] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Faahfaahinta & Xogta Account-ka
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {account.description || 'Account tayo sarreeya oo wata ciyaartoyda ugu fiican ciyaarta, booster skills buuxa, iyo tababare heer sare ah.'}
            </p>
          </div>

        </div>

        {/* RIGHT: DETAILS, SPECS & BUY ACTION (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
                  #{account.id}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ⚽ {account.team}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {account.title}
              </h1>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Heerka Kooxda</span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400" /> {account.rating}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Qaybta (Division)</span>
                <span className="text-lg font-black text-cyan-400 truncate">
                  {account.division || 'Division 1'}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Coins Ku Jira</span>
                <span className="text-lg font-black text-amber-300">
                  🪙 {account.coinsIncluded || 0}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Lacagta GP-ga</span>
                <span className="text-lg font-black text-emerald-400">
                  ⚡ {account.gpAmount || '1,000,000+'}
                </span>
              </div>
            </div>

            {/* Star Players */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Ciyaartooyda ugu Waaweyn
              </h3>
              <div className="space-y-2">
                {account.starPlayers.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{player}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Cards */}
            {account.specialCards && account.specialCards.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Kaararka Gaarka ah (Epic & Boosters)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {account.specialCards.map((card, idx) => (
                    <span key={idx} className="bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs px-2.5 py-1 rounded-lg font-medium">
                      ✨ {card}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent Price & Buy Button */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase font-bold text-slate-400">Qiimaha Guud</span>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ${account.price}
                </span>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={isSold}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isSold
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 cursor-pointer'
                }`}
              >
                <Gamepad2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                <span>{isSold ? 'WAA LA IIBSADAY' : 'IIBSO ACCOUNT-KAN'}</span>
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Gaarsiin degdeg ah markii lacagta EVC-ga la xaqiijiyo
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        productType="ACCOUNT"
        account={account}
      />

    </div>
  );
}
