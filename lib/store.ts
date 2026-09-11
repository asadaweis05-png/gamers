import { Account, CoinPackage, Order, StoreSettings, OrderStatus, OrderEvent, CustomerUser } from '@/types';
import { INITIAL_ACCOUNTS, INITIAL_COIN_PACKAGES, INITIAL_ORDERS, INITIAL_SETTINGS } from './seedData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  ACCOUNTS: 'efootball_accounts_v3',
  COINS: 'efootball_coins_v3',
  ORDERS: 'efootball_orders_v3',
  SETTINGS: 'efootball_settings_v3',
  CUSTOMERS: 'efootball_customers_v3',
  CURRENT_USER: 'efootball_current_user_v3',
};

// In-memory fallback for SSR
let memoryAccounts = [...INITIAL_ACCOUNTS];
let memoryCoins = [...INITIAL_COIN_PACKAGES];
let memoryOrders = [...INITIAL_ORDERS];
let memorySettings = { ...INITIAL_SETTINGS };
let memoryCustomers: CustomerUser[] = [];
let memoryCurrentUser: CustomerUser | null = null;

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
    window.dispatchEvent(new Event('efootball_storage_update'));
    window.dispatchEvent(new CustomEvent('efootball_order_update', { detail: value }));
  } catch (err) {
    console.warn(`Failed writing to local storage for key ${key}:`, err);
  }
}

// -------------------------------------------------------------
// CUSTOMER AUTH & AUTO-REGISTRATION
// -------------------------------------------------------------
export function getCurrentCustomer(): CustomerUser | null {
  return getLocalData<CustomerUser | null>(STORAGE_KEYS.CURRENT_USER, memoryCurrentUser);
}

export function logoutCustomer(): void {
  if (isBrowser()) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    memoryCurrentUser = null;
    window.dispatchEvent(new Event('efootball_storage_update'));
  }
}

export async function registerOrLoginCustomer(
  email: string,
  password?: string,
  phone?: string
): Promise<CustomerUser> {
  const cleanEmail = email.trim().toLowerCase();
  const customers = getLocalData<CustomerUser[]>(STORAGE_KEYS.CUSTOMERS, memoryCustomers);
  let customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);

  if (!customer) {
    customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      email: cleanEmail,
      phone: phone?.trim(),
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
    setLocalData(STORAGE_KEYS.CUSTOMERS, customers);
    memoryCustomers = customers;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('customers').insert({
          id: customer.id,
          email: customer.email,
          phone: customer.phone,
        });
      } catch (e) {
        console.warn('Supabase customer insert notice:', e);
      }
    }
  } else if (phone && !customer.phone) {
    customer.phone = phone.trim();
    setLocalData(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // Set as current logged in user
  setLocalData(STORAGE_KEYS.CURRENT_USER, customer);
  memoryCurrentUser = customer;
  return customer;
}

// Helper to prevent hanging Vercel serverless functions with a 2-second timeout
function withTimeout<T = any>(promise: PromiseLike<T>, timeoutMs: number = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Supabase query timeout'));
    }, timeoutMs);
    Promise.resolve(promise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Automatically sync initial seed data to Supabase if tables exist but are empty
async function autoSeedSupabaseIfEmpty() {
  if (!isSupabaseConfigured || !supabase || hasAutoSeeded) return;
  hasAutoSeeded = true;
  try {
    const { data: accData, error: accErr } = await withTimeout(supabase.from('accounts').select('id').limit(1));
    if (!accErr && (!accData || accData.length === 0)) {
      const accInserts = INITIAL_ACCOUNTS.map((acc) => ({
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
      }));
      await supabase.from('accounts').insert(accInserts);
    }

    const { data: coinData, error: coinErr } = await withTimeout(supabase.from('coin_packages').select('id').limit(1));
    if (!coinErr && (!coinData || coinData.length === 0)) {
      const coinInserts = INITIAL_COIN_PACKAGES.map((pkg) => ({
        id: pkg.id,
        coins_amount: pkg.coinsAmount,
        bonus_coins: pkg.bonusCoins || 0,
        price: pkg.price,
        badge: pkg.badge,
        is_active: pkg.isActive,
      }));
      await supabase.from('coin_packages').insert(coinInserts);
    }

    const { data: setData, error: setErr } = await withTimeout(supabase.from('store_settings').select('id').limit(1));
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
    console.warn('Supabase auto-seed notice (bypassed smoothly):', e);
  }
}

// -------------------------------------------------------------
// ACCOUNTS CRUD
// -------------------------------------------------------------
export async function getAccounts(): Promise<Account[]> {
  const localAccounts = getLocalData<Account[]>(STORAGE_KEYS.ACCOUNTS, memoryAccounts);
  
  if (isSupabaseConfigured && supabase) {
    autoSeedSupabaseIfEmpty().catch(() => {});
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false }),
        2500
      );
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
    autoSeedSupabaseIfEmpty().catch(() => {});
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('coin_packages')
          .select('*')
          .order('coins_amount', { ascending: true }),
        2500
      );
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
// ORDERS & TRACKING
// -------------------------------------------------------------
export async function getOrders(customerId?: string): Promise<Order[]> {
  const localOrders = getLocalData<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);

  let allOrders = localOrders;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }),
        2500
      );
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          productType: item.product_type,
          productId: item.product_id,
          productName: item.product_name,
          amount: Number(item.amount),
          customerPhone: item.customer_phone,
          customerEmail: item.customer_email,
          customerId: item.customer_id,
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
        
        const mergedMap = new Map<string, Order>();
        mapped.forEach((o: Order) => mergedMap.set(o.id.toUpperCase(), o));
        localOrders.forEach((o: Order) => {
          if (!mergedMap.has(o.id.toUpperCase())) {
            mergedMap.set(o.id.toUpperCase(), o);
          }
        });
        allOrders = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLocalData(STORAGE_KEYS.ORDERS, allOrders);
      }
    } catch (e) {
      console.warn('Supabase get orders error, using local orders:', e);
    }
  }

  if (customerId) {
    return allOrders.filter((o) => o.customerId === customerId);
  }
  return allOrders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const cleanId = id.trim().toUpperCase();
  const normalizedId = cleanId.startsWith('EF-') ? cleanId : `EF-${cleanId}`;

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
          customerId: data.customer_id,
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
  orderInput: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { customerPassword?: string }
): Promise<Order> {
  let customerId = orderInput.customerId;

  // Auto-register customer account if email is provided
  if (orderInput.customerEmail) {
    try {
      const customer = await registerOrLoginCustomer(
        orderInput.customerEmail,
        orderInput.customerPassword,
        orderInput.customerPhone
      );
      customerId = customer.id;
    } catch (e) {
      console.warn('Auto customer registration note:', e);
    }
  }

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const id = `EF-${randNum}`;
  const now = new Date().toISOString();

  const initialEvent: OrderEvent = {
    timestamp: now,
    status: 'PAYMENT_PENDING',
    note: 'Dalabka waa la gudbiyey, rasiidka EVC-ga waa la soo geliyey.',
  };

  const newOrder: Order = {
    productType: orderInput.productType,
    productId: orderInput.productId,
    productName: orderInput.productName,
    amount: orderInput.amount,
    customerPhone: orderInput.customerPhone,
    customerEmail: orderInput.customerEmail,
    customerId,
    paymentSenderNumber: orderInput.paymentSenderNumber,
    accountUid: orderInput.accountUid,
    paymentProofUrl: orderInput.paymentProofUrl,
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
        customer_id: newOrder.customerId,
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
      ? 'Dalabkaagii waa la dhameeyey! Faahfaahinta waxaad ka arki kartaa bogga La Soco Dalabka.'
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

  current[index] = updatedOrder;
  setLocalData(STORAGE_KEYS.ORDERS, [...current]);
  memoryOrders = [...current];

  if (status === 'COMPLETED' && updatedOrder.productType === 'ACCOUNT') {
    await updateAccount(updatedOrder.productId, { status: 'SOLD' });
  }

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
    autoSeedSupabaseIfEmpty().catch(() => {});
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'default')
          .single(),
        2000
      );
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
