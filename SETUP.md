# FarmToHome Quick Setup & Deployment Guide

This guide walks you through setting up FarmToHome locally or deploying it in one click to Vercel.

---

## 🚀 Option A: 1-Click Vercel Deployment

1. **Push to GitHub**:
   Ensure your FarmToHome code is committed to a GitHub repository.

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
   - Vercel automatically selects the Create React App framework preset.

3. **Configure Environment Variables**:
   In the Vercel project configuration, add the following variables:
   - `JWT_SECRET`: Any 32+ character random string (e.g. `your_production_secret_key_farmtohome`)
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOi...`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOi...`

4. **Deploy**:
   Click **Deploy**. Vercel will build the frontend and deploy the serverless functions in `/api`.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a free account at [supabase.com](https://supabase.com).
2. Create a new project named `farmtohome`.
3. In the left sidebar, click **SQL Editor** -> **New Query**.
4. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the query window.
5. Click **Run**.
6. All 5 tables (`users`, `products`, `cart_items`, `orders`, `support_tickets`), constraints, indexes, RLS policies, and 27 farm products are created and seeded.
7. Go to **Project Settings** -> **API** to copy your **Project URL**, **anon key**, and **service_role key**.

---

## 💻 Option B: Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Add your Supabase credentials to `.env`. (If left blank, the app will run in offline local-storage fallback mode!).

### 3. Start the Development Servers
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- API Server: `http://localhost:5001`

### 4. Build and Test Production Locally
```bash
npm run build
npm start
```

---

## 🔑 Demo Login Accounts

All accounts come pre-configured with the database seed:

- **Admin Portal**: `admin@farmtohome.com` / `admin123`
- **Farmer Dashboard**: `farmer@farmtohome.com` / `password123`
- **Consumer Storefront**: `consumer@farmtohome.com` / `password123`
