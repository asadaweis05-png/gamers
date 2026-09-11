'use client';

import { useState, useEffect } from 'react';
import { 
  getOrders, getAccounts, getCoinPackages, getStoreSettings,
  updateOrderStatus, addAccount, updateAccount, deleteAccount,
  addCoinPackage, updateCoinPackage, deleteCoinPackage, updateStoreSettings
} from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Order, Account, CoinPackage, StoreSettings, OrderStatus } from '@/types';
import { 
  ShieldCheck, Gamepad2, Coins, Search, Eye, CheckCircle2, 
  Plus, Edit2, Trash2, Settings, Lock, Mail,
  MessageCircle, RefreshCw, X, Save
} from 'lucide-react';

const ADMIN_EMAIL = 'asadaweis082@gmail.com';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab: 'ORDERS' | 'ACCOUNTS' | 'COINS' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ACCOUNTS' | 'COINS' | 'SETTINGS'>('ORDERS');

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    evcNumber: '061-888-9900',
    evcMerchantName: 'Maxamed Cali (eFootball Pro)',
    whatsappSupport: '+252 61 888 9900',
    announcementBanner: '⚡ Xaqiijin degdeg ah & u dirid toos ah WhatsApp ama Email!',
  });

  // Filters & Modals
  const [orderFilter, setOrderFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deliveryNoteInput, setDeliveryNoteInput] = useState('');

  // Account Modal (Create / Edit)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountFormData, setAccountFormData] = useState<Partial<Account>>({
    title: '',
    team: '',
    rating: 3100,
    price: 35,
    starPlayers: ['Messi', 'Ronaldo'],
    specialCards: ['Epic Booster'],
    coinsIncluded: 500,
    gpAmount: '1,500,000 GP',
    division: 'Division 1',
    description: '',
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'],
    status: 'AVAILABLE',
  });
  const [starPlayersString, setStarPlayersString] = useState('Messi, Ronaldo, Mbappé');
  const [specialCardsString, setSpecialCardsString] = useState('Big Time Messi, Epic Ronaldo');
  const [imagesString, setImagesString] = useState('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80');
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Coin Modal (Create / Edit)
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [coinFormData, setCoinFormData] = useState<Partial<CoinPackage>>({
    coinsAmount: 3000,
    bonusCoins: 200,
    price: 25,
    badge: 'Ugu Caansan 🔥',
    isActive: true,
  });
  const [isEditingCoin, setIsEditingCoin] = useState(false);

  // Settings Feedback
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    // Check existing Supabase session
    async function checkSession() {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback: check sessionStorage
        if (sessionStorage.getItem('efootball_admin_auth') === 'true') {
          setIsAuthenticated(true);
          fetchAdminData();
        }
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.email?.toLowerCase() === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        sessionStorage.setItem('efootball_admin_auth', 'true');
        fetchAdminData();
      }
    }
    checkSession();
  }, []);

  async function fetchAdminData() {
    const [ord, acc, coins, set] = await Promise.all([
      getOrders(),
      getAccounts(),
      getCoinPackages(),
      getStoreSettings(),
    ]);
    setOrders(ord);
    setAccounts(acc);
    setCoinPackages(coins);
    setSettings(set);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const email = adminEmail.trim().toLowerCase();

    // Check if this email is allowed
    if (email !== ADMIN_EMAIL) {
      setAuthError('Email-kan lama ogola inuu galo bogga maamulka. Kaliya admin-ka ayaa gali kara.');
      setAuthLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Fallback for local dev without Supabase
      setAuthError('Supabase laguma xirin. Fadlan hubi inaad Supabase si sax ah u habeysay.');
      setAuthLoading(false);
      return;
    }

    try {
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: adminPassword,
      });

      if (error) {
        // If user doesn't exist, sign up first
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: adminPassword,
          });
          if (signUpError) {
            setAuthError(`Khalad: ${signUpError.message}`);
            setAuthLoading(false);
            return;
          }
          // Signed up successfully
          setIsAuthenticated(true);
          sessionStorage.setItem('efootball_admin_auth', 'true');
          fetchAdminData();
        } else {
          setAuthError(`Khalad: ${error.message}`);
          setAuthLoading(false);
          return;
        }
      } else if (data.session) {
        setIsAuthenticated(true);
        sessionStorage.setItem('efootball_admin_auth', 'true');
        fetchAdminData();
      }
    } catch (err: any) {
      setAuthError('Khalad aan la fileyn ayaa dhacay. Fadlan isku day mar kale.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('efootball_admin_auth');
  };

  // Status Change Handler
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, customNote?: string) => {
    await updateOrderStatus(orderId, status, customNote);
    await fetchAdminData();
    if (editingOrder && editingOrder.id === orderId) {
      setEditingOrder(null);
    }
  };

  // Account Form Handlers
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const starArr = starPlayersString.split(',').map((s) => s.trim()).filter(Boolean);
    const specialArr = specialCardsString.split(',').map((s) => s.trim()).filter(Boolean);
    const imgArr = imagesString.split('\n').map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...accountFormData,
      starPlayers: starArr,
      specialCards: specialArr,
      images: imgArr.length > 0 ? imgArr : ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'],
    } as any;

    if (isEditingAccount && accountFormData.id) {
      await updateAccount(accountFormData.id, payload);
    } else {
      await addAccount(payload);
    }

    setIsAccountModalOpen(false);
    await fetchAdminData();
  };

  const handleOpenEditAccount = (acc: Account) => {
    setAccountFormData(acc);
    setStarPlayersString(acc.starPlayers.join(', '));
    setSpecialCardsString(acc.specialCards.join(', '));
    setImagesString(acc.images.join('\n'));
    setIsEditingAccount(true);
    setIsAccountModalOpen(true);
  };

  const handleOpenNewAccount = () => {
    setAccountFormData({
      title: '',
      team: '',
      rating: 3150,
      price: 45,
      coinsIncluded: 500,
      gpAmount: '2,000,000 GP',
      division: 'Division 1',
      description: '',
      status: 'AVAILABLE',
    });
    setStarPlayersString('Messi (Big Time 105), Ronaldo (Epic 104), Mbappé (104)');
    setSpecialCardsString('Big Time Messi, Epic Booster CR7');
    setImagesString('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80');
    setIsEditingAccount(false);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm(`Ma hubtaa inaad tirtirto account #${id}?`)) {
      await deleteAccount(id);
      await fetchAdminData();
    }
  };

  // Coin Form Handlers
  const handleSaveCoinPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingCoin && coinFormData.id) {
      await updateCoinPackage(coinFormData.id, coinFormData);
    } else {
      await addCoinPackage(coinFormData as any);
    }
    setIsCoinModalOpen(false);
    await fetchAdminData();
  };

  const handleOpenEditCoin = (pkg: CoinPackage) => {
    setCoinFormData(pkg);
    setIsEditingCoin(true);
    setIsCoinModalOpen(true);
  };

  const handleOpenNewCoin = () => {
    setCoinFormData({
      coinsAmount: 5000,
      bonusCoins: 500,
      price: 40,
      badge: 'Qiimaha Fiican ⭐',
      isActive: true,
    });
    setIsEditingCoin(false);
    setIsCoinModalOpen(true);
  };

  const handleDeleteCoin = async (id: string) => {
    if (confirm('Ma hubtaa inaad tirtirto xirmo coins-kan?')) {
      await deleteCoinPackage(id);
      await fetchAdminData();
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings(settings);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // -------------------------------------------------------------
  // AUTH LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] bg-grid-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f141f] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white text-center tracking-tight mb-1">
            Bogga Maamulka (Admin)
          </h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Geli email-kaaga iyo password-kaaga si aad u maamusho dalabyada, accounts-ka, iyo rasiidadaha lacag-bixinta.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address (Admin Only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'WAA LA HUBINAYAA...' : 'GAL BOGGA MAAMULKA'}
            </button>
          </form>

          <div className="mt-6 text-center text-[11px] text-slate-500">
            🔒 Boggan waxaa kaliya geli kara admin-ka dukaanka
          </div>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'ALL' && o.status !== orderFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        o.paymentSenderNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingOrdersCount = orders.filter((o) => o.status === 'PAYMENT_PENDING').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#07090e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Maamulka <span className="text-cyan-400">Dukaanka</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Xaqiijinta lacag-bixinta, dalabyada macaamiisha, accounts-ka iyo coins-ka
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cusboonaysii</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Ka Bax (Logout)
          </button>
        </div>
      </div>

      {/* Overview Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
        <div className="bg-[#0f141f] border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Dalabyada Sugaya</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            {pendingOrdersCount}
            {pendingOrdersCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />}
          </span>
        </div>
        <div className="bg-[#0f141f] border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Wadarta Dakhliga</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#0f141f] border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Accounts Diyaar ah</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400">
            {accounts.filter((a) => a.status === 'AVAILABLE').length} / {accounts.length}
          </span>
        </div>
        <div className="bg-[#0f141f] border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Wadarta Dalabyada</span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Tab Navigation Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>📦 Dalabyada ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px]">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'ACCOUNTS'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Accounts-ka ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COINS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'COINS'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Xirmooyinka Coins ({coinPackages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Habaynta EVC & Dukaanka</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ORDERS MANAGEMENT                                  */}
      {/* ========================================================= */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f141f] border border-slate-800 p-3 sm:p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Ku raadi ID, magac, taleefan..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['ALL', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    orderFilter === st
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Dhammaan' : st === 'PAYMENT_PENDING' ? 'Sugaya' : st === 'PAYMENT_VERIFIED' ? 'La Hubiyey' : st === 'PROCESSING' ? 'Socda' : st === 'COMPLETED' ? 'Dhamaaday' : 'La Joojiyey'}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table / List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-[#0f141f] border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
              Wax dalab ah oo shuruudaha buuxiyey lama helin.
            </div>
          ) : (
            <div className="bg-[#0f141f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                      <th className="p-3 sm:p-4">Lambarka</th>
                      <th className="p-3 sm:p-4">Nooca & Sheyga</th>
                      <th className="p-3 sm:p-4">Macmiilka & Bixinta</th>
                      <th className="p-3 sm:p-4">Qiimaha</th>
                      <th className="p-3 sm:p-4">Rasiidka</th>
                      <th className="p-3 sm:p-4">Xaaladda</th>
                      <th className="p-3 sm:p-4 text-right">Tallaabada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Order ID & Date */}
                        <td className="p-3 sm:p-4 font-mono font-black text-cyan-400">
                          #{ord.id}
                          <span className="text-[10px] block font-sans font-normal text-slate-500">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="p-3 sm:p-4">
                          <span className="font-bold text-white block max-w-xs truncate">{ord.productName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Nooca: {ord.productType} {ord.accountUid ? `(UID: ${ord.accountUid})` : ''}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="p-3 sm:p-4">
                          <div className="space-y-0.5">
                            {ord.customerPhone && (
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <a
                                  href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Asc Macmiil, ku saabsan dalabkaaga #${ord.id}:`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  {ord.customerPhone}
                                </a>
                              </div>
                            )}
                            {ord.customerEmail && (
                              <div className="text-slate-400">{ord.customerEmail}</div>
                            )}
                            <div className="text-[10px] text-amber-300 font-mono">
                              Laga bixiyey: {ord.paymentSenderNumber}
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-3 sm:p-4 font-black text-white text-sm">
                          ${ord.amount}
                        </td>

                        {/* Proof */}
                        <td className="p-3 sm:p-4">
                          {ord.paymentProofUrl ? (
                            <button
                              onClick={() => setSelectedProofOrder(ord)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Arag Rasiidka</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Rasiid ma jiro</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3 sm:p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : ord.status === 'PAYMENT_PENDING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                              : ord.status === 'PAYMENT_VERIFIED'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              : ord.status === 'PROCESSING'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {ord.status === 'PAYMENT_PENDING' ? 'Sugaya' : ord.status === 'PAYMENT_VERIFIED' ? 'La Hubiyey' : ord.status === 'PROCESSING' ? 'Socda' : ord.status === 'COMPLETED' ? 'Dhamaaday' : 'La Joojiyey'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === 'PAYMENT_PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'PAYMENT_VERIFIED')}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[11px] uppercase transition-all cursor-pointer"
                              >
                                Hubi
                              </button>
                            )}

                            {ord.status === 'PAYMENT_VERIFIED' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                                className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-black text-[11px] uppercase transition-all cursor-pointer"
                              >
                                Diyaari
                              </button>
                            )}

                            {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                              <button
                                onClick={() => {
                                  setEditingOrder(ord);
                                  setDeliveryNoteInput(ord.adminNotes || 'Waxa loogu diray WhatsApp');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase transition-all cursor-pointer"
                              >
                                Dhameystir
                              </button>
                            )}

                            {ord.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-[11px] transition-colors cursor-pointer"
                              >
                                Jooji
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACCOUNTS INVENTORY MANAGEMENT                      */}
      {/* ========================================================= */}
      {activeTab === 'ACCOUNTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Dhammaan Accounts-ka ({accounts.length})
            </h2>
            <button
              onClick={handleOpenNewAccount}
              className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ku Dar Account Cusub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-[#0f141f] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-900">
                    <img src={acc.images[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 text-amber-400 text-xs font-black px-2 py-0.5 rounded">
                      ⭐ {acc.rating}
                    </span>
                    <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded ${
                      acc.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {acc.status === 'AVAILABLE' ? 'DIYAAR AH' : 'WAA LA IIBSADAY'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-black text-white text-sm truncate">{acc.title}</h3>
                    <span className="text-xs font-mono text-cyan-400">#{acc.id}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">⚽ {acc.team}</div>

                  <div className="text-xs text-slate-300 space-y-1 mb-3">
                    {acc.starPlayers.slice(0, 2).map((p, i) => (
                      <div key={i} className="truncate">🔥 {p}</div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-black text-white">${acc.price}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-800/80 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COIN PACKAGES MANAGEMENT                           */}
      {/* ========================================================= */}
      {activeTab === 'COINS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              Xirmooyinka Coins-ka
            </h2>
            <button
              onClick={handleOpenNewCoin}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ku Dar Xirmo Coins</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coinPackages.map((pkg) => (
              <div key={pkg.id} className="bg-[#0f141f] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black text-white">
                      {pkg.coinsAmount.toLocaleString()} Coins
                    </span>
                    {pkg.badge && (
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  {pkg.bonusCoins ? (
                    <span className="text-xs font-bold text-emerald-400 block mb-2">
                      +{pkg.bonusCoins.toLocaleString()} Bonus Ku Jira
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-400 block">
                    Xaaladda: {pkg.isActive ? '🟢 Dukaanka Ka Muuqda' : '🔴 Qarsoon'}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
                  <span className="text-2xl font-black text-cyan-400">${pkg.price}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditCoin(pkg)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoin(pkg.id)}
                      className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-800/80 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PAYMENT & STORE SETTINGS                           */}
      {/* ========================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-[#0f141f] border border-slate-800 rounded-3xl p-6 max-w-2xl mx-auto shadow-2xl">
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Habaynta Lacag-bixinta & Taageerada Dukaanka
          </h2>

          {settingsSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Xogtii si guul leh ayaa loo keydiyey!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Lambarka EVC Plus ee Macaamiishu Lacagta ku soo dirayaan
              </label>
              <input
                type="text"
                value={settings.evcNumber}
                onChange={(e) => setSettings({ ...settings, evcNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Magaca Numberka (EVC Account Name)
              </label>
              <input
                type="text"
                value={settings.evcMerchantName}
                onChange={(e) => setSettings({ ...settings, evcMerchantName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Lambarka WhatsApp Support (oo wata +252)
              </label>
              <input
                type="text"
                value={settings.whatsappSupport}
                onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Qoraalka Ogeysiiska Sare ee Dukaanka
              </label>
              <input
                type="text"
                value={settings.announcementBanner}
                onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>KEYDI HABAYNTA DUKAANKA</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: VIEW PAYMENT PROOF SCREENSHOT                    */}
      {/* ========================================================= */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-[#0f141f] border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-white text-base">Sawirka Rasiidka Lacag-bixinta</h3>
                <span className="text-xs font-mono text-cyan-400">Dalabka #{selectedProofOrder.id} (${selectedProofOrder.amount})</span>
              </div>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-xl bg-black/80 p-2 flex items-center justify-center mb-4">
              <img
                src={selectedProofOrder.paymentProofUrl}
                alt="Payment Proof"
                className="max-h-[50vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="text-slate-300">
                EVC-ga soo diray: <strong className="text-emerald-400 font-mono">{selectedProofOrder.paymentSenderNumber}</strong>
              </div>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedProofOrder.id, 'PAYMENT_VERIFIED');
                  setSelectedProofOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase text-xs cursor-pointer"
              >
                Xaqiiji Lacagta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: COMPLETE ORDER & ADD DELIVERY NOTE               */}
      {/* ========================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-[#0f141f] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Dhameystir Dalabka 🎉</h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Qor faahfaahinta gaarsiinta dalabka #{editingOrder.id} ({editingOrder.productName}):
            </p>

            <div className="mb-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200">
              <strong className="block mb-1">⚠️ Muhiim:</strong>
              Qoraalkan waxaa macmiilku ka arki doonaa bogga &quot;La Soco Dalabka&quot; markuu dalabkiisa hubi doono. Halkan ku qor xogta account-ka ama wixii macmiilku u baahan yahay (tusaale: Email, Password, Konami ID, iwm).
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                📝 Qoraalka Faahfaahinta (Macmiilka ayaa u muuqanaya)
              </label>
              <textarea
                rows={5}
                value={deliveryNoteInput}
                onChange={(e) => setDeliveryNoteInput(e.target.value)}
                placeholder={"Tusaale: Xogta Account-ka\n\nEmail: player123@gmail.com\nPassword: MySecurePass456\nKonami ID: 1234567890\n\nKu raaxayso ciyaarta! 🎮"}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Ka Noqo
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(editingOrder.id, 'COMPLETED', deliveryNoteInput)}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase cursor-pointer"
              >
                ✅ Xaqiiji Dhameystirka
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT ACCOUNT INVENTORY                     */}
      {/* ========================================================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full bg-[#0f141f] border border-slate-800 rounded-3xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                {isEditingAccount ? 'Wax Ka Beddel Account' : 'Ku Dar Account Cusub'}
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Magaca Account-ka</label>
                <input
                  type="text"
                  placeholder="Tusaale: SHAX HEER SARE #001"
                  value={accountFormData.title}
                  onChange={(e) => setAccountFormData({ ...accountFormData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Kooxda / Club</label>
                  <input
                    type="text"
                    placeholder="Tusaale: Real Madrid / FC Barcelona"
                    value={accountFormData.team}
                    onChange={(e) => setAccountFormData({ ...accountFormData, team: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Rating-ka Guud</label>
                  <input
                    type="number"
                    value={accountFormData.rating}
                    onChange={(e) => setAccountFormData({ ...accountFormData, rating: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Qiimaha ($USD)</label>
                  <input
                    type="number"
                    value={accountFormData.price}
                    onChange={(e) => setAccountFormData({ ...accountFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Xaaladda</label>
                  <select
                    value={accountFormData.status}
                    onChange={(e) => setAccountFormData({ ...accountFormData, status: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                  >
                    <option value="AVAILABLE">DIYAAR AH (AVAILABLE)</option>
                    <option value="SOLD">WAA LA IIBSADAY (SOLD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">
                  Ciyaartooyda ugu Muhiimsan (Kala saar hakad ",")
                </label>
                <input
                  type="text"
                  value={starPlayersString}
                  onChange={(e) => setStarPlayersString(e.target.value)}
                  placeholder="Messi (105), Ronaldo (104), Mbappé (104)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">
                  Kaararka Gaarka ah (Kala saar hakad ",")
                </label>
                <input
                  type="text"
                  value={specialCardsString}
                  onChange={(e) => setSpecialCardsString(e.target.value)}
                  placeholder="Big Time Messi, Epic Booster Ronaldo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Coins Ku Jira</label>
                  <input
                    type="number"
                    value={accountFormData.coinsIncluded}
                    onChange={(e) => setAccountFormData({ ...accountFormData, coinsIncluded: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Qaybta (Division)</label>
                  <input
                    type="text"
                    value={accountFormData.division}
                    onChange={(e) => setAccountFormData({ ...accountFormData, division: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">
                  Sawirada Account-ka (Hal URL sadarkasta)
                </label>
                <textarea
                  rows={2}
                  value={imagesString}
                  onChange={(e) => setImagesString(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Faahfaahin Guud</label>
                <textarea
                  rows={2}
                  value={accountFormData.description}
                  onChange={(e) => setAccountFormData({ ...accountFormData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  Keydi Account-ka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT COIN PACKAGES                         */}
      {/* ========================================================= */}
      {isCoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-[#0f141f] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="font-black text-white text-base">
                {isEditingCoin ? 'Wax Ka Beddel Xirmada' : 'Xirmo Coins Cusub'}
              </h3>
              <button
                onClick={() => setIsCoinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoinPackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Tirada Coins-ka</label>
                <input
                  type="number"
                  value={coinFormData.coinsAmount}
                  onChange={(e) => setCoinFormData({ ...coinFormData, coinsAmount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Bonus Coins</label>
                  <input
                    type="number"
                    value={coinFormData.bonusCoins}
                    onChange={(e) => setCoinFormData({ ...coinFormData, bonusCoins: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-300 mb-1">Qiimaha ($USD)</label>
                  <input
                    type="number"
                    value={coinFormData.price}
                    onChange={(e) => setCoinFormData({ ...coinFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-300 mb-1">Summadda (Tusaale: Ugu Caansan 🔥)</label>
                <input
                  type="text"
                  value={coinFormData.badge}
                  onChange={(e) => setCoinFormData({ ...coinFormData, badge: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCoinModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase rounded-xl cursor-pointer"
                >
                  Keydi Xirmada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
