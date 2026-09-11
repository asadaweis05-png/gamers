# 🎮 eFootball Digital Marketplace

A modern, fast, mobile-first eFootball digital shop for purchasing **eFootball Accounts** and **eFootball Coins** with EVC mobile money payment verification, live order tracking, and an admin management dashboard.

---

## 🚀 Getting Started

### 1. Run the Development Server
```bash
cd "C:\Users\asad\.gemini\antigravity\scratch\efootball-market"
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Admin Portal
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Passcode**: `admin123`

---

## 📱 Features & User Flows

1. **Home Page (`/`)**:
   - Hero section with two huge primary buttons: `[ 🎮 BUY ACCOUNT ]` and `[ 🪙 BUY COINS ]`.
   - Simple 3-step guide: *1. Choose → 2. Pay via EVC → 3. Receive on WhatsApp/Email*.
   - Featured accounts and popular coin packages.

2. **Accounts Store (`/accounts`) & Details (`/accounts/[id]`)**:
   - High-impact account cards with ratings (⭐ 3200), star players (🔥 Messi, 🔥 Ronaldo, 🔥 Mbappé), prices, and team details.
   - Detailed image gallery and squad specifications.
   - Instant 1-tap `[ BUY THIS ACCOUNT ]` checkout modal.

3. **Coins Store (`/coins`)**:
   - Coin packages (1,000, 3,000, 5,000, 10,000, 25,000 coins) with bonus rewards.
   - One-tap purchase collecting player UID/Konami ID and WhatsApp/Email.

4. **Payment & Proof Verification Flow**:
   - Clear EVC merchant number display with **1-click COPY** button.
   - Drag & drop / gallery upload for payment screenshot receipts.
   - Instant generation of unique readable Order IDs (e.g. `#EF-1042`).

5. **Order Tracking (`/track`)**:
   - Search by Order ID.
   - Real-time visual progress step tracker:
     - 🟡 **Payment Pending**
     - 🔵 **Payment Verified**
     - 🟣 **Processing**
     - 🟢 **Completed 🎉**

6. **Admin Dashboard (`/admin`)**:
   - **Orders Management**: Inspect uploaded payment screenshots, verify payments, transition order status, dispatch delivery notes, and chat directly with customers on WhatsApp with prefilled messages.
   - **Account Inventory**: Add, edit, delete accounts, update prices, player tags, and toggle `AVAILABLE` vs `SOLD`.
   - **Coin Packages**: Create, update, or remove coin packages and prices dynamically.
   - **Store Settings**: Customize EVC payment number, merchant title, and WhatsApp support hotline.

---

## 🗄️ Supabase Database Setup

The database schema is located in `supabase/schema.sql`.

To link your remote Supabase project:
1. Copy `supabase/schema.sql` and run it in the Supabase SQL Editor.
2. Create `.env.local` in this project:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(Note: If Supabase keys are not provided, the marketplace operates seamlessly out of the box with browser/local storage fallback and sample data).*
