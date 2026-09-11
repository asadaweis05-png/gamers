'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderById } from '@/lib/store';
import { Order, OrderStatus } from '@/types';
import { 
  Search, CheckCircle2, ShieldAlert, 
  Gamepad2, Coins, MessageCircle, Check, Clock, RefreshCw 
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const handleSearch = async (orderIdToSearch?: string, silent = false) => {
    const targetId = (orderIdToSearch || searchId).trim();
    if (!targetId) return;

    if (!silent) {
      setIsLoading(true);
      setErrorMsg('');
      setSearched(true);
    }

    try {
      const found = await getOrderById(targetId);
      if (found) {
        setOrder(found);
        setErrorMsg('');
        setLastRefreshed(new Date().toLocaleTimeString());
      } else if (!silent) {
        setOrder(null);
        setErrorMsg(`Lama helin wax dalab ah oo lambarkiisu yahay "${targetId}". Fadlan hubi lambarkaaga.`);
      }
    } catch (err) {
      if (!silent) {
        setErrorMsg('Khalad ayaa dhacay markii dalabka la raadinayey.');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      handleSearch(initialId);
    }
  }, [initialId]);

  // Real-time synchronization: listen to storage event and poll every 3 seconds for live updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      if (searchId.trim()) {
        handleSearch(searchId.trim(), true);
      }
    };

    window.addEventListener('efootball_storage_update', handleStorageUpdate);

    // Auto-polling interval for live tracking
    const interval = setInterval(() => {
      if (order && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
        handleSearch(order.id, true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('efootball_storage_update', handleStorageUpdate);
      clearInterval(interval);
    };
  }, [order, searchId]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return {
          label: '🟡 Xaqiijinta Lacag-bixinta',
          sub: 'Waxaan eegaynaa rasiidka EVC-ga ee aad soo gelisay.',
          color: 'text-amber-300 bg-amber-950/60 border-amber-500/50',
          step: 1,
        };
      case 'PAYMENT_VERIFIED':
        return {
          label: '🔵 Lacagta Waa La Xaqiijiyey',
          sub: 'Lacagtii waa la hubiyey! Dalabkaagii waa loo diyaarinayaa gaarsiin degdeg ah.',
          color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/50',
          step: 2,
        };
      case 'PROCESSING':
        return {
          label: '🟣 Diyaarinta Dalabka',
          sub: 'Kooxdeenu waxay diyaarinaysaa xogta account-ka ama ku shubista coins-ka.',
          color: 'text-purple-300 bg-purple-950/60 border-purple-500/50',
          step: 2,
        };
      case 'COMPLETED':
        return {
          label: '🟢 Dalabka Waa La Dhameystiray 🎉',
          sub: 'Dalabkaagii si buuxda ayaa laguu soo gaarsiiyey WhatsApp ama Email.',
          color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/50',
          step: 3,
        };
      case 'CANCELLED':
        return {
          label: '🔴 Dalabka Waa La Joojiyey',
          sub: 'Dalabkan waa la joojiyey ama lacagtiisii waa la celiyey.',
          color: 'text-red-300 bg-red-950/60 border-red-500/50',
          step: 0,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1 rounded-full text-xs font-bold text-cyan-400 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Raadinta Dalabka Tooska ah (Realtime)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-2">
          La Soco <span className="text-cyan-400">Dalabkaaga</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Geli lambarkaaga gaarka ah ee dalabka (tusaale <strong className="text-slate-200">EF-1042</strong>) si aad u aragto halka uu marayo.
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-4 sm:p-6 mb-8 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Geli Lambarka Dalabka (tusaale EF-1042)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-base sm:text-lg font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchId.trim()}
            className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'WAA LA RAADINAYAA...' : 'HUBI XAALADDA'}
          </button>
        </form>
      </div>

      {/* Error / Not Found Box */}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 rounded-2xl p-5 text-center text-sm text-red-200 mb-8 flex items-center justify-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl animate-in fade-in duration-300">
          
          {/* Header Row with Order ID & Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block mb-0.5">Lambarka Dalabka</span>
              <h2 className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider flex items-center gap-2">
                #{order.id}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>La dalbaday: {new Date(order.createdAt).toLocaleString()}</span>
                {lastRefreshed && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Toos u cusboonaaday {lastRefreshed}
                  </span>
                )}
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl border ${getStatusBadge(order.status).color} text-xs sm:text-sm font-black uppercase tracking-wider shadow-md`}>
              {getStatusBadge(order.status).label}
            </div>
          </div>

          {/* Step Progress Tracker */}
          {order.status !== 'CANCELLED' && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center sm:text-left">
                Tallaabooyinka Gaarsiinta
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                
                {/* Step 1 */}
                <div className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                  getStatusBadge(order.status).step >= 1 
                    ? 'bg-slate-900 border-cyan-500/50 text-white' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-black ${
                    getStatusBadge(order.status).step >= 1 ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {getStatusBadge(order.status).step > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="text-xs font-bold block">1. Xaqiijinta Lacagta</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Hubinta rasiidka</span>
                </div>

                {/* Step 2 */}
                <div className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                  getStatusBadge(order.status).step >= 2 
                    ? 'bg-slate-900 border-cyan-500/50 text-white' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-black ${
                    getStatusBadge(order.status).step >= 2 ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {getStatusBadge(order.status).step > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-xs font-bold block">2. Diyaarinta</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Diyaarinta dalabka</span>
                </div>

                {/* Step 3 */}
                <div className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                  getStatusBadge(order.status).step >= 3 
                    ? 'bg-slate-900 border-emerald-500/50 text-white' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-black ${
                    getStatusBadge(order.status).step >= 3 ? 'bg-emerald-400 text-black' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {getStatusBadge(order.status).step >= 3 ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                  <span className="text-xs font-bold block">3. Waa La Dhameeyay 🎉</span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Waa laguu soo diray</span>
                </div>

              </div>
            </div>
          )}

          {/* Delivery Note / Status message */}
          <div className="bg-[#151c2b] border border-slate-800 p-4 sm:p-5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Warbixinta Hadda ee Dalabka:
            </h4>
            <p className="text-sm font-semibold text-slate-200">
              {order.deliveryStatus || getStatusBadge(order.status).sub}
            </p>
            {order.status === 'COMPLETED' && (
              <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dalabkaagii waa la dhameeyey! Fadlan hubi WhatsApp-kaaga ama Email-kaaga si aad u hesho xogta buuxda.</span>
              </div>
            )}
          </div>

          {/* Timeline History log */}
          {order.history && order.history.length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Taariikhda Dalabka (Timeline)
              </h4>
              <div className="space-y-2">
                {order.history.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{ev.note}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Waxaad Dalbatay</span>
              <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                {order.productType === 'ACCOUNT' ? (
                  <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{order.productName}</span>
              </div>
              <div className="mt-2 text-slate-400">
                Lacagta la bixiyey: <strong className="text-cyan-400">${order.amount}</strong>
              </div>
            </div>

            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Xogta Xiriirka</span>
              <div className="space-y-1 text-slate-300">
                {order.customerPhone && (
                  <div>WhatsApp: <strong className="text-white">{order.customerPhone}</strong></div>
                )}
                {order.customerEmail && (
                  <div>Email: <strong className="text-white">{order.customerEmail}</strong></div>
                )}
                <div>Laga bixiyey EVC: <strong className="text-emerald-400">{order.paymentSenderNumber}</strong></div>
              </div>
            </div>
          </div>

          {/* Need help button */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/252618889900?text=${encodeURIComponent(`Asc Support, waxaan rabaa inaan wax ka ogaado dalabkayga #${order.id} (${order.productName}).`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Ma u baahan tahay Caawin? Kala hadal WhatsApp</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
