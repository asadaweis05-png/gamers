'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Account, CoinPackage, ProductType } from '@/types';
import { createOrder, getStoreSettings, getCurrentCustomer } from '@/lib/store';
import { 
  X, CheckCircle2, Copy, Check, UploadCloud, AlertCircle, 
  Gamepad2, Coins, ArrowRight, ShieldCheck, MessageCircle, Lock, KeyRound 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: ProductType;
  account?: Account | null;
  coinPackage?: CoinPackage | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  productType,
  account,
  coinPackage,
}: CheckoutModalProps) {
  const router = useRouter();

  // Step state: 1 = Form, 2 = Payment & Proof Upload, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [paymentSenderNumber, setPaymentSenderNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountUid, setAccountUid] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  // Live Store EVC payment settings
  const [evcNumber, setEvcNumber] = useState('061-888-9900');
  const [magacaNumberka, setMagacaNumberka] = useState('Maxamed Cali (eFootball Pro)');

  useEffect(() => {
    async function loadSettings() {
      const set = await getStoreSettings();
      if (set.evcNumber) setEvcNumber(set.evcNumber);
      if (set.evcMerchantName) setMagacaNumberka(set.evcMerchantName);

      const loggedCustomer = getCurrentCustomer();
      if (loggedCustomer) {
        setEmail(loggedCustomer.email);
        if (loggedCustomer.phone) setWhatsapp(loggedCustomer.phone);
      }
    }
    loadSettings();
  }, [isOpen]);

  if (!isOpen) return null;

  const title = productType === 'ACCOUNT' ? account?.title || 'Account' : `${coinPackage?.coinsAmount.toLocaleString()} Coins Package`;
  const price = productType === 'ACCOUNT' ? account?.price || 0 : coinPackage?.price || 0;

  // Handle Step 1 Validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!paymentSenderNumber.trim()) {
      setErrorMsg('Fadlan geli lambarka aad EVC-ga ka soo direyso.');
      return;
    }

    if (!whatsapp.trim() && !email.trim()) {
      setErrorMsg('Fadlan geli ugu yaraan hal hab xiriir: WhatsApp ama Email.');
      return;
    }

    if (email.trim() && !password.trim()) {
      setErrorMsg('Fadlan geli password si laguugu furo account dukaanka ah.');
      return;
    }

    if (productType === 'COINS' && !accountUid.trim()) {
      setErrorMsg('Fadlan geli Konami ID-gaaga ama In-Game User ID/Magacaaga.');
      return;
    }

    setStep(2);
  };

  // Handle Copy EVC Number
  const handleCopy = () => {
    const rawNumber = evcNumber.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawNumber || evcNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Fadlan dooro sawir sax ah (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Final Order Submission
  const handleSubmitOrder = async () => {
    if (!proofImage) {
      setErrorMsg('Fadlan soo geli sawirka rasiidka EVC-ga ka hor inta aadan dirin dalabka.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const order = await createOrder({
        productType,
        productId: productType === 'ACCOUNT' ? (account?.id || 'EF-ACC-UNKNOWN') : (coinPackage?.id || 'pack-custom'),
        productName: title,
        amount: price,
        customerPhone: whatsapp.trim() || undefined,
        customerEmail: email.trim() || undefined,
        customerPassword: password.trim() || undefined,
        paymentSenderNumber: paymentSenderNumber.trim(),
        accountUid: productType === 'COINS' ? accountUid.trim() : undefined,
        paymentProofUrl: proofImage,
      });

      setCreatedOrderId(order.id);
      setStep(3);

      // Trigger Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#FFE600', '#10B981'],
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Khalad ayaa dhacay markii dalabka la dirayey. Fadlan mar kale isku day.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setPaymentSenderNumber('');
    setWhatsapp('');
    setEmail('');
    setPassword('');
    setAccountUid('');
    setProofImage(null);
    setErrorMsg('');
    setCreatedOrderId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0c101a] border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Glowing Header Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800/80 bg-[#0f1422]/90">
          <div className="flex items-center gap-2.5">
            {productType === 'ACCOUNT' ? (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md shadow-cyan-500/10">
                <Gamepad2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md shadow-amber-500/10">
                <Coins className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="font-black text-white text-base sm:text-lg tracking-tight">
                {step === 3 ? 'Dalabka Waa La Xaqiijiyey 🎉' : productType === 'ACCOUNT' ? 'Iibso Account-kan' : 'Iibso Coins eFootball'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {step === 1 ? 'Tallaabada 1: Xogtaada & Account-ka' : step === 2 ? 'Tallaabada 2: Bixi Lacagta & Soo Geli Rasiidka' : 'Dhameystir'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Product Summary Card */}
        {step !== 3 && (
          <div className="bg-[#121827] px-5 sm:px-6 py-3.5 border-b border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              {productType === 'ACCOUNT' && account?.images?.[0] && (
                <img
                  src={account.images[0]}
                  alt="Product"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                />
              )}
              {productType === 'COINS' && (
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
              )}
              <div className="truncate">
                <span className="font-extrabold text-white text-sm block truncate">{title}</span>
                {productType === 'ACCOUNT' && account?.rating && (
                  <span className="text-xs font-bold text-amber-400">⭐ {account.rating} Rating</span>
                )}
                {productType === 'COINS' && coinPackage?.bonusCoins && (
                  <span className="text-xs font-bold text-emerald-400">+{coinPackage.bonusCoins} Bonus</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Wadarta</span>
              <span className="text-xl font-black text-cyan-400">${price}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  1. Lambarka aad EVC-ga ka soo direyso <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tusaale: 061XXXXXXX (Lambarka lacagtu ka bixi doonto)"
                  value={paymentSenderNumber}
                  onChange={(e) => setPaymentSenderNumber(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono shadow-inner"
                  required
                />
              </div>

              {productType === 'COINS' && (
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                    2. eFootball Konami ID ama In-Game User ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Geli UID-gaaga ama Konami ID-gaaga (si coins-ka loogu shubo)"
                    value={accountUid}
                    onChange={(e) => setAccountUid(e.target.value)}
                    className="w-full bg-slate-900/90 border border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono shadow-inner"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ℹ️ Waxaan u baahanahay kaliya ID-gaaga si aan coins-ka kuugu shubno si toos ah oo ammaan ah.
                  </p>
                </div>
              )}

              {/* Email & Password Registration Container */}
              <div className="bg-[#101726] border border-cyan-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Account-ka Dukaanka (Si aad ula socoto dalabyadaada)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="magacaaga@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Password Cusub <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Geli Password aad xusuusan karto"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  🔐 Waxaa si toos ah laguugu furayaa account aad mar kasta ku arki karto dalabyadaadii hore.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lambarka WhatsApp (Halka xogta laguugu soo diri doono)
                </label>
                <input
                  type="tel"
                  placeholder="Tusaale: +252 61XXXXXXX"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Delivery Note */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-900/50 rounded-xl text-xs text-cyan-200/90 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Ka dib markaan xaqiijino lacag-bixintaada, waxaan xogta {productType === 'ACCOUNT' ? 'account-kaaga' : 'coins-kaaga'} kuugu soo diri doonaa WhatsApp-kaaga ama Email-kaaga.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>U GUDBI LACAG-BIXINTA (${price})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT INSTRUCTIONS & PROOF UPLOAD */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Payment instructions box */}
              <div className="bg-[#131b2c] border border-cyan-500/50 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                  Tallaabada 1: Dir Lacagta EVC Plus
                </span>
                <div className="text-2xl font-black text-white mb-3">
                  U dir <span className="text-cyan-400">${price}</span> lambarkan:
                </div>

                {/* EVC Number with 1-click Copy */}
                <div className="flex items-center justify-center gap-2 bg-black/70 border border-slate-700 rounded-xl p-2.5 max-w-sm mx-auto shadow-inner">
                  <span className="font-mono font-bold text-base sm:text-lg text-emerald-400 tracking-wider">
                    {evcNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'WAA LA KOOBIYEEYAY!' : 'KOOBIYEE'}</span>
                  </button>
                </div>
                <span className="text-xs text-slate-300 mt-2.5 block bg-slate-900/90 py-1.5 px-3 rounded-lg border border-slate-800 font-medium">
                  Magaca Numberka: <strong className="text-emerald-400 font-bold">{magacaNumberka}</strong>
                </span>
              </div>

              {/* Upload Proof */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tallaabada 2: Soo Geli Sawirka Rasiidka EVC-ga <span className="text-red-400">*</span>
                </label>

                {proofImage ? (
                  <div className="relative rounded-2xl border border-emerald-500/50 bg-slate-900 p-2.5 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={proofImage}
                        alt="Payment Proof"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-700 shadow-md"
                      />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Rasiidkii Waa La Soo Geliyey
                        </span>
                        <span className="text-[11px] text-slate-400">Diyaar u ah xaqiijinta maamulka</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setProofImage(null)}
                      className="text-xs text-red-400 hover:text-red-300 underline mr-2 cursor-pointer font-bold"
                    >
                      Beddel
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all text-center group shadow-inner">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className="w-9 h-9 text-cyan-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-white mb-0.5">
                      [ SOO GELI SAWIRKA RASIIDKA ]
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Guji halkan si aad sawirka rasiidka uga soo xusho taleefankaaga
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Dib u noqo
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !proofImage}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isSubmitting || !proofImage
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-black shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-95 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'WAA LA DIRAYAA...' : 'DIR DALABKA 🚀'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER RECEIVED SUCCESS */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Dalabkaagii Waa La Helay! 🎉</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                  Lacag-bixintaadii waxaa hadda xaqiijinaya maamulka. Waxaa laguugu furay account aad ku maamusho dalabyadaada.
                </p>
              </div>

              {/* Order Number Box */}
              <div className="bg-[#151c2b] border border-cyan-500/50 rounded-2xl p-4 max-w-xs mx-auto shadow-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Lambarkaaga Dalabka
                </span>
                <span className="font-mono text-2xl font-black text-cyan-400 tracking-wider">
                  #{createdOrderId}
                </span>
                <div className="mt-2 text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Xaaladda: Xaqiijinta Lacag-bixinta
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleResetAndClose();
                    router.push(`/track?id=${createdOrderId}`);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  LA SOCO XAALADDA DALABKA
                </button>
                <a
                  href={`https://wa.me/252618889900?text=${encodeURIComponent(`Asc Support, waxaan dalbaday dalabka #${createdOrderId} oo ah ${title}. Lambarka aan ka bixiyey waa ${paymentSenderNumber}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors inline-flex"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Kala Hadal WhatsApp Support</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
