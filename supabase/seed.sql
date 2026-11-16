-- ============================================================
-- Farm2Home Supabase PostgreSQL Seed Data
-- Realistic Mira Bhayandar Agri-Supply Network
-- ============================================================

-- 1. USERS
INSERT INTO users (id, name, email, password, role, phone, address)
VALUES
    ('user_admin', 'Farm2Home Operations Admin', 'admin@farmtohome.com', crypt('admin123', gen_salt('bf', 10)), 'admin', '+91 76710 14068', 'Farm2Home Hub, Station Road, Mira Road East, Mira Bhayandar 401107'),
    ('user_farmer', 'Ramesh Patil', 'farmer@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'farmer', '+91 98201 12345', 'Survey 42, Uttan Coastal Agro Farm, Uttan, Mira Bhayandar 401106'),
    ('user_farmer_2', 'Sunita Mhatre', 'sunita@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'farmer', '+91 98202 23456', 'Chena Creek Organic Greens, Ghodbunder Belt, Mira Bhayandar 401107'),
    ('user_farmer_3', 'Ganesh Tare', 'ganesh@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'farmer', '+91 98203 34567', 'Rai-Morva Village Fields, Bhayandar West 401101'),
    ('user_consumer', 'Priya Sharma', 'consumer@farmtohome.com', crypt('password123', gen_salt('bf', 10)), 'consumer', '+91 98204 45678', 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, Mira Bhayandar 401107')
ON CONFLICT (email) DO NOTHING;

-- 2. FARMERS
INSERT INTO farmers (id, user_id, farm_name, location, farm_size, experience_years, bio, rating, total_sales, is_approved, phone)
VALUES
    ('farmer_1', 'user_farmer', 'Uttan Coastal Agro Farm', 'Uttan Green Belt, Mira Bhayandar', '4.5 Acres', 18, 'Multi-generational cultivator practicing natural vermicomposting and sustainable coastal soil conservation.', 4.90, 48500.00, true, '+91 98201 12345'),
    ('farmer_2', 'user_farmer_2', 'Chena Creek Organic Greens', 'Chena River Valley, Mira Bhayandar', '3 Acres', 12, 'Specializing in daily early-morning hand-harvested leafy greens and seasonal vegetables irrigated with natural spring water.', 4.88, 36200.00, true, '+91 98202 23456'),
    ('farmer_3', 'user_farmer_3', 'Rai-Morva Family Fields', 'Rai Village, Bhayandar West', '2.5 Acres', 9, 'Pesticide-free smallholder farm cultivating traditional native root vegetables, gourds, and native herbs.', 4.82, 21900.00, true, '+91 98203 34567')
ON CONFLICT (user_id) DO NOTHING;

-- 3. CUSTOMERS
INSERT INTO customers (id, user_id, default_address, preferred_slot, phone)
VALUES
    ('cust_1', 'user_consumer', 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107', '07:00 AM - 10:00 AM', '+91 98204 45678')
ON CONFLICT (user_id) DO NOTHING;

-- 4. CATEGORIES
INSERT INTO categories (id, name, slug, description, icon)
VALUES
    ('cat_veg', 'Fresh Vegetables', 'vegetables', 'Daily morning hand-harvested kitchen vegetables', 'FaCarrot'),
    ('cat_greens', 'Leafy Greens', 'leafy_greens', 'Tender, pesticide-tested spinach, methi & herbs', 'FaLeaf'),
    ('cat_fruits', 'Farm Fruits', 'fruits', 'Naturally ripened orchard fresh fruits', 'FaAppleAlt'),
    ('cat_grains', 'Grains & Pulses', 'grains', 'Aged heritage grains and unpolished dals', 'FaSeedling'),
    ('cat_dairy', 'Farm Dairy & Eggs', 'dairy', 'Pure A2 cow milk, thick artisanal curd & country eggs', 'FaEgg'),
    ('cat_spices', 'Spices & Herbs', 'spices', 'Sun-dried chillies and freshly ground aromatics', 'FaPepperHot')
ON CONFLICT (slug) DO NOTHING;

-- 5. ADDRESSES
INSERT INTO addresses (id, user_id, full_name, phone, flat_building, street, area, landmark, pincode, lat, lng, is_default)
VALUES
    ('addr_1', 'user_consumer', 'Priya Sharma', '+91 98204 45678', 'Flat 402, Beverly Park Tower A', 'Kanakia Road', 'Mira Road East', 'Near Cinemax Multiplex', '401107', 19.2812, 72.8561, true),
    ('addr_2', 'user_consumer', 'Priya Sharma', '+91 98204 45678', 'Shop 12, Venkateshwar Plaza', '150 Feet Road', 'Bhayandar West', 'Opposite Maxus Mall', '401101', 19.3015, 72.8423, false)
ON CONFLICT (id) DO NOTHING;

-- 6. DELIVERY SLOTS
INSERT INTO delivery_slots (id, slot_date, time_window, max_capacity, booked_count, is_active)
VALUES
    ('slot_today_morning', CURRENT_DATE, '07:00 AM - 10:00 AM', 25, 14, true),
    ('slot_today_noon', CURRENT_DATE, '11:00 AM - 02:00 PM', 20, 8, true),
    ('slot_today_evening', CURRENT_DATE, '05:00 PM - 08:00 PM', 25, 19, true),
    ('slot_tmrw_morning', CURRENT_DATE + 1, '07:00 AM - 10:00 AM', 25, 5, true),
    ('slot_tmrw_noon', CURRENT_DATE + 1, '11:00 AM - 02:00 PM', 20, 2, true),
    ('slot_tmrw_evening', CURRENT_DATE + 1, '05:00 PM - 08:00 PM', 25, 6, true)
ON CONFLICT (slot_date, time_window) DO NOTHING;

-- 7. PRODUCTS (Local Indian Produce with accurate imagery)
INSERT INTO products (id, farmer_id, category, name, description, price, unit, stock, image, origin_farm, harvest_date, is_available, rating)
VALUES
    ('prod_1', 'user_farmer', 'vegetables', 'Fresh Vine Tomatoes', 'Sun-ripened, firm and juicy desi tomatoes hand-picked from Uttan red-soil beds.', 32.00, '1 kg', 120, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Today at 5:30 AM', true, 4.9),
    ('prod_2', 'user_farmer_3', 'vegetables', 'Organic Red Onions', 'Crisp, aromatic red onions harvested and sun-cured naturally without chemicals.', 38.00, '1 kg', 150, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', 'Rai-Morva Family Fields', 'Yesterday Morning', true, 4.8),
    ('prod_3', 'user_farmer', 'vegetables', 'Desi Farm Potatoes', 'Freshly dug unwashed earthy baking and curry potatoes with rich mineral texture.', 28.00, '1 kg', 180, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Yesterday Evening', true, 4.7),
    ('prod_4', 'user_farmer_2', 'leafy_greens', 'Fresh Desi Spinach (Palak)', 'Tender, iron-rich broad-leafed spinach cut fresh at dawn from Chena Creek spring beds.', 25.00, '250 g bunch', 70, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', 'Chena Creek Organic Greens', 'Today at 5:00 AM', true, 5.0),
    ('prod_5', 'user_farmer_2', 'leafy_greens', 'Organic Methi (Fenugreek)', 'Fragrant, tender small-leaf methi grown naturally with zero synthetic sprays.', 22.00, '200 g bunch', 60, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&auto=format&fit=crop&q=80', 'Chena Creek Organic Greens', 'Today at 5:15 AM', true, 4.9),
    ('prod_6', 'user_farmer_2', 'leafy_greens', 'Fresh Green Coriander (Kothmir)', 'Deep green aromatic coriander bunches with natural roots intact for prolonged freshness.', 18.00, '150 g bunch', 85, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&auto=format&fit=crop&q=80', 'Chena Creek Organic Greens', 'Today at 5:00 AM', true, 4.9),
    ('prod_7', 'user_farmer', 'vegetables', 'Tender Green Bhindi (Okra)', 'Crisp, slender ladyfingers picked tender to ensure zero fibrous seeds.', 45.00, '500 g', 65, 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Today at 6:00 AM', true, 4.8),
    ('prod_8', 'user_farmer_3', 'vegetables', 'Spicy Green Chillies', 'Fiery, fresh hand-picked chillies full of natural capsaicin and zing.', 25.00, '250 g', 40, 'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?w=600&auto=format&fit=crop&q=80', 'Rai-Morva Family Fields', 'Yesterday Morning', true, 4.7),
    ('prod_9', 'user_farmer', 'vegetables', 'Crisp Green Cabbage', 'Solid, dense cabbage head fresh from coastal winter garden plots.', 30.00, '1 pc (~800g)', 50, 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Yesterday Morning', true, 4.8),
    ('prod_10', 'user_farmer_3', 'fruits', 'Vasai Gold Bananas (Rajeli)', 'Naturally tree-ripened sweet bananas famous from the nearby Vasai-Bhayandar green tract.', 55.00, '1 dozen', 90, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', 'Rai-Morva Family Fields', 'Harvested 2 days ago', true, 4.9),
    ('prod_11', 'user_farmer', 'fruits', 'Ratnagiri Alphonso Mangoes (Hapus)', 'Grade-A naturally carbide-free ripened sweet Alphonso mangoes direct from partner orchards.', 750.00, '1 dozen box', 30, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Tree Ripened', true, 5.0),
    ('prod_12', 'user_farmer', 'fruits', 'Juicy Ruby Pomegranates', 'Plump, deeply ruby arils rich in antioxidants and vitamins.', 140.00, '1 kg', 45, 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&auto=format&fit=crop&q=80', 'Uttan Coastal Agro Farm', 'Picked 3 days ago', true, 4.8),
    ('prod_13', 'user_farmer_2', 'dairy', 'Pure Farm Cow Milk (A2 Gir)', 'Raw, chilled, unadulterated pure whole cow milk from grass-fed local dairy cows.', 70.00, '1 Litre bottle', 40, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', 'Chena Creek Organic Greens', 'Today at 5:00 AM', true, 5.0),
    ('prod_14', 'user_farmer_2', 'dairy', 'Free-Range Desi Eggs', 'Nutrient-rich country brown eggs from pasture-foraged hens with vibrant golden yolks.', 85.00, '6 pcs pack', 50, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80', 'Chena Creek Organic Greens', 'Laid Yesterday', true, 4.9),
    ('prod_15', 'user_farmer_3', 'grains', 'Unpolished Moong Dal (Split)', 'Direct-from-field yellow split moong dal packed with clean, light plant protein.', 115.00, '1 kg pack', 70, 'https://images.unsplash.com/photo-1521763069287-579ca77694e8?w=600&auto=format&fit=crop&q=80', 'Rai-Morva Family Fields', 'Season Harvest', true, 4.8),
    ('prod_16', 'user_farmer_3', 'grains', 'Aged Wada Kolam Rice', 'Fragrant, non-sticky premium Kolam rice traditionally cultivated in northern Konkan belt.', 65.00, '1 kg pack', 150, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', 'Rai-Morva Family Fields', 'Milled Last Month', true, 4.9)
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL SAMPLE ORDER & DELIVERY RECORD (Demonstrates Live 6-Stage Tracking)
INSERT INTO orders (id, user_id, delivery_slot_id, items, total_amount, shipping_address, delivery_date, delivery_time_slot, payment_status, order_status)
VALUES
    ('ord_mira_1001', 'user_consumer', 'slot_today_morning', '[{"product_id":"prod_1","name":"Fresh Vine Tomatoes","quantity":2,"price":32,"unit":"1 kg","image":"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80","farmer_name":"Ramesh Patil"},{"product_id":"prod_4","name":"Fresh Desi Spinach (Palak)","quantity":2,"price":25,"unit":"250 g bunch","image":"https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80","farmer_name":"Sunita Mhatre"},{"product_id":"prod_10","name":"Vasai Gold Bananas (Rajeli)","quantity":1,"price":55,"unit":"1 dozen","image":"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80","farmer_name":"Ganesh Tare"}]'::jsonb, 169.00, 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107', CURRENT_DATE::text, '07:00 AM - 10:00 AM', 'paid', 'Out for Delivery')
ON CONFLICT (id) DO NOTHING;

INSERT INTO deliveries (id, order_id, delivery_slot_id, delivery_status, driver_name, driver_phone, origin_hub, destination_area, current_lat, current_lng, estimated_arrival)
VALUES
    ('del_1001', 'ord_mira_1001', 'slot_today_morning', 'Out for Delivery', 'Sanjay Raut (Mira Electric Van #03)', '+91 98205 99887', 'Uttan Agro Transit Hub', 'Beverly Park, Mira Road East', 19.2845, 72.8612, '18-25 mins (In Transit on Kanakia Rd)')
ON CONFLICT (order_id) DO NOTHING;

-- 9. REVIEWS
INSERT INTO reviews (id, product_id, farmer_id, user_id, rating, comment)
VALUES
    ('rev_1', 'prod_1', 'user_farmer', 'user_consumer', 5, 'The tomatoes were picked fresh this morning! Unbelievable sweetness compared to what we get at local roadside mandis.'),
    ('rev_2', 'prod_4', 'user_farmer_2', 'user_consumer', 5, 'Palak was completely crisp with zero yellow leaves or dirt. Steamed it directly, tastes phenomenal.'),
    ('rev_3', 'prod_10', 'user_farmer_3', 'user_consumer', 5, 'Authentic Vasai Rajeli bananas! Pure nostalgic natural sweetness. Happy to directly support local farmers.')
ON CONFLICT (id) DO NOTHING;
