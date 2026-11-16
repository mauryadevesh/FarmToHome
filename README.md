# 🌾 Farm2Home: Fresh from Local Farms to Your Home

> **College Idea Lab Innovation Project**  
> *A direct-to-consumer peri-urban agricultural marketplace connecting smallholder cultivators near **Mira Bhayandar** directly with urban households.*

[![React](https://img.shields.io/badge/Frontend-React_19-236838?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js_Express-1b4d29?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-13%2F13_Passing-brightgreen?style=flat-square)](scripts/testEndpoints.js)

---

## 📌 Problem Statement (Idea Lab Context)

Local smallholder farmers cultivating along the peri-urban coastal and hill belts near **Mira Bhayandar** (such as **Uttan**, **Chena Creek**, and **Rai-Morva**) struggle to sell directly to urban consumers in nearby residential complexes (**Mira Road East**, **Beverly Park**, **Kanakia Road**, **Bhayandar West**).

1. **Middleman Exploitation**: Farmers depend on APMC commission agents and intermediaries who capture 40%–60% of consumer retail prices.
2. **Irregular Scheduling & Wastage**: Lack of coordinated, time-slot-based digital delivery logistics causes perishable crops (leafy vegetables like Palak and Methi) to spoil before reaching urban households.
3. **No Digital Visibility**: Urban consumers lack transparency on harvest dates, chemical pesticide status, or true farm origin.

---

## 💡 The Farm2Home Solution

Farm2Home provides a modern full-stack marketplace connecting local cultivators directly with urban households:

- **Direct Farmer Listing**: Farmers list harvested crops with transparent per-kilogram pricing, harvest timestamps, and photo uploads.
- **Delivery Slots with Overbooking Protection**: Customers choose delivery windows (Morning 7:00–10:00 AM, Mid-Day 11:00 AM–2:00 PM, Evening 5:00–8:00 PM). Slot capacity is strictly capped to prevent logistics overload.
- **6-Stage Live Delivery Tracking**: Customers and farmers track the real-time lifecycle:  
  `Order Placed` ➔ `Farmer Accepted` ➔ `Field Harvest & Packing` ➔ `Quality Hub Verified` ➔ `Out for Delivery` ➔ `Delivered`.
- **Interactive Route Map**: Visualizes the farm-to-doorstep journey across Mira Bhayandar from coastal fields (Uttan/Chena) via the Mira Road Transit Hub to consumer apartments.

---

## 🚀 Key Features

### 1. Home Page
- **Farm2Home Brand**: "Fresh from Local Farms to Your Home" with Idea Lab banner.
- **Hero Search Bar**: Instant search that pre-filters the produce catalog.
- **Featured Seasonal Crops**: Vine tomatoes, Desi potatoes, Nashik red onions, fresh Palak, Methi, Vasai Rajeli bananas, and Ratnagiri mangoes.
- **Featured Local Cultivators**: Real profiles of farmers from Uttan, Chena Creek, and Rai-Morva.
- **Delivery Slot Status**: Live preview of Mira Bhayandar delivery capacity.
- **"How It Works"**: 4-step farm harvest to doorstep workflow.
- **Farmer vs. Consumer Benefits Matrix**: Transparent APMC pricing vs. Farm2Home direct payout comparison.
- **Sustainability & Eco-Impact**: Reduced carbon miles, zero single-use plastic crates, fair farmer income.

### 2. Customer Experience
- Customer registration and secure login.
- Category filters (Vegetables, Leafy Greens, Fresh Fruits, Grains & Dal, Farm Dairy).
- Product details with farm provenance, harvest date, and customer review submission with star ratings.
- Cart and checkout with Mira Bhayandar locality selector (Beverly Park, Shanti Park, Kanakia, Pleasant Park, Bhayandar West).
- Live delivery time-slot selector with remaining capacity counters and full-slot locking.
- Order history and interactive 6-stage order tracking with transit map.

### 3. Farmer Dashboard
- Farmer profile and farm location indicator (Uttan / Chena Creek / Rai-Morva).
- Add, edit, and remove crops with image upload support.
- Set price per kg/bunch and update available stock (+1, -1, +10, -5 kg quick controls).
- Incoming order queue with 1-click status progression (`Accept Harvest` ➔ `Mark Picked & Packed` ➔ `Ready for Hub`).
- Revenue, pending harvest units, and active order metrics.

### 4. Admin Dashboard
- Complete marketplace monitoring and sales statistics.
- Farmer account verification & approval queue (toggle approved status).
- Delivery slot capacity management (adjust max capacity, activate/pause slots, create new slots).
- Global order lifecycle management and customer support ticket resolution.

---

## 🗄️ Database Architecture (11 Tables)

Farm2Home uses a relational **PostgreSQL** schema configured for Supabase (with automatic local dual-engine fallback):

1. **`users`**: Base credentials, email, hashed passwords, role (`consumer`, `farmer`, `admin`).
2. **`farmers`**: Verified farm name, village locality, UPI ID, certification, approval status.
3. **`customers`**: Consumer default delivery address, phone, landmark.
4. **`categories`**: Vegetables, Fruits, Grains & Dals, Dairy & Eggs, Leafy Greens.
5. **`products`**: Name, description, price, unit, stock, image, origin farm, harvest date.
6. **`addresses`**: Saved delivery addresses with Mira Bhayandar pin codes.
7. **`delivery_slots`**: Date, time window (e.g. 7:00 AM–10:00 AM), max capacity, booked count.
8. **`orders`**: Customer ID, slot ID, total amount, order status, payment method.
9. **`order_items`**: Order foreign key, product foreign key, quantity, snapshot price.
10. **`deliveries`**: 6-stage delivery status, assigned electric van, driver details, live coordinates.
11. **`reviews`**: Customer reviews, 1–5 star rating, verified purchase badge.

---

## 🧪 Demo Credentials

| Role | Email | Password | Scope |
|---|---|---|---|
| **Admin** | `admin@farmtohome.com` | `admin123` | Full platform control, farmer approvals, slot capacity |
| **Farmer** | `farmer@farmtohome.com` | `password123` | Ramesh Patil (Uttan Coastal Farm) — inventory & orders |
| **Consumer** | `consumer@farmtohome.com` | `password123` | Priya Sharma (Mira Road East) — shopping & order tracking |

---

## 💻 Local Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(If no Supabase credentials are provided, Farm2Home automatically runs using its high-fidelity local dual-engine fallback store in `db.json`)*

### 3. Run Application
```bash
npm run dev
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`
- **API Health**: `http://localhost:5001/api/health`

### 4. Run Verification Suite
```bash
# Verify 13/13 API endpoints
node scripts/testEndpoints.js

# Run frontend tests
npm test -- --watchAll=false

# Build production bundle
npm run build
```

---

## 📄 License
MIT License. Created for the College Idea Lab Innovation Demonstration.
