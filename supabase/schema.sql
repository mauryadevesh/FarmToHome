-- ============================================================
-- FarmToHome Supabase PostgreSQL Schema & Initial Seed Data
-- ============================================================

-- Enable pgcrypto for UUID and bcrypt password generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
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
    login_history JSONB DEFAULT '[]'::jsonb,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    image TEXT DEFAULT 'https://via.placeholder.com/300x300?text=Farm+Product',
    stock INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
    unit TEXT NOT NULL,
    farmer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_is_available ON products(is_available);

-- ------------------------------------------------------------
-- 3. CART ITEMS TABLE
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
-- 4. ORDERS TABLE
-- ------------------------------------------------------------
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('ordered', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ------------------------------------------------------------
-- 5. SUPPORT TICKETS TABLE
-- ------------------------------------------------------------
CREATE TABLE support_tickets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('order', 'product', 'payment', 'account', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    response TEXT DEFAULT '',
    responded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_support_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_status ON support_tickets(status);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anon and service role full access (Backend handles application-level auth)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true);
CREATE POLICY "Service role full access cart_items" ON cart_items FOR ALL USING (true);
CREATE POLICY "Service role full access orders" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access support_tickets" ON support_tickets FOR ALL USING (true);

-- ------------------------------------------------------------
-- DEFAULT SEED DATA
-- ------------------------------------------------------------

-- Seed Users (Bcrypt passwords via crypt)
INSERT INTO users (id, name, email, password, role, phone, address)
VALUES
    ('user_admin', 'Admin Desk', 'admin@farmtohome.com', crypt('admin123', gen_salt('bf', 10)), 'admin', '+91 76710 14068', 'FarmToHome Operations Center, Sector 4, Bengaluru'),
    ('user_farmer', 'Kisan Ramesh Kumar', 'farmer@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'farmer', '+91 98765 12345', 'Green Valley Organic Farms, Doddaballapura, Karnataka'),
    ('user_consumer', 'Priya Sharma', 'consumer@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'consumer', '+91 98765 43210', 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru')
ON CONFLICT (email) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, description, price, category, image, stock, unit, farmer_id, is_available)
VALUES
    ('prod_1', 'Tomato', 'Fresh, juicy, pesticide-free farm tomatoes.', 30.00, 'vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', 100, '1 kg', 'user_farmer', true),
    ('prod_2', 'Onion', 'Crisp organic red onions freshly harvested from Karnataka fields.', 35.00, 'vegetables', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500', 100, '1 kg', 'user_farmer', true),
    ('prod_3', 'Potato', 'Farm-fresh premium baking and cooking potatoes.', 25.00, 'vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', 120, '1 kg', 'user_farmer', true),
    ('prod_4', 'Carrot', 'Sweet, nutrient-rich tender orange carrots.', 50.00, 'vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500', 80, '1 kg', 'user_farmer', true),
    ('prod_5', 'Brinjal', 'Glossy purple eggplants directly from organic gardens.', 40.00, 'vegetables', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500', 60, '1 kg', 'user_farmer', true),
    ('prod_6', 'Cabbage', 'Crisp, firmly packed fresh green cabbage head.', 30.00, 'vegetables', 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=500', 50, '1 pc', 'user_farmer', true),
    ('prod_7', 'Cauliflower', 'Pure white fresh cauliflower head rich in dietary fiber.', 45.00, 'vegetables', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500', 40, '1 pc', 'user_farmer', true),
    ('prod_8', 'Green Chilli', 'Spicy, zesty fresh hand-picked green chillies.', 80.00, 'vegetables', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500', 50, '250 g', 'user_farmer', true),
    ('prod_9', 'Capsicum', 'Crisp bell peppers packed with vitamins and antioxidants.', 70.00, 'vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', 70, '500 g', 'user_farmer', true),
    ('prod_10', 'Red Chilli', 'Sun-dried high aroma red chillies for rich culinary flavors.', 200.00, 'spices', 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=500', 30, '1 kg', 'user_farmer', true),
    ('prod_11', 'Apple', 'Sweet, crunchy Shimla apples picked at peak ripeness.', 160.00, 'fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500', 90, '1 kg', 'user_farmer', true),
    ('prod_12', 'Banana', 'Naturally ripened sweet bananas packed with potassium.', 60.00, 'fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', 80, '1 dozen', 'user_farmer', true),
    ('prod_13', 'Mango', 'Fragrant, succulent seasonal premium mangoes.', 120.00, 'fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', 60, '1 kg', 'user_farmer', true),
    ('prod_14', 'Grapes', 'Sweet, seedless fresh green grapes.', 90.00, 'fruits', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500', 75, '1 kg', 'user_farmer', true),
    ('prod_15', 'Pomegranate', 'Ruby-red, juicy antioxidant-packed pomegranates.', 180.00, 'fruits', 'https://images.unsplash.com/photo-1615485290176-e137f8849bfa?w=500', 45, '1 kg', 'user_farmer', true),
    ('prod_16', 'Watermelon', 'Refreshing, sweet organic watermelons for summer hydration.', 40.00, 'fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', 30, '1 pc', 'user_farmer', true),
    ('prod_17', 'Rice', 'Aromatic aged Sona Masoori unpolished farm rice.', 55.00, 'grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', 200, '1 kg', 'user_farmer', true),
    ('prod_18', 'Wheat', 'Cleaned high-protein whole grain organic golden wheat.', 30.00, 'grains', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', 250, '1 kg', 'user_farmer', true),
    ('prod_19', 'Maize', 'Sweet, sun-ripened whole corn maize.', 28.00, 'grains', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500', 150, '1 kg', 'user_farmer', true),
    ('prod_20', 'Sugarcane', 'Sweet, juicy farm sugarcane stalks.', 15.00, 'grains', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500', 100, '1 stick', 'user_farmer', true),
    ('prod_21', 'Groundnut', 'Crunchy, rich organic groundnuts from local harvest.', 90.00, 'pulses', 'https://images.unsplash.com/photo-1567332766624-958a0b067d58?w=500', 110, '1 kg', 'user_farmer', true),
    ('prod_22', 'Tur Dal', 'Pure unpolished protein-rich pigeon pea dal.', 130.00, 'pulses', 'https://images.unsplash.com/photo-1585994192701-44755106e232?w=500', 100, '1 kg', 'user_farmer', true),
    ('prod_23', 'Moong Dal', 'Nutritious, easy-to-digest yellow split moong dal.', 110.00, 'pulses', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500', 100, '1 kg', 'user_farmer', true),
    ('prod_24', 'Chana Dal', 'Wholesome split Bengal gram dal with authentic aroma.', 95.00, 'pulses', 'https://images.unsplash.com/photo-1585994192701-44755106e232?w=500', 120, '1 kg', 'user_farmer', true),
    ('prod_25', 'Milk', 'Fresh, pure unadulterated whole cow milk.', 60.00, 'dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', 50, '1 L', 'user_farmer', true),
    ('prod_26', 'Curd', 'Thick, creamy traditional artisanal probiotic curd.', 50.00, 'dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', 40, '500 g', 'user_farmer', true),
    ('prod_27', 'Eggs', 'Free-range country brown farm eggs with golden yolks.', 60.00, 'dairy', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500', 80, '6 pcs', 'user_farmer', true)
ON CONFLICT (id) DO NOTHING;
