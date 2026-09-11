export type AccountStatus = 'AVAILABLE' | 'SOLD';

export interface CustomerUser {
  id: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  title: string;
  team: string;
  rating: number;
  price: number;
  starPlayers: string[];
  specialCards: string[];
  coinsIncluded?: number;
  gpAmount?: string;
  division?: string;
  description: string;
  images: string[];
  status: AccountStatus;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coinsAmount: number;
  bonusCoins?: number;
  price: number;
  badge?: string; // e.g., "Ugu Caansan 🔥", "Qiimaha Fiican ⭐"
  isActive: boolean;
}

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProductType = 'ACCOUNT' | 'COINS';

export interface OrderEvent {
  timestamp: string;
  status: OrderStatus;
  note: string;
}

export interface Order {
  id: string; // e.g. "EF-1042"
  productType: ProductType;
  productId: string;
  productName: string;
  amount: number;
  customerPhone?: string; // WhatsApp
  customerEmail?: string;
  customerId?: string; // Linked customer account
  paymentSenderNumber: string; // EVC number used to pay
  accountUid?: string; // Konami ID / In-game username (for coins)
  paymentProofUrl?: string; // Screenshot base64 data URL or storage URL
  status: OrderStatus;
  adminNotes?: string;
  deliveryStatus?: string;
  history?: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  evcNumber: string;
  evcMerchantName: string; // "Magaca Numberka"
  whatsappSupport: string;
  announcementBanner: string;
}
