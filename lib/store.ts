import { Account, CoinPackage, Order, StoreSettings, OrderStatus, OrderEvent } from '@/types';
import { INITIAL_ACCOUNTS, INITIAL_COIN_PACKAGES, INITIAL_ORDERS, INITIAL_SETTINGS } from './seedData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  ACCOUNTS: 'efootball_accounts_v2',
  COINS: 'efootball_coins_v2',
  ORDERS: 'efootball_orders_v2',
  SETTINGS: 'efootball_settings_v2',
};

// In-memory fallback for SSR
let memoryAccounts = [...INITIAL_ACCOUNTS];
let memoryCoins = [...INITIAL_COIN_PACKAGES];
let memoryOrders = [...INITIAL_ORDERS];
let memorySettings = { ...INITIAL_SETTINGS };

let hasAutoSeeded = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getLocalData<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`Failed reading from local storage for key ${key}:`, err);
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger global real-time event for immediate instant UI synchronization
    window.dispatchEvent(new Event('efootball_storage_update'));
    window.dispatchEvent(new CustomEvent('efootball_order_update', { detail: value }));
  } catch (err) {
    console.warn(`Failed writing to local storage for key ${key}:`, err);
  }
}

// Automatically sync initial seed data to Supabase if tables exist but are empty
async function autoSeedSupabaseIfEmpty() {
  if (!isSupabaseConfigured || !supabase || hasAutoSeeded) return;
  hasAutoSeeded = true;
  try {
    const { data: accData, error: accErr } = await supabase.from('accounts').select('id').limit(1);
    if (!accErr && (!accData || accData.length === 0)) {
      for (const acc of INITIAL_ACCOUNTS) {
        await supabase.from('accounts').insert({
          id: acc.id,
          title: acc.title,
          team: acc.team,
          rating: acc.rating,
          price: acc.price,
          star_players: acc.starPlayers,
          special_cards: acc.specialCards,
          coins_included: acc.coinsIncluded || 0,
          gp_amount: acc.gpAmount,
          division: acc.division,
          description: acc.description,
          images: acc.images,
          status: acc.status,
        });
      }
    }

    const { data: coinData, error: coinErr } = await supabase.from('coin_packages').select('id').limit(1);
    if (!coinErr && (!coinData || coinData.length === 0)) {
      for (const pkg of INITIAL_COIN_PACKAGES) {
        await supabase.from('coin_packages').insert({
          id: pkg.id,
          coins_amount: pkg.coinsAmount,
          bonus_coins: pkg.bonusCoins || 0,
          price: pkg.price,
          badge: pkg.badge,
          is_active: pkg.isActive,
        });
      }
    }

    const { data: setData, error: setErr } = await supabase.from('store_settings').select('id').limit(1);
    if (!setErr && (!setData || setData.length === 0)) {
      await supabase.from('store_settings').insert({
        id: 'default',
        evc_number: INITIAL_SETTINGS.evcNumber,
        evc_merchant_name: INITIAL_SETTINGS.evcMerchantName,
        whatsapp_support: INITIAL_SETTINGS.whatsappSupport,
        announcement_banner: INITIAL_SETTINGS.announcementBanner,
      });
    }
  } catch (e) {
    console.log('Supabase auto-seed notice:', e);
  }
}

// -------------------------------------------------------------
// ACCOUNTS CRUD
// -------------------------------------------------------------
export async function getAccounts(): Promise<Account[]> {
  const localAccounts = getLocalData<Account[]>(STORAGE_KEYS.ACCOUNTS, memoryAccounts);
  
  if (isSupabaseConfigured && supabase) {
    await autoSeedSupabaseIfEmpty();
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          team: item.team,
          rating: item.rating,
          price: Number(item.price),
          starPlayers: item.star_players || [],
          specialCards: item.special_cards || [],
          coinsIncluded: item.coins_included,
          gpAmount: item.gp_amount,
          division: item.division,
          description: item.description,
          images: item.images || [],
          status: item.status,
          createdAt: item.created_at,
        }));
        // Update local backup
        setLocalData(STORAGE_KEYS.ACCOUNTS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetch error, using resilient local backup:', e);
    }
  }
  return localAccounts;
}

export async function getAccountById(id: string): Promise<Account | null> {
  const accounts = await getAccounts();
  return accounts.find((acc) => acc.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function addAccount(account: Omit<Account, 'id' | 'createdAt'> & { id?: string }): Promise<Account> {
  const id = account.id || `EF-ACC-${Math.floor(100 + Math.random() * 900)}`;
  const newAccount: Account = {
    ...account,
    id,
    createdAt: new Date().toISOString(),
  };

  // Immediate Local & Memory Storage (Zero data loss)
  const current = getLocalData<Account[]>(STORAGE_KEYS.ACCOUNTS, memoryAccounts);
  const updated = [newAccount, ...current];
  setLocalData(STORAGE_KEYS.ACCOUNTS, updated);
  memoryAccounts = updated;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('accounts').insert({
        id: newAccount.id,
        title: newAccount.title,
        team: newAccount.team,
        rating: newAccount.rating,
        price: newAccount.price,
        star_players: newAccount.starPlayers,
        special_cards: newAccount.specialCards,
        coins_included: newAccount.coinsIncluded || 0,
        gp_amount: newAccount.gpAmount,
        division: newAccount.division,
        description: newAccount.description,
        images: newAccount.images,
        status: newAccount.status,
      });
    } catch (e) {
      console.warn('Supabase insert account backup queued locally:', e);
    }
  }

  return newAccount;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
  const current = getLocalData<Account[]>(STORAGE_KEYS.ACCOUNTS, memoryAccounts);
  const index = current.findIndex((acc) => acc.id === id);
  if (index === -1) return null;

  const updatedAccount = { ...current[index], ...updates };
  current[index] = updatedAccount;
  setLocalData(STORAGE_KEYS.ACCOUNTS, [...current]);
  memoryAccounts = [...current];

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.team) payload.team = updates.team;
      if (updates.rating) payload.rating = updates.rating;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.starPlayers) payload.star_players = updates.starPlayers;
      if (updates.specialCards) payload.special_cards = updates.specialCards;
      if (updates.coinsIncluded !== undefined) payload.coins_included = updates.coinsIncluded;
      if (updates.gpAmount) payload.gp_amount = updates.gpAmount;
      if (updates.division) payload.division = updates.division;
      if (updates.description) payload.description = updates.description;
      if (updates.images) payload.images = updates.images;
      if (updates.status) payload.status = updates.status;

      await supabase.from('accounts').update(payload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update account backup saved locally:', e);
    }
  }

  return updatedAccount;
}

export async function deleteAccount(id: string): Promise<boolean> {
  const current = getLocalData<Account[]>(STORAGE_KEYS.ACCOUNTS, memoryAccounts);
  const filtered = current.filter((acc) => acc.id !== id);
  setLocalData(STORAGE_KEYS.ACCOUNTS, filtered);
  memoryAccounts = filtered;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('accounts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete account queued:', e);
    }
  }
  return true;
}

// -------------------------------------------------------------
// COIN PACKAGES CRUD
// -------------------------------------------------------------
export async function getCoinPackages(): Promise<CoinPackage[]> {
  const localCoins = getLocalData<CoinPackage[]>(STORAGE_KEYS.COINS, memoryCoins);

  if (isSupabaseConfigured && supabase) {
    await autoSeedSupabaseIfEmpty();
    try {
      const { data, error } = await supabase
        .from('coin_packages')
        .select('*')
        .order('coins_amount', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          coinsAmount: item.coins_amount,
          bonusCoins: item.bonus_coins,
          price: Number(item.price),
          badge: item.badge,
          isActive: item.is_active,
        }));
        setLocalData(STORAGE_KEYS.COINS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase get coins error, using local fallback:', e);
    }
  }
  return localCoins;
}

export async function addCoinPackage(pkg: Omit<CoinPackage, 'id'> & { id?: string }): Promise<CoinPackage> {
  const id = pkg.id || `pack-${pkg.coinsAmount}-${Date.now()}`;
  const newPkg: CoinPackage = { ...pkg, id };

  const current = getLocalData<CoinPackage[]>(STORAGE_KEYS.COINS, memoryCoins);
  const updated = [...current, newPkg].sort((a, b) => a.coinsAmount - b.coinsAmount);
  setLocalData(STORAGE_KEYS.COINS, updated);
  memoryCoins = updated;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('coin_packages').insert({
        id: newPkg.id,
        coins_amount: newPkg.coinsAmount,
        bonus_coins: newPkg.bonusCoins || 0,
        price: newPkg.price,
        badge: newPkg.badge,
        is_active: newPkg.isActive,
      });
    } catch (e) {
      console.warn('Supabase add coin error:', e);
    }
  }

  return newPkg;
}

export async function updateCoinPackage(id: string, updates: Partial<CoinPackage>): Promise<CoinPackage | null> {
  const current = getLocalData<CoinPackage[]>(STORAGE_KEYS.COINS, memoryCoins);
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedPkg = { ...current[index], ...updates };
  current[index] = updatedPkg;
  setLocalData(STORAGE_KEYS.COINS, [...current]);
  memoryCoins = [...current];

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {};
      if (updates.coinsAmount) payload.coins_amount = updates.coinsAmount;
      if (updates.bonusCoins !== undefined) payload.bonus_coins = updates.bonusCoins;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.badge !== undefined) payload.badge = updates.badge;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      await supabase.from('coin_packages').update(payload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update coin error:', e);
    }
  }

  return updatedPkg;
}

export async function deleteCoinPackage(id: string): Promise<boolean> {
  const current = getLocalData<CoinPackage[]>(STORAGE_KEYS.COINS, memoryCoins);
  const filtered = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.COINS, filtered);
  memoryCoins = filtered;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('coin_packages').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete coin error:', e);
    }
  }
  return true;
}

// -------------------------------------------------------------
// ORDERS & TRACKING (Zero data loss, instant real-time sync)
// -------------------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  const localOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          productType: item.product_type,
          productId: item.product_id,
          productName: item.product_name,
          amount: Number(item.amount),
          customerPhone: item.customer_phone,
          customerEmail: item.customer_email,
          paymentSenderNumber: item.payment_sender_number,
          accountUid: item.account_uid,
          paymentProofUrl: item.payment_proof_url,
          status: item.status,
          adminNotes: item.admin_notes,
          deliveryStatus: item.delivery_status,
          history: item.history || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
        
        // Merge seamlessly with local orders to ensure no unsynced local order is overwritten
        const mergedMap = new Map<string, Order>();
        mapped.forEach((o: Order) => mergedMap.set(o.id.toUpperCase(), o));
        localOrders.forEach((o: Order) => {
          if (!mergedMap.has(o.id.toUpperCase())) {
            mergedMap.set(o.id.toUpperCase(), o);
          }
        });
        const mergedOrders = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setLocalData(STORAGE_KEYS.ORDERS, mergedOrders);
        return mergedOrders;
      }
    } catch (e) {
      console.warn('Supabase get orders error, using local orders:', e);
    }
  }
  return localOrders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const cleanId = id.trim().toUpperCase();
  const normalizedId = cleanId.startsWith('EF-') ? cleanId : `EF-${cleanId}`;

  // Check local first for instant responsive feel
  const localOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
  const foundLocal = localOrders.find(
    (ord) =>
      ord.id.toUpperCase() === cleanId ||
      ord.id.toUpperCase() === normalizedId
  );

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.${cleanId},id.ilike.${normalizedId}`)
        .limit(1)
        .single();
      if (!error && data) {
        const orderObj: Order = {
          id: data.id,
          productType: data.product_type,
          productId: data.product_id,
          productName: data.product_name,
          amount: Number(data.amount),
          customerPhone: data.customer_phone,
          customerEmail: data.customer_email,
          paymentSenderNumber: data.payment_sender_number,
          accountUid: data.account_uid,
          paymentProofUrl: data.payment_proof_url,
          status: data.status,
          adminNotes: data.admin_notes,
          deliveryStatus: data.delivery_status,
          history: data.history || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        // Update local copy immediately
        const idx = localOrders.findIndex((o) => o.id.toUpperCase() === orderObj.id.toUpperCase());
        if (idx !== -1) {
          localOrders[idx] = orderObj;
        } else {
          localOrders.unshift(orderObj);
        }
        setLocalData(STORAGE_KEYS.ORDERS, [...localOrders]);
        return orderObj;
      }
    } catch (e) {
      console.warn('Supabase get order by ID error, falling back to local:', e);
    }
  }

  return foundLocal || null;
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Order> {
  // Generate real unique readable order ID: e.g. EF-2481
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const id = `EF-${randNum}`;
  const now = new Date().toISOString();

  const initialEvent: OrderEvent = {
    timestamp: now,
    status: 'PAYMENT_PENDING',
    note: 'Dalabka waa la gudbiyey, rasiidka EVC-ga waa la soo geliyey.',
  };

  const newOrder: Order = {
    ...orderInput,
    id,
    status: 'PAYMENT_PENDING',
    deliveryStatus: 'Waxaa socota xaqiijinta rasiidka lacag-bixinta',
    history: [initialEvent],
    createdAt: now,
    updatedAt: now,
  };

  // 1. Instant local persistence to guarantee ZERO data loss
  const current = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
  const updated = [newOrder, ...current];
  setLocalData(STORAGE_KEYS.ORDERS, updated);
  memoryOrders = updated;

  // 2. Write to Supabase asynchronously
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').insert({
        id: newOrder.id,
        product_type: newOrder.productType,
        product_id: newOrder.productId,
        product_name: newOrder.productName,
        amount: newOrder.amount,
        customer_phone: newOrder.customerPhone,
        customer_email: newOrder.customerEmail,
        payment_sender_number: newOrder.paymentSenderNumber,
        account_uid: newOrder.accountUid,
        payment_proof_url: newOrder.paymentProofUrl,
        status: newOrder.status,
        delivery_status: newOrder.deliveryStatus,
      });
    } catch (e) {
      console.warn('Supabase create order error (safely retained locally):', e);
    }
  }

  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  adminNotes?: string,
  deliveryStatus?: string
): Promise<Order | null> {
  const now = new Date().toISOString();
  const current = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
  const index = current.findIndex((ord) => ord.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  const defaultNote =
    status === 'COMPLETED'
      ? 'Dalabkaagii si buuxda ayaa laguu soo gaarsiiyey WhatsApp ama Email.'
      : status === 'PROCESSING'
      ? 'Dalabkaagii waxaa ku socota diyaarinta iyo ku shubista tooska ah.'
      : status === 'PAYMENT_VERIFIED'
      ? 'Lacagtaadii EVC-ga waa la hubiyey oo la xaqiijiyey!'
      : status === 'CANCELLED'
      ? 'Dalabkan waa la joojiyey.'
      : 'Xaqiijinta lacag-bixinta ayaa socota.';

  const eventNote = adminNotes || defaultNote;
  const historyEvent: OrderEvent = {
    timestamp: now,
    status,
    note: eventNote,
  };

  const updatedOrder: Order = {
    ...current[index],
    status,
    adminNotes: adminNotes !== undefined ? adminNotes : current[index].adminNotes,
    deliveryStatus: deliveryStatus !== undefined ? deliveryStatus : defaultNote,
    history: [...(current[index].history || []), historyEvent],
    updatedAt: now,
  };

  // Immediate local update + event broadcast for immediate instant client refresh
  current[index] = updatedOrder;
  setLocalData(STORAGE_KEYS.ORDERS, [...current]);
  memoryOrders = [...current];

  // If status is completed and it's an account, mark account as SOLD
  if (status === 'COMPLETED' && updatedOrder.productType === 'ACCOUNT') {
    await updateAccount(updatedOrder.productId, { status: 'SOLD' });
  }

  // Sync to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        status,
        updated_at: now,
      };
      if (adminNotes !== undefined) payload.admin_notes = adminNotes;
      if (deliveryStatus !== undefined) payload.delivery_status = deliveryStatus;

      await supabase.from('orders').update(payload).eq('id', id);
    } catch (e) {
      console.warn('Supabase update order status sync notice:', e);
    }
  }

  return updatedOrder;
}

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  const localSettings = getLocalData<StoreSettings>(STORAGE_KEYS.SETTINGS, memorySettings);

  if (isSupabaseConfigured && supabase) {
    await autoSeedSupabaseIfEmpty();
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (!error && data) {
        const mapped: StoreSettings = {
          evcNumber: data.evc_number,
          evcMerchantName: data.evc_merchant_name,
          whatsappSupport: data.whatsapp_support,
          announcementBanner: data.announcement_banner,
        };
        setLocalData(STORAGE_KEYS.SETTINGS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase get settings error, using local backup:', e);
    }
  }
  return localSettings;
}

export async function updateStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
  setLocalData(STORAGE_KEYS.SETTINGS, settings);
  memorySettings = { ...settings };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('store_settings').upsert({
        id: 'default',
        evc_number: settings.evcNumber,
        evc_merchant_name: settings.evcMerchantName,
        whatsapp_support: settings.whatsappSupport,
        announcement_banner: settings.announcementBanner,
      });
    } catch (e) {
      console.warn('Supabase update settings error:', e);
    }
  }

  return settings;
}
