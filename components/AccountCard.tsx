import Link from 'next/link';
import { Account } from '@/types';
import { Star, Flame, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
  const isSold = account.status === 'SOLD';

  return (
    <div className={`group relative bg-[#0b0f17] rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
      isSold 
        ? 'border-slate-800/60 opacity-65' 
        : 'border-slate-800 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1'
    }`}>
      {/* Account Image / Screenshot */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={account.images[0] || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'}
          alt={account.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/30 to-black/40" />

        {/* Rating Badge */}
        <div className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md border border-amber-500/50 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xl">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-300 tracking-wider">
            {account.rating} RATING
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3.5 right-3.5">
          {isSold ? (
            <span className="bg-red-950/90 text-red-300 border border-red-800 text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-wider shadow-md">
              WAA LA IIBSADAY
            </span>
          ) : (
            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-wider flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DIYAAR AH
            </span>
          )}
        </div>

        {/* Team Tag */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 truncate bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
            ⚽ {account.team}
          </span>
          {account.division && (
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
              {account.division}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-black text-lg text-white group-hover:text-cyan-400 transition-colors truncate tracking-tight">
              {account.title}
            </h3>
            <span className="text-[11px] font-mono font-bold text-cyan-400/80 shrink-0">
              #{account.id}
            </span>
          </div>

          {/* Star Players List */}
          <div className="space-y-1.5 my-3.5">
            {account.starPlayers.slice(0, 3).map((player, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-[#121824] border border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{player}</span>
              </div>
            ))}
          </div>

          {/* Additional Features Pills */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mb-4">
            {account.coinsIncluded ? (
              <span className="bg-amber-950/40 text-amber-300 border border-amber-800/50 px-2.5 py-0.5 rounded-lg font-medium">
                🪙 {account.coinsIncluded} Coins
              </span>
            ) : null}
            {account.gpAmount && (
              <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-0.5 rounded-lg">
                ⚡ {account.gpAmount}
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5 tracking-wider">Qiimaha</span>
            <span className="text-2xl font-black text-white tracking-tight">
              ${account.price}
            </span>
          </div>

          <Link
            href={`/accounts/${account.id}`}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isSold
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/20 hover:scale-[1.03] active:scale-95'
            }`}
          >
            <span>ARAG ACCOUNT-KA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
