import Link from 'next/link';
import { ShieldCheck, MessageCircle, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070a] border-t border-slate-850 pt-12 pb-24 md:pb-12 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-black">
                EF
              </div>
              <span className="font-extrabold text-white text-lg tracking-wide">
                eFootball Shop Somali
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Suuqa ugu weyn uguna aaminka badan ee lagu iibsado Accounts-ka iyo Coins-ka eFootball Mobile. Lacag-bixin EVC Plus oo xaqiijin degdeg ah leh.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Adeegyada Degdegga ah</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/accounts" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Iibso Accounts eFootball
                </Link>
              </li>
              <li>
                <Link href="/coins" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Iibso Coins eFootball
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> La Soco Xaaladda Dalabkaaga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Lacag-bixinta & Amniga</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>EVC Plus La Hubiyey (061XXXXXXX)</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Toos ugu diris WhatsApp ama Email</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                🔒 Xogtaada iyo sirta account-kaaga cidna lama wadaagno.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} eFootball Digital Market Somali. Xuquuqda oo dhan waa dhowran tahay.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-slate-300 transition-colors">
              Qaybta Maamulka (Admin)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
