import { Account, CoinPackage, Order, StoreSettings } from '@/types';

export const INITIAL_SETTINGS: StoreSettings = {
  evcNumber: '061-888-9900',
  evcMerchantName: 'Maxamed Cali (eFootball Pro)',
  whatsappSupport: '+252 61 888 9900',
  announcementBanner: '⚡ Xaqiijin degdeg ah & u dirid toos ah WhatsApp ama Email!',
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'EF-ACC-001',
    title: 'SHAX HEER SARE #001',
    team: 'FC Barcelona / Real Madrid Mix',
    rating: 3200,
    price: 65,
    starPlayers: ['Messi (Big Time 105)', 'Ronaldo (Epic 104)', 'Mbappé (Show Time 104)', 'Neymar Jr (Epic 103)'],
    specialCards: ['Big Time Messi 2015', 'Epic Booster CR7', 'Show Time Haaland', 'Epic Ronaldinho'],
    coinsIncluded: 1500,
    gpAmount: '3,500,000 GP',
    division: 'Division 1 (Top 500)',
    description: 'Shax heer sare ah oo aad u awood badan, loo dhisay tartamada iyo Division 1. 100% chemistry buuxa, booster skills max ah, Tababare Guardiola 88. Diyaar kuugu ah ciyaarista markiiba.',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'EF-ACC-002',
    title: 'SHAX HEER SARE LEGENDS #002',
    team: 'AC Milan Classic',
    rating: 3160,
    price: 45,
    starPlayers: ['Kaká (Epic 103)', 'Maldini (Booster 104)', 'Shevchenko (Epic 102)', 'Pirlo (102)'],
    specialCards: ['Epic Booster Maldini', 'Big Time Kaká', 'Legendary Nesta', 'Cruyff 103'],
    coinsIncluded: 800,
    gpAmount: '2,200,000 GP',
    division: 'Division 1',
    description: 'Shax heer sare ah oo Milan ah, wadata daafacyada iyo khadka dhexe ee ugu adag taariikhda eFootball. Dribbling iyo difaac aan la jabin karin.',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'EF-ACC-003',
    title: 'SPEED ATTACK SQUAD #003',
    team: 'Manchester City & Real Madrid',
    rating: 3120,
    price: 35,
    starPlayers: ['Vinicius Jr (102)', 'Haaland (Show Time 103)', 'Bellingham (102)', 'Rodri (101)'],
    specialCards: ['Show Time Haaland Blitz Curler', 'POTW Vinicius', 'Booster Bellingham'],
    coinsIncluded: 450,
    gpAmount: '1,800,000 GP',
    division: 'Division 2',
    description: 'Koox weerar degdeg ah (Quick Counter). Xawaare waali ah iyo gool-dhalin heer sare ah. Aad ugu fiican ciyaartoyda jecel weerarka.',
    images: [
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'EF-ACC-004',
    title: 'STARTER PRO ACC #004',
    team: 'Arsenal FC & Bayern Munich',
    rating: 3050,
    price: 20,
    starPlayers: ['Saka (100)', 'Musiala (101)', 'Kane (101)', 'Saliba (100)'],
    specialCards: ['POTW Musiala', 'English League Saka', 'Showtime Kane'],
    coinsIncluded: 250,
    gpAmount: '950,000 GP',
    division: 'Division 3',
    description: 'Account qiimo jaban oo wata dhalinyarada ugu fiican hadda. Diyaar u ah ciyaarista oo nadiif ah oo Konami ID ah.',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'AVAILABLE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'EF-ACC-005',
    title: 'BRAZIL SAMBA SQUAD #005',
    team: 'Brazil National Squad',
    rating: 3190,
    price: 55,
    starPlayers: ['Neymar (104)', 'Romario (Epic 104)', 'Ronaldinho (103)', 'Roberto Carlos (102)'],
    specialCards: ['Big Time Santos Neymar', 'Epic Booster Romario', 'Big Time Roberto Carlos'],
    coinsIncluded: 1200,
    gpAmount: '2,900,000 GP',
    division: 'Division 1',
    description: 'Kooxda xirfadaha iyo Samba-da Brazil. Ciyaartoy kasta wuxuu leeyahay skill moves 5-star ah.',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'SOLD',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  }
];

export const INITIAL_COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'pack-1000',
    coinsAmount: 1000,
    bonusCoins: 50,
    price: 10,
    badge: 'Xirmo Bilow',
    isActive: true,
  },
  {
    id: 'pack-3000',
    coinsAmount: 3000,
    bonusCoins: 200,
    price: 25,
    badge: 'Ugu Caansan 🔥',
    isActive: true,
  },
  {
    id: 'pack-5000',
    coinsAmount: 5000,
    bonusCoins: 500,
    price: 40,
    badge: 'Qiimaha Fiican ⭐',
    isActive: true,
  },
  {
    id: 'pack-10000',
    coinsAmount: 10000,
    bonusCoins: 1200,
    price: 75,
    badge: 'Pro Gamer 👑',
    isActive: true,
  },
  {
    id: 'pack-25000',
    coinsAmount: 25000,
    bonusCoins: 3500,
    price: 170,
    badge: 'Whale Pack ⚡',
    isActive: true,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'EF-1042',
    productType: 'ACCOUNT',
    productId: 'EF-ACC-005',
    productName: 'BRAZIL SAMBA SQUAD #005',
    amount: 55,
    customerPhone: '+252 61 777 4433',
    customerEmail: 'gamerboy10@gmail.com',
    paymentSenderNumber: '061-777-4433',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'COMPLETED',
    adminNotes: 'Xogta account-ka Konami waxaa loogu diray WhatsApp si guul leh.',
    deliveryStatus: 'Waxa laguugu soo diray WhatsApp',
    history: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), status: 'PAYMENT_PENDING', note: 'Dalabka waa la gudbiyey, rasiidka waa la soo geliyey.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(), status: 'PAYMENT_VERIFIED', note: 'Lacagta EVC-ga waa la xaqiijiyey.' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), status: 'COMPLETED', note: 'Xogta account-ka Konami waxaa loogu diray WhatsApp si guul leh.' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'EF-1043',
    productType: 'COINS',
    productId: 'pack-3000',
    productName: '3,000 eFootball Coins (+200 Bonus)',
    amount: 25,
    customerPhone: '+252 61 999 1122',
    paymentSenderNumber: '061-999-1122',
    accountUid: 'KONAMI-ID: efoot_champion99',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'PAYMENT_PENDING',
    deliveryStatus: 'Waxaa socota xaqiijinta lacag-bixinta',
    history: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), status: 'PAYMENT_PENDING', note: 'Dalabka waa la gudbiyey, rasiidka waa la soo geliyey.' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  }
];
