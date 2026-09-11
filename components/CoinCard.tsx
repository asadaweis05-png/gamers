import { CoinPackage } from '@/types';
import { Coins, Zap, Sparkles } from 'lucide-react';

interface CoinCardProps {
  coinPackage: CoinPackage;
  onSelect: (pkg: CoinPackage) => void;
}

export default function CoinCard({ coinPackage, onSelect }: CoinCardProps) {
  const isPopular = coinPackage.badge?.includes('Caansan') || coinPackage.badge?.includes('Popular');
  const isBestValue = coinPackage.badge?.includes('Fiican') || coinPackage.badge?.includes('Best');

  return (
    <div
      className={`relative group bg-[#0b0f17] rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isPopular || isBestValue
          ? 'border-amber-500/60 shadow-2xl shadow-amber-500/10 hover:border-amber-400 hover:-translate-y-1'
          : 'border-slate-800 hover:border-slate-700 hover:bg-[#0f1422] hover:-translate-y-1'
      }`}
    >
      {/* Background Gold Glow Effect */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

      {/* Badge */}
      {coinPackage.badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {coinPackage.badge}
          </span>
        </div>
      )}

      <div>
        {/* Coin Icon Visual */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/25 mb-5 group-hover:scale-110 transition-transform">
          <Coins className="w-7 h-7 text-black" strokeWidth={2.3} />
        </div>

        {/* Amount */}
        <div className="mb-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
            {coinPackage.coinsAmount.toLocaleString()}
            <span className="text-sm font-bold text-amber-400 uppercase tracking-normal">Coins</span>
          </h3>
          {coinPackage.bonusCoins ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg inline-block mt-1.5 shadow-sm">
              +{coinPackage.bonusCoins.toLocaleString()} BONUS LACAG LA'AAN AH
            </span>
          ) : (
            <span className="text-xs text-slate-400 block mt-1.5">
              Toos Loogu Shubayo Account-kaaga
            </span>
          )}
        </div>

        {/* Perks list */}
        <ul className="space-y-2 text-xs text-slate-300 my-5">
          <li className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>5 - 15 Daqiiqo Gudaheed</span>
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>100% Ammaan (Kaliya Konami UID)</span>
          </li>
        </ul>
      </div>

      {/* Price & Buy Button */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5 tracking-wider">Qiimaha</span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${coinPackage.price}
          </span>
        </div>

        <button
          onClick={() => onSelect(coinPackage)}
          className="flex-1 max-w-[140px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:scale-[1.03] active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer"
        >
          IIBSO HADDA
        </button>
      </div>
    </div>
  );
}
