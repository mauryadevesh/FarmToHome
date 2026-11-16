# 🌾 FarmToHome

A modern direct-to-consumer digital marketplace connecting local farmers directly with urban consumers. The platform eliminates middlemen, ensures fair pricing for farmers, simplifies scheduling and tracking, and delivers farm-fresh produce directly to consumers' doors.

---

## ⚡ 1-Click Deploy to Vercel

Deploy FarmToHome instantly to Vercel with zero server management:

1. **Import Project into Vercel**:
   - Push your repository to GitHub.
   - Go to [vercel.com/new](https://vercel.com/new) and select the repository.
   - Vercel automatically detects the Create React App build settings (`npm run build` -> `build/`).

2. **Add Environment Variables in Vercel**:
   Under **Project Settings > Environment Variables**, add:
   - `JWT_SECRET`: Any secure random string (e.g. `your_super_secret_jwt_key`)
   - `SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key

3. **Deploy**:
   Click **Deploy**. Your frontend and serverless API are live in under 2 minutes!

---

## 🗄️ Database Setup (Supabase PostgreSQL)

FarmToHome uses **Supabase PostgreSQL** for its database layer.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open your project's **SQL Editor**.
3. Open `supabase/schema.sql` from this repository, paste its contents into the SQL Editor, and click **Run**.
4. This instantly creates all tables (`users`, `products`, `cart_items`, `orders`, `support_tickets`), indexes, Row Level Security policies, and seeds:
   - **Admin Account**: `admin@farmtohome.com` / `admin123`
   - **Farmer Account**: `farmer@farmtohome.com` / `password123`
   - **Consumer Account**: `consumer@farmtohome.com` / `password123`
   - **27 Verified Farm Products** (Vegetables, Fruits, Grains, Pulses, Dairy).
5. Copy your **Project URL** and **API Keys** from **Project Settings > API** into your `.env` or Vercel dashboard.

> **Offline/Local Mode**: If no Supabase credentials are configured, FarmToHome automatically activates its built-in local JSON fallback engine, making all features 100% operational out-of-the-box!

---

## 💻 Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional: add your Supabase credentials in `.env`, or leave blank to test in local fallback mode)*

### 3. Run Development Server
```bash
npm run dev
```
This starts:
- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:5001` (with automatic proxying)

### 4. Build Production Bundle
```bash
npm run build
npm start
```

---

## 📁 Project Architecture

Unified full-stack layout deployable anywhere:

```
FarmToHome/
├── api/                  # Vercel Serverless Function & Express API routes
│   ├── middleware/       # JWT auth & role verification
│   ├── routes/           # Auth, Products, Cart, Orders, Admin, Support
│   ├── services/         # Dual-engine DB adapter (Supabase + Local fallback)
│   ├── supabase.js       # Supabase client initializer
│   └── index.js          # Serverless entrypoint
├── public/               # Static assets & HTML template
├── src/                  # React SPA frontend
│   ├── components/       # UI, Admin, Farmer, Consumer, Cart, Orders
│   ├── contexts/         # Authentication context
│   └── services/         # HTTP API client
├── supabase/             # PostgreSQL schema & seed scripts
├── server.js             # Local/Docker Express server
├── vercel.json           # Vercel routing configuration
├── DESIGN.md             # Authoritative architecture specification
└── package.json          # Unified root configuration
```

---

## 🧪 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@farmtohome.com` | `admin123` |
| **Farmer** | `farmer@farmtohome.com` | `password123` |
| **Consumer** | `consumer@farmtohome.com` | `password123` |

---

## 📄 License
ISC
