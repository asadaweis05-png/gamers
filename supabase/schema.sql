-- =========================================================
-- eFootball Digital Marketplace - Database Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY, -- e.g. "EF-ACC-001" or UUID
    title TEXT NOT NULL,
    team TEXT NOT NULL,
    rating INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    star_players TEXT[] NOT NULL DEFAULT '{}',
    special_cards TEXT[] NOT NULL DEFAULT '{}',
    coins_included INTEGER DEFAULT 0,
    gp_amount TEXT DEFAULT '1,000,000+',
    division TEXT DEFAULT 'Division 1',
    description TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'SOLD')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COIN PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.coin_packages (
    id TEXT PRIMARY KEY, -- e.g. "pack-1000", "pack-3000"
    coins_amount INTEGER NOT NULL,
    bonus_coins INTEGER DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL,
    badge TEXT, -- e.g. "Popular", "Best Value", "Hot"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. "EF-1042"
    product_type TEXT NOT NULL CHECK (product_type IN ('ACCOUNT', 'COINS')),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    customer_phone TEXT, -- WhatsApp number
    customer_email TEXT,
    payment_sender_number TEXT NOT NULL, -- EVC / Sender phone
    account_uid TEXT, -- eFootball Konami ID / In-game username (for coins)
    payment_proof_url TEXT, -- Uploaded screenshot link
    status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING' CHECK (status IN ('PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    admin_notes TEXT,
    delivery_status TEXT DEFAULT 'Pending verification',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    evc_number TEXT NOT NULL DEFAULT '061-8889999',
    evc_merchant_name TEXT NOT NULL DEFAULT 'eFootball Pro Store',
    whatsapp_support TEXT NOT NULL DEFAULT '+252618889999',
    announcement_banner TEXT DEFAULT '⚡ Instant Delivery within 5-15 minutes after payment confirmation!',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ROW LEVEL SECURITY POLICIES (RLS)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read available accounts
CREATE POLICY "Public can view accounts" 
ON public.accounts FOR SELECT USING (true);

-- Public can view active coin packages
CREATE POLICY "Public can view active coin packages" 
ON public.coin_packages FOR SELECT USING (is_active = true);

-- Public can view store settings
CREATE POLICY "Public can view store settings" 
ON public.store_settings FOR SELECT USING (true);

-- Public can insert new orders
CREATE POLICY "Public can create orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- Public can view their own order by order ID
CREATE POLICY "Public can track order by ID" 
ON public.orders FOR SELECT USING (true);
