const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { supabase, isSupabaseConfigured } = require('../supabase');

// Path to fallback database file
const FALLBACK_DB_PATH = path.join(__dirname, '..', '..', 'db.json');
const CSV_FILE = path.join(__dirname, '..', '..', 'farmtohome_products.csv');

// --- In-Memory & Local Storage Fallback State ---
let localCache = null;

function loadDefaultProductsFromCSV() {
  const categoryMap = {
    tomato: 'vegetables', onion: 'vegetables', potato: 'vegetables', carrot: 'vegetables',
    brinjal: 'vegetables', cabbage: 'vegetables', cauliflower: 'vegetables', 'green chilli': 'vegetables',
    capsicum: 'vegetables', 'red chilli': 'spices', apple: 'fruits', banana: 'fruits', mango: 'fruits',
    grapes: 'fruits', pomegranate: 'fruits', watermelon: 'fruits', rice: 'grains', wheat: 'grains',
    maize: 'grains', sugarcane: 'grains', groundnut: 'pulses', 'tur dal': 'pulses', 'moong dal': 'pulses',
    'chana dal': 'pulses', milk: 'dairy', curd: 'dairy', eggs: 'dairy'
  };

  const defaultImages = {
    tomato: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=600&auto=format&fit=crop&q=80',
    onion: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
    potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    carrot: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    brinjal: 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600&auto=format&fit=crop&q=80',
    cabbage: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=600&auto=format&fit=crop&q=80',
    cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
    'green chilli': 'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?w=600&auto=format&fit=crop&q=80',
    capsicum: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    'red chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
    pomegranate: 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&auto=format&fit=crop&q=80',
    watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    sugarcane: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Sugarcane_stalks.jpg',
    groundnut: 'https://images.unsplash.com/photo-1546545584-c03ac781caaf?w=600&auto=format&fit=crop&q=80',
    'tur dal': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Split_pea.jpg',
    'moong dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Green_Gram_Dal_%28_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%B8%E0%A6%B9_%E0%A6%8F%E0%A6%AC%E0%A6%82_%E0%A6%96%E0%A7%8B%E0%A6%B8%E0%A6%BE_%E0%A6%9B%E0%A6%BE%E0%A6%A1%E0%A6%BC%E0%A6%BE_%E0%A6%AE%E0%A7%81%E0%A6%97_%E0%A6%A1%E0%A6%BE%E0%A6%B2%29.JPG',
    'chana dal': 'https://images.unsplash.com/photo-1521763069287-579ca77694e8?w=600&auto=format&fit=crop&q=80',
    milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    curd: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80',
    eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80'
  };

  const products = [];
  if (fs.existsSync(CSV_FILE)) {
    try {
      const content = fs.readFileSync(CSV_FILE, 'utf-8').trim();
      const lines = content.split(/\r?\n/).filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 3) {
          const name = parts[0];
          const price = parseFloat(parts[1]) || 40;
          const qtyUnit = parts[2] || '1 kg';
          const lower = name.toLowerCase();
          const category = categoryMap[lower] || 'vegetables';
          const image = defaultImages[lower] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';

          products.push({
            id: `prod_${i}`,
            _id: `prod_${i}`,
            name,
            description: `Fresh, crisp, pesticide-free ${name} sourced directly from verified local family farms.`,
            price,
            category,
            farmer_id: 'user_farmer',
            farmer: {
              id: 'user_farmer',
              _id: 'user_farmer',
              name: 'Kisan Ramesh Kumar',
              email: 'farmer@farmtohome.com'
            },
            stock: 100,
            unit: qtyUnit,
            image,
            is_available: true,
            isAvailable: true,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('Error loading CSV products:', e.message);
    }
  }
  return products;
}

function getInitialLocalState() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const defaultUsers = [
    {
      id: 'user_admin',
      _id: 'user_admin',
      name: 'Admin Desk',
      email: 'admin@farmtohome.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+91 76710 14068',
      address: 'FarmToHome Operations Center, Sector 4, Bengaluru',
      login_history: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'user_farmer',
      _id: 'user_farmer',
      name: 'Kisan Ramesh Kumar',
      email: 'farmer@farmtohome.com',
      password: defaultPasswordHash,
      role: 'farmer',
      phone: '+91 98765 12345',
      address: 'Green Valley Organic Farms, Doddaballapura, Karnataka',
      login_history: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'user_consumer',
      _id: 'user_consumer',
      name: 'Priya Sharma',
      email: 'consumer@farmtohome.com',
      password: defaultPasswordHash,
      role: 'consumer',
      phone: '+91 98765 43210',
      address: 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru',
      login_history: [],
      created_at: new Date().toISOString()
    }
  ];

  return {
    users: defaultUsers,
    products: loadDefaultProductsFromCSV(),
    cart_items: [],
    orders: [
      {
        id: 'order_1001',
        _id: 'order_1001',
        user_id: 'user_consumer',
        user: {
          id: 'user_consumer',
          _id: 'user_consumer',
          name: 'Priya Sharma',
          email: 'consumer@farmtohome.com'
        },
        items: [
          {
            product: 'prod_1',
            name: 'Tomato',
            price: 30,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'
          },
          {
            product: 'prod_2',
            name: 'Onion',
            price: 35,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500'
          }
        ],
        total_amount: 95,
        totalAmount: 95,
        shipping_address: 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru',
        shippingAddress: 'Flat 302, Palm Grove Apts, Indiranagar, Bengaluru',
        status: 'delivered',
        payment_status: 'paid',
        paymentStatus: 'paid',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    support_tickets: [
      {
        id: 'ticket_1',
        _id: 'ticket_1',
        user_id: 'user_consumer',
        user: {
          id: 'user_consumer',
          _id: 'user_consumer',
          name: 'Priya Sharma',
          email: 'consumer@farmtohome.com'
        },
        subject: 'Scheduled delivery window query',
        message: 'Could my Sunday produce be delivered before 9:00 AM?',
        category: 'order',
        priority: 'low',
        status: 'resolved',
        response: 'Yes Priya! Early morning delivery has been noted with your farmer route.',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  };
}

function loadLocalStore() {
  if (localCache) return localCache;
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8').trim();
      if (raw && raw !== '{}') {
        localCache = JSON.parse(raw);
        return localCache;
      }
    }
  } catch (e) {
    console.warn('Could not parse fallback db.json, initializing fresh store:', e.message);
  }
  localCache = getInitialLocalState();
  saveLocalStore();
  return localCache;
}

function saveLocalStore() {
  if (!localCache) return;
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(localCache, null, 2), 'utf-8');
  } catch (e) {
    // In serverless read-only environments (like Vercel tmp filesystem), ignore file write errors
  }
}

// Format entities ensuring both id and _id exist
const KNOWN_IMAGE_FIXES = {
  groundnut: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=500',
  pomegranate: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500',
  'tur dal': 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500',
  'chana dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'
};

function formatEntity(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id;
  const clone = { ...item, id, _id: id };
  if (clone.is_available !== undefined && clone.isAvailable === undefined) {
    clone.isAvailable = clone.is_available;
  }
  if (clone.isAvailable !== undefined && clone.is_available === undefined) {
    clone.is_available = clone.isAvailable;
  }
  if (clone.total_amount !== undefined && clone.totalAmount === undefined) {
    clone.totalAmount = clone.total_amount;
  }
  if (clone.totalAmount !== undefined && clone.total_amount === undefined) {
    clone.total_amount = clone.totalAmount;
  }
  if (clone.shipping_address !== undefined && clone.shippingAddress === undefined) {
    clone.shippingAddress = clone.shipping_address;
  }
  if (clone.shippingAddress !== undefined && clone.shipping_address === undefined) {
    clone.shipping_address = clone.shippingAddress;
  }
  if (clone.payment_status !== undefined && clone.paymentStatus === undefined) {
    clone.paymentStatus = clone.payment_status;
  }
  if (clone.paymentStatus !== undefined && clone.payment_status === undefined) {
    clone.payment_status = clone.paymentStatus;
  }
  if (clone.created_at !== undefined && clone.createdAt === undefined) {
    clone.createdAt = clone.created_at;
  }
  if (clone.createdAt !== undefined && clone.created_at === undefined) {
    clone.created_at = clone.createdAt;
  }
  if (clone.updated_at !== undefined && clone.updatedAt === undefined) {
    clone.updatedAt = clone.updated_at;
  }
  if (clone.updatedAt !== undefined && clone.updated_at === undefined) {
    clone.updated_at = clone.updatedAt;
  }
  if (clone.last_login !== undefined && clone.lastLogin === undefined) {
    clone.lastLogin = clone.last_login;
  }
  if (clone.lastLogin !== undefined && clone.last_login === undefined) {
    clone.last_login = clone.lastLogin;
  }
  if (clone.farmer_id !== undefined && clone.farmerId === undefined) {
    clone.farmerId = clone.farmer_id;
  }
  if (clone.user_id !== undefined && clone.userId === undefined) {
    clone.userId = clone.user_id;
  }
  if (clone.stock !== undefined && clone.quantity === undefined) {
    clone.quantity = clone.stock;
  }
  if (clone.name && KNOWN_IMAGE_FIXES[clone.name.toLowerCase().trim()]) {
    const fixedUrl = KNOWN_IMAGE_FIXES[clone.name.toLowerCase().trim()];
    if (!clone.image || clone.image.includes('1567332766624') || clone.image.includes('1585994192701') || clone.image.includes('1615485290176')) {
      clone.image = fixedUrl;
    }
  }
  return clone;
}

// --- DUAL ENGINE IMPLEMENTATION (Supabase + Local Fallback) ---

const dbAdapter = {
  isSupabase: isSupabaseConfigured,

  // ---------------- USERS ----------------
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? formatEntity(data) : null;
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);
    return user ? formatEntity(user) : null;
  },

  async findUserById(id) {
    if (!id) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? formatEntity(data) : null;
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.id === id || u._id === id);
    return user ? formatEntity(user) : null;
  },

  async createUser({ name, email, password, role, address = '', phone = '' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const cleanEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email: cleanEmail,
          password: hashedPassword,
          role,
          address,
          phone,
          login_history: [],
        })
        .select()
        .single();
      if (error) throw error;
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const id = `user_${Date.now()}`;
    const newUser = {
      id,
      _id: id,
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      address,
      phone,
      login_history: [],
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveLocalStore();
    return formatEntity(newUser);
  },

  async recordUserLogin(id, ip, userAgent) {
    if (!id) return;
    const record = { loginTime: new Date().toISOString(), ipAddress: ip, userAgent };

    if (isSupabaseConfigured()) {
      const { data: user } = await supabase.from('users').select('login_history').eq('id', id).single();
      const current = Array.isArray(user?.login_history) ? user.login_history : [];
      current.push(record);
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString(), login_history: current })
        .eq('id', id);
      return;
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.id === id || u._id === id);
    if (user) {
      if (!Array.isArray(user.login_history)) user.login_history = [];
      user.login_history.push(record);
      user.last_login = new Date().toISOString();
      saveLocalStore();
    }
  },

  async getAllUsers() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, phone, address, created_at, last_login')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(formatEntity);
    }

    const store = loadLocalStore();
    return store.users.map(u => {
      const { password, ...safe } = u;
      return formatEntity(safe);
    });
  },

  async updateUserRole(id, role) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, name, email, role, phone, address, created_at')
        .single();
      if (error) throw error;
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.id === id || u._id === id);
    if (!user) return null;
    user.role = role;
    saveLocalStore();
    const { password, ...safe } = user;
    return formatEntity(safe);
  },

  async deleteUser(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }

    const store = loadLocalStore();
    store.users = store.users.filter(u => u.id !== id && u._id !== id);
    saveLocalStore();
    return { success: true };
  },

  // ---------------- PRODUCTS ----------------
  async getProducts(filter = {}) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('products')
        .select('*, farmer:users!products_farmer_id_fkey(id, name, email)')
        .order('created_at', { ascending: false });

      if (filter.isAvailable !== undefined) {
        query = query.eq('is_available', filter.isAvailable);
      }
      if (filter.category) {
        query = query.ilike('category', filter.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(p => {
        const item = formatEntity(p);
        if (item.farmer) {
          item.farmer = formatEntity(item.farmer);
        }
        return item;
      });
    }

    const store = loadLocalStore();
    let list = store.products;
    if (filter.isAvailable !== undefined) {
      list = list.filter(p => (p.is_available !== false && p.isAvailable !== false));
    }
    if (filter.category) {
      list = list.filter(p => p.category?.toLowerCase() === filter.category.toLowerCase());
    }
    return list.map(formatEntity);
  },

  async getProductById(id) {
    if (!id) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, farmer:users!products_farmer_id_fkey(id, name, email)')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;
      const item = formatEntity(data);
      if (item.farmer) item.farmer = formatEntity(item.farmer);
      return item;
    }

    const store = loadLocalStore();
    const prod = store.products.find(p => p.id === id || p._id === id);
    return prod ? formatEntity(prod) : null;
  },

  async createProduct(productData, user) {
    const farmerId = user.id || user._id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          category: productData.category,
          image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          stock: parseInt(productData.stock, 10) || 0,
          unit: productData.unit,
          farmer_id: farmerId,
          is_available: true,
        })
        .select('*, farmer:users!products_farmer_id_fkey(id, name, email)')
        .single();
      if (error) throw error;
      const res = formatEntity(data);
      if (res.farmer) res.farmer = formatEntity(res.farmer);
      return res;
    }

    const store = loadLocalStore();
    const id = `prod_${Date.now()}`;
    const newProduct = {
      id,
      _id: id,
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      stock: parseInt(productData.stock, 10) || 0,
      unit: productData.unit,
      farmer_id: farmerId,
      farmer: {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email
      },
      is_available: true,
      isAvailable: true,
      created_at: new Date().toISOString()
    };
    store.products.unshift(newProduct);
    saveLocalStore();
    return formatEntity(newProduct);
  },

  async updateProduct(id, updateData) {
    if (isSupabaseConfigured()) {
      const payload = { ...updateData, updated_at: new Date().toISOString() };
      if (payload.price !== undefined) payload.price = parseFloat(payload.price);
      if (payload.stock !== undefined) payload.stock = parseInt(payload.stock, 10);
      if (payload.isAvailable !== undefined) payload.is_available = payload.isAvailable;

      delete payload.id;
      delete payload._id;
      delete payload.farmer;

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select('*, farmer:users!products_farmer_id_fkey(id, name, email)')
        .single();
      if (error) throw error;
      const res = formatEntity(data);
      if (res.farmer) res.farmer = formatEntity(res.farmer);
      return res;
    }

    const store = loadLocalStore();
    const index = store.products.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;
    const existing = store.products[index];
    const isAvail = updateData.isAvailable !== undefined
      ? Boolean(updateData.isAvailable)
      : (updateData.is_available !== undefined ? Boolean(updateData.is_available) : (existing.is_available !== false));
    store.products[index] = {
      ...existing,
      ...updateData,
      price: updateData.price !== undefined ? parseFloat(updateData.price) : existing.price,
      stock: updateData.stock !== undefined ? parseInt(updateData.stock, 10) : (updateData.quantity !== undefined ? parseInt(updateData.quantity, 10) : existing.stock),
      is_available: isAvail,
      isAvailable: isAvail,
      updated_at: new Date().toISOString()
    };
    saveLocalStore();
    return formatEntity(store.products[index]);
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true, message: 'Product deleted successfully' };
    }

    const store = loadLocalStore();
    store.products = store.products.filter(p => p.id !== id && p._id !== id);
    saveLocalStore();
    return { success: true, message: 'Product deleted successfully' };
  },

  // ---------------- CART ----------------
  async getCart(userId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, quantity, product:products(*, farmer:users!products_farmer_id_fkey(id, name, email))')
        .eq('user_id', userId);
      if (error) throw error;

      const items = (data || []).map(item => ({
        id: item.id,
        _id: item.id,
        quantity: item.quantity,
        product: formatEntity(item.product)
      }));

      return {
        id: `cart_${userId}`,
        _id: `cart_${userId}`,
        user: userId,
        items
      };
    }

    const store = loadLocalStore();
    if (!store.cart_items) store.cart_items = [];
    const userCartItems = store.cart_items.filter(item => item.user_id === userId);
    const items = userCartItems.map(item => {
      const product = store.products.find(p => p.id === item.product_id || p._id === item.product_id);
      return {
        id: item.id,
        _id: item.id,
        quantity: item.quantity,
        product: product ? formatEntity(product) : null
      };
    }).filter(i => i.product);

    return {
      id: `cart_${userId}`,
      _id: `cart_${userId}`,
      user: userId,
      items
    };
  },

  async addToCart(userId, productId, quantity = 1) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = await this.getProductById(productId);
    if (!product) throw new Error('Product not found');
    if (!product.isAvailable && !product.is_available) throw new Error('Product is currently unavailable');
    if (product.stock < qty) throw new Error('Insufficient stock for this product');

    if (isSupabaseConfigured()) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stock) throw new Error('Insufficient stock');
        await supabase
          .from('cart_items')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: productId, quantity: qty });
      }
      return this.getCart(userId);
    }

    const store = loadLocalStore();
    if (!store.cart_items) store.cart_items = [];
    const existing = store.cart_items.find(i => i.user_id === userId && (i.product_id === productId || i.product_id === product._id));

    if (existing) {
      if (existing.quantity + qty > product.stock) throw new Error('Insufficient stock');
      existing.quantity += qty;
    } else {
      const id = `cart_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      store.cart_items.push({
        id,
        _id: id,
        user_id: userId,
        product_id: productId,
        quantity: qty
      });
    }
    saveLocalStore();
    return this.getCart(userId);
  },

  async updateCartItem(userId, itemId, quantity) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (isSupabaseConfigured()) {
      const { data: item } = await supabase
        .from('cart_items')
        .select('id, product_id, products(stock)')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();
      if (!item) throw new Error('Cart item not found');
      if (item.products && item.products.stock < qty) throw new Error('Insufficient stock');

      await supabase
        .from('cart_items')
        .update({ quantity: qty, updated_at: new Date().toISOString() })
        .eq('id', itemId);
      return this.getCart(userId);
    }

    const store = loadLocalStore();
    const item = store.cart_items.find(i => (i.id === itemId || i._id === itemId) && i.user_id === userId);
    if (!item) throw new Error('Cart item not found');

    const product = store.products.find(p => p.id === item.product_id || p._id === item.product_id);
    if (product && product.stock < qty) throw new Error('Insufficient stock');

    item.quantity = qty;
    saveLocalStore();
    return this.getCart(userId);
  },

  async removeFromCart(userId, itemId) {
    if (isSupabaseConfigured()) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      return this.getCart(userId);
    }

    const store = loadLocalStore();
    store.cart_items = store.cart_items.filter(i => !(i.user_id === userId && (i.id === itemId || i._id === itemId)));
    saveLocalStore();
    return this.getCart(userId);
  },

  async clearCart(userId) {
    if (isSupabaseConfigured()) {
      await supabase.from('cart_items').delete().eq('user_id', userId);
      return { success: true };
    }

    const store = loadLocalStore();
    store.cart_items = store.cart_items.filter(i => i.user_id !== userId);
    saveLocalStore();
    return { success: true };
  },

  // ---------------- ORDERS ----------------
  async getOrders(userId, role) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('orders')
        .select('*, user:users!orders_user_id_fkey(id, name, email)')
        .order('created_at', { ascending: false });

      if (role !== 'admin' && role !== 'farmer') {
        query = query.eq('user_id', userId).neq('status', 'cancelled');
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(formatEntity);
    }

    const store = loadLocalStore();
    let orders = store.orders || [];
    if (role === 'farmer') {
      // Farmers can view orders placed by them or orders containing their farm produce
      orders = orders.filter(o => {
        if (o.user_id === userId) return true;
        return (o.items || []).some(item => {
          const prodId = item.product?.id || item.product?._id || item.product;
          const p = store.products?.find(prod => prod.id === prodId || prod._id === prodId);
          return p && (p.farmer_id === userId || p.farmer?.id === userId || p.farmer?._id === userId);
        });
      });
    } else if (role !== 'admin') {
      orders = orders.filter(o => o.user_id === userId && o.status !== 'cancelled');
    }
    return orders.map(formatEntity);
  },

  async getOrderById(id) {
    if (!id) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, user:users!orders_user_id_fkey(id, name, email)')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? formatEntity(data) : null;
    }

    const store = loadLocalStore();
    const order = store.orders?.find(o => o.id === id || o._id === id);
    return order ? formatEntity(order) : null;
  },

  async createOrder({ userId, shippingAddress }) {
    const cart = await this.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and prepare order items
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isAvailable) {
        throw new Error(`Product "${product?.name || 'Item'}" is unavailable`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}"`);
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product.id || product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      // Deduct stock
      const updatedStock = product.stock - item.quantity;
      await this.updateProduct(product.id, {
        stock: updatedStock,
        isAvailable: updatedStock > 0
      });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          items: orderItems,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: 'pending',
          payment_status: 'paid'
        })
        .select('*, user:users!orders_user_id_fkey(id, name, email)')
        .single();
      if (error) throw error;

      await this.clearCart(userId);
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const id = `order_${Date.now()}`;
    const user = store.users.find(u => u.id === userId || u._id === userId);
    const newOrder = {
      id,
      _id: id,
      user_id: userId,
      user: user ? { id: user.id, _id: user.id, name: user.name, email: user.email } : null,
      items: orderItems,
      total_amount: totalAmount,
      totalAmount,
      shipping_address: shippingAddress,
      shippingAddress,
      status: 'pending',
      payment_status: 'paid',
      paymentStatus: 'paid',
      created_at: new Date().toISOString()
    };

    if (!store.orders) store.orders = [];
    store.orders.unshift(newOrder);
    await this.clearCart(userId);
    saveLocalStore();
    return formatEntity(newOrder);
  },

  async updateOrderStatus(id, status) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, user:users!orders_user_id_fkey(id, name, email)')
        .single();
      if (error) throw error;
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const order = store.orders?.find(o => o.id === id || o._id === id);
    if (!order) return null;
    order.status = status;
    saveLocalStore();
    return formatEntity(order);
  },

  async cancelOrder(id, userId) {
    const order = await this.getOrderById(id);
    if (!order) throw new Error('Order not found');
    if (order.user_id !== userId && order.user?.id !== userId && order.user?._id !== userId) {
      throw new Error('Access denied to cancel this order');
    }

    const cancellableStatuses = ['ordered', 'pending', 'processing', 'shipped'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error('Order can no longer be cancelled');
    }

    // Restore stock
    for (const item of order.items || []) {
      const prodId = item.product?.id || item.product?._id || item.product;
      const product = await this.getProductById(prodId);
      if (product) {
        await this.updateProduct(prodId, {
          stock: product.stock + item.quantity,
          isAvailable: true
        });
      }
    }

    if (isSupabaseConfigured()) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);
      return { success: true, message: 'Order cancelled successfully' };
    }

    const store = loadLocalStore();
    const target = store.orders?.find(o => o.id === id || o._id === id);
    if (target) {
      target.status = 'cancelled';
      saveLocalStore();
    }
    return { success: true, message: 'Order cancelled successfully' };
  },

  // ---------------- SUPPORT ----------------
  async getSupportTickets(userId, role) {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('support_tickets')
        .select('*, user:users!support_tickets_user_id_fkey(id, name, email), respondedBy:users!support_tickets_responded_by_fkey(id, name, email)')
        .order('created_at', { ascending: false });

      if (role !== 'admin') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(formatEntity);
    }

    const store = loadLocalStore();
    let tickets = store.support_tickets || [];
    if (role !== 'admin') {
      tickets = tickets.filter(t => t.user_id === userId);
    }
    return tickets.map(formatEntity);
  },

  async getSupportTicketById(id) {
    if (!id) return null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, user:users!support_tickets_user_id_fkey(id, name, email), respondedBy:users!support_tickets_responded_by_fkey(id, name, email)')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? formatEntity(data) : null;
    }

    const store = loadLocalStore();
    const t = store.support_tickets?.find(ticket => ticket.id === id || ticket._id === id);
    return t ? formatEntity(t) : null;
  },

  async createSupportTicket({ userId, subject, message, category = 'other', priority = 'medium' }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          subject,
          message,
          category,
          priority,
          status: 'open'
        })
        .select('*, user:users!support_tickets_user_id_fkey(id, name, email)')
        .single();
      if (error) throw error;
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const id = `ticket_${Date.now()}`;
    const user = store.users.find(u => u.id === userId || u._id === userId);
    const newTicket = {
      id,
      _id: id,
      user_id: userId,
      user: user ? { id: user.id, _id: user.id, name: user.name, email: user.email } : null,
      subject,
      message,
      category,
      priority,
      status: 'open',
      response: '',
      created_at: new Date().toISOString()
    };
    if (!store.support_tickets) store.support_tickets = [];
    store.support_tickets.unshift(newTicket);
    saveLocalStore();
    return formatEntity(newTicket);
  },

  async respondToSupportTicket(id, response, responderUser) {
    const responderId = responderUser.id || responderUser._id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          response,
          status: 'resolved',
          responded_by: responderId,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*, user:users!support_tickets_user_id_fkey(id, name, email), respondedBy:users!support_tickets_responded_by_fkey(id, name, email)')
        .single();
      if (error) throw error;
      return formatEntity(data);
    }

    const store = loadLocalStore();
    const ticket = store.support_tickets?.find(t => t.id === id || t._id === id);
    if (!ticket) return null;
    ticket.response = response;
    ticket.status = 'resolved';
    ticket.respondedBy = {
      id: responderId,
      _id: responderId,
      name: responderUser.name,
      email: responderUser.email
    };
    ticket.responded_at = new Date().toISOString();
    saveLocalStore();
    return formatEntity(ticket);
  },

  // ---------------- ADMIN METRICS ----------------
  async getAdminStats() {
    if (isSupabaseConfigured()) {
      const [usersRes, productsRes, farmersRes, consumersRes, ordersRes, pendingOrdersRes, ticketsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'consumer'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        farmers: farmersRes.count || 0,
        consumers: consumersRes.count || 0,
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        openTickets: ticketsRes.count || 0
      };
    }

    const store = loadLocalStore();
    const orders = store.orders || [];
    const tickets = store.support_tickets || [];
    return {
      totalUsers: store.users.length,
      totalProducts: store.products.length,
      farmers: store.users.filter(u => u.role === 'farmer').length,
      consumers: store.users.filter(u => u.role === 'consumer').length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      openTickets: tickets.filter(t => t.status === 'open').length
    };
  }
};

module.exports = dbAdapter;
