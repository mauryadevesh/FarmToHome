-- ============================================================
-- Farm2Home Supabase PostgreSQL Schema
-- Mira Bhayandar Peri-Urban Direct Agricultural Network
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in correct dependency order
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS delivery_slots CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'consumer', 'admin')),
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    login_history JSONB DEFAULT '[]'::jsonb,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- 2. FARMERS TABLE (Profile & Onboarding)
-- ------------------------------------------------------------
CREATE TABLE farmers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL, -- e.g., 'Uttan Organic Green Belt, Mira Bhayandar'
    farm_size TEXT DEFAULT '3 Acres',
    experience_years INTEGER DEFAULT 5,
    bio TEXT DEFAULT '',
    rating NUMERIC(3, 2) DEFAULT 4.85,
    total_sales NUMERIC(12, 2) DEFAULT 0,
    is_approved BOOLEAN DEFAULT true, -- Admins approve new farmer accounts
    phone TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_farmers_is_approved ON farmers(is_approved);

-- ------------------------------------------------------------
-- 3. CUSTOMERS TABLE (Profile & Preferences)
-- ------------------------------------------------------------
CREATE TABLE customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_address TEXT DEFAULT '',
    preferred_slot TEXT DEFAULT '07:00 AM - 10:00 AM',
    phone TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_user_id ON customers(user_id);

-- ------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- ------------------------------------------------------------
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'FaLeaf',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ------------------------------------------------------------
-- 5. PRODUCTS TABLE
-- ------------------------------------------------------------
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    farmer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT '1 kg',
    stock INTEGER NOT NULL DEFAULT 50 CHECK (stock >= 0),
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    origin_farm TEXT DEFAULT 'Uttan Agro Cooperative',
    harvest_date TEXT DEFAULT 'Morning Harvest (6:00 AM)',
    is_available BOOLEAN DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 4.80,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_is_available ON products(is_available);

-- ------------------------------------------------------------
-- 6. ADDRESSES TABLE (Mira Bhayandar Localities)
-- ------------------------------------------------------------
CREATE TABLE addresses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    flat_building TEXT NOT NULL,
    street TEXT NOT NULL,
    area TEXT NOT NULL, -- e.g., 'Mira Road East', 'Bhayandar West', 'Beverly Park'
    landmark TEXT DEFAULT '',
    pincode TEXT NOT NULL DEFAULT '401107',
    lat NUMERIC(9, 6) DEFAULT 19.2812,
    lng NUMERIC(9, 6) DEFAULT 72.8561,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- ------------------------------------------------------------
-- 7. CART ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- ------------------------------------------------------------
-- 8. DELIVERY SLOTS TABLE (Capacity & Overbooking Guard)
-- ------------------------------------------------------------
CREATE TABLE delivery_slots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slot_date DATE NOT NULL,
    time_window TEXT NOT NULL CHECK (time_window IN ('07:00 AM - 10:00 AM', '11:00 AM - 02:00 PM', '05:00 PM - 08:00 PM')),
    max_capacity INTEGER NOT NULL DEFAULT 20,
    booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count <= max_capacity),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(slot_date, time_window)
);

CREATE INDEX idx_delivery_slots_date ON delivery_slots(slot_date);

-- ------------------------------------------------------------
-- 9. ORDERS TABLE
-- ------------------------------------------------------------
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_slot_id TEXT REFERENCES delivery_slots(id) ON DELETE SET NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    delivery_time_slot TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cod')),
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- ------------------------------------------------------------
-- 10. ORDER ITEMS TABLE (Relational Mapping)
-- ------------------------------------------------------------
CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ------------------------------------------------------------
-- 11. DELIVERIES TABLE (6-Stage Map Tracking)
-- ------------------------------------------------------------
CREATE TABLE deliveries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_slot_id TEXT REFERENCES delivery_slots(id) ON DELETE SET NULL,
    delivery_status TEXT NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled')),
    driver_name TEXT DEFAULT 'Rakesh Patil (Mira Green Dispatch)',
    driver_phone TEXT DEFAULT '+91 98201 54321',
    origin_hub TEXT DEFAULT 'Uttan Farmers Collection Center',
    destination_area TEXT DEFAULT 'Mira Road East',
    current_lat NUMERIC(9, 6) DEFAULT 19.2812,
    current_lng NUMERIC(9, 6) DEFAULT 72.8561,
    estimated_arrival TEXT DEFAULT 'Within delivery window',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(delivery_status);

-- ------------------------------------------------------------
-- 12. REVIEWS TABLE
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    farmer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_farmer_id ON reviews(farmer_id);

-- ------------------------------------------------------------
-- 13. SUPPORT TICKETS TABLE
-- ------------------------------------------------------------
CREATE TABLE support_tickets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('order', 'product', 'payment', 'delivery', 'account', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    response TEXT DEFAULT '',
    responded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_user_id ON support_tickets(user_id);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anon and service role full access (Backend handles application-level auth)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read farmers" ON farmers FOR SELECT USING (true);
CREATE POLICY "Public read slots" ON delivery_slots FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access farmers" ON farmers FOR ALL USING (true);
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true);
CREATE POLICY "Service role full access addresses" ON addresses FOR ALL USING (true);
CREATE POLICY "Service role full access cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Service role full access delivery_slots" ON delivery_slots FOR ALL USING (true);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Service role full access deliveries" ON deliveries FOR ALL USING (true);
CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Service role full access support_tickets" ON support_tickets FOR ALL USING (true);
