const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { supabase, isSupabaseConfigured } = require('../supabase');

// Path to fallback database file
const FALLBACK_DB_PATH = path.join(__dirname, '..', '..', 'db.json');
const CSV_FILE = path.join(__dirname, '..', '..', 'farmtohome_products.csv');

// --- In-Memory & Local Storage Fallback State ---
let localCache = null;

const MIRA_FARMERS = [
  {
    id: 'user_farmer',
    _id: 'user_farmer',
    name: 'Ramesh Patil',
    farm_name: 'Uttan Coastal Agro Farm',
    location: 'Uttan Green Belt, Mira Bhayandar',
    farm_size: '4.5 Acres',
    experience_years: 18,
    bio: 'Multi-generational cultivator practicing natural vermicomposting and sustainable coastal soil conservation in Uttan.',
    rating: 4.90,
    total_sales: 48500,
    is_approved: true,
    phone: '+91 98201 12345',
    image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&auto=format&fit=crop&q=80',
    created_at: '2026-01-10T06:00:00.000Z'
  },
  {
    id: 'user_farmer_2',
    _id: 'user_farmer_2',
    name: 'Sunita Mhatre',
    farm_name: 'Chena Creek Organic Greens',
    location: 'Chena River Valley, Mira Bhayandar',
    farm_size: '3 Acres',
    experience_years: 12,
    bio: 'Specializing in daily early-morning hand-harvested leafy greens and seasonal vegetables irrigated with natural spring water.',
    rating: 4.88,
    total_sales: 36200,
    is_approved: true,
    phone: '+91 98202 23456',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    created_at: '2026-02-14T06:00:00.000Z'
  },
  {
    id: 'user_farmer_3',
    _id: 'user_farmer_3',
    name: 'Ganesh Tare',
    farm_name: 'Rai-Morva Family Fields',
    location: 'Rai Village, Bhayandar West',
    farm_size: '2.5 Acres',
    experience_years: 9,
    bio: 'Pesticide-free smallholder farm cultivating traditional native root vegetables, gourds, and native herbs.',
    rating: 4.82,
    total_sales: 21900,
    is_approved: true,
    phone: '+91 98203 34567',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    created_at: '2026-03-01T06:00:00.000Z'
  }
];

function getInitialFarmers() {
  return MIRA_FARMERS.map(f => ({
    id: f.id === 'user_farmer' ? 'farmer_1' : f.id === 'user_farmer_2' ? 'farmer_2' : 'farmer_3',
    _id: f.id === 'user_farmer' ? 'farmer_1' : f.id === 'user_farmer_2' ? 'farmer_2' : 'farmer_3',
    user_id: f.id,
    userId: f.id,
    name: f.name,
    farm_name: f.farm_name,
    farmName: f.farm_name,
    location: f.location,
    farm_size: f.farm_size,
    farmSize: f.farm_size,
    experience_years: f.experience_years,
    experienceYears: f.experience_years,
    bio: f.bio,
    rating: f.rating,
    total_sales: f.total_sales,
    totalSales: f.total_sales,
    is_approved: f.is_approved,
    isApproved: f.is_approved,
    phone: f.phone,
    image: f.image,
    created_at: f.created_at
  }));
}

function getInitialCategories() {
  return [
    { id: 'cat_veg', _id: 'cat_veg', name: 'Fresh Vegetables', slug: 'vegetables', description: 'Daily morning hand-harvested kitchen vegetables from Uttan & Rai', icon: 'FaCarrot', count: '9 items' },
    { id: 'cat_greens', _id: 'cat_greens', name: 'Leafy Greens', slug: 'leafy_greens', description: 'Tender, pesticide-tested spinach, methi & coriander from Chena Creek', icon: 'FaLeaf', count: '4 items' },
    { id: 'cat_fruits', _id: 'cat_fruits', name: 'Farm Fruits', slug: 'fruits', description: 'Naturally ripened orchard fruits including Vasai bananas & mangoes', icon: 'FaAppleAlt', count: '6 items' },
    { id: 'cat_grains', _id: 'cat_grains', name: 'Grains & Pulses', slug: 'grains', description: 'Aged heritage rice, golden wheat, and unpolished farm dals', icon: 'FaSeedling', count: '6 items' },
    { id: 'cat_dairy', _id: 'cat_dairy', name: 'Farm Dairy & Eggs', slug: 'dairy', description: 'Pure A2 cow milk, thick artisanal curd & country brown eggs', icon: 'FaEgg', count: '3 items' },
    { id: 'cat_spices', _id: 'cat_spices', name: 'Spices & Herbs', slug: 'spices', description: 'Sun-dried chillies and freshly ground aromatics from village gardens', icon: 'FaPepperHot', count: '2 items' }
  ];
}

function getInitialDeliverySlots() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tmrwDate = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  const day3Date = new Date(now.getTime() + 86400000 * 2).toISOString().split('T')[0];

  return [
    { id: 'slot_1', _id: 'slot_1', slot_date: today, slotDate: today, time_window: '07:00 AM - 10:00 AM', timeWindow: '07:00 AM - 10:00 AM', label: 'Morning Harvest Dispatch (7 AM - 10 AM)', max_capacity: 25, maxCapacity: 25, booked_count: 14, bookedCount: 14, is_active: true, isActive: true },
    { id: 'slot_2', _id: 'slot_2', slot_date: today, slotDate: today, time_window: '11:00 AM - 02:00 PM', timeWindow: '11:00 AM - 02:00 PM', label: 'Mid-Day Fresh Batch (11 AM - 2 PM)', max_capacity: 20, maxCapacity: 20, booked_count: 8, bookedCount: 8, is_active: true, isActive: true },
    { id: 'slot_3', _id: 'slot_3', slot_date: today, slotDate: today, time_window: '05:00 PM - 08:00 PM', timeWindow: '05:00 PM - 08:00 PM', label: 'Evening Kitchen Dispatch (5 PM - 8 PM)', max_capacity: 25, maxCapacity: 25, booked_count: 19, bookedCount: 19, is_active: true, isActive: true },

    { id: 'slot_4', _id: 'slot_4', slot_date: tmrwDate, slotDate: tmrwDate, time_window: '07:00 AM - 10:00 AM', timeWindow: '07:00 AM - 10:00 AM', label: 'Morning Harvest Dispatch (7 AM - 10 AM)', max_capacity: 25, maxCapacity: 25, booked_count: 5, bookedCount: 5, is_active: true, isActive: true },
    { id: 'slot_5', _id: 'slot_5', slot_date: tmrwDate, slotDate: tmrwDate, time_window: '11:00 AM - 02:00 PM', timeWindow: '11:00 AM - 02:00 PM', label: 'Mid-Day Fresh Batch (11 AM - 2 PM)', max_capacity: 20, maxCapacity: 20, booked_count: 2, bookedCount: 2, is_active: true, isActive: true },
    { id: 'slot_6', _id: 'slot_6', slot_date: tmrwDate, slotDate: tmrwDate, time_window: '05:00 PM - 08:00 PM', timeWindow: '05:00 PM - 08:00 PM', label: 'Evening Kitchen Dispatch (5 PM - 8 PM)', max_capacity: 25, maxCapacity: 25, booked_count: 6, bookedCount: 6, is_active: true, isActive: true },

    { id: 'slot_7', _id: 'slot_7', slot_date: day3Date, slotDate: day3Date, time_window: '07:00 AM - 10:00 AM', timeWindow: '07:00 AM - 10:00 AM', label: 'Morning Harvest Dispatch (7 AM - 10 AM)', max_capacity: 25, maxCapacity: 25, booked_count: 1, bookedCount: 1, is_active: true, isActive: true },
    { id: 'slot_8', _id: 'slot_8', slot_date: day3Date, slotDate: day3Date, time_window: '11:00 AM - 02:00 PM', timeWindow: '11:00 AM - 02:00 PM', label: 'Mid-Day Fresh Batch (11 AM - 2 PM)', max_capacity: 20, maxCapacity: 20, booked_count: 0, bookedCount: 0, is_active: true, isActive: true },
    { id: 'slot_9', _id: 'slot_9', slot_date: day3Date, slotDate: day3Date, time_window: '05:00 PM - 08:00 PM', timeWindow: '05:00 PM - 08:00 PM', label: 'Evening Kitchen Dispatch (5 PM - 8 PM)', max_capacity: 25, maxCapacity: 25, booked_count: 2, bookedCount: 2, is_active: true, isActive: true }
  ];
}

function getInitialDeliveries() {
  return [
    {
      id: 'del_1001',
      _id: 'del_1001',
      order_id: 'order_1001',
      orderId: 'order_1001',
      delivery_slot_id: 'slot_1',
      deliverySlotId: 'slot_1',
      delivery_status: 'Out for Delivery',
      deliveryStatus: 'Out for Delivery',
      driver_name: 'Sanjay Raut (Mira Electric Van #03)',
      driverName: 'Sanjay Raut (Mira Electric Van #03)',
      driver_phone: '+91 98205 99887',
      driverPhone: '+91 98205 99887',
      origin_hub: 'Uttan Farmers Collection Hub',
      originHub: 'Uttan Farmers Collection Hub',
      destination_area: 'Beverly Park, Mira Road East',
      destinationArea: 'Beverly Park, Mira Road East',
      current_lat: 19.2845,
      current_lng: 72.8612,
      estimated_arrival: '18-25 mins (In Transit on Kanakia Rd)',
      estimatedArrival: '18-25 mins (In Transit on Kanakia Rd)',
      updated_at: new Date().toISOString()
    }
  ];
}

function getInitialReviews() {
  return [
    {
      id: 'rev_1',
      _id: 'rev_1',
      product_id: 'prod_1',
      productId: 'prod_1',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      user_id: 'user_consumer',
      userId: 'user_consumer',
      user_name: 'Priya Sharma',
      userName: 'Priya Sharma',
      rating: 5,
      comment: 'The tomatoes were picked fresh this morning! Unbelievable sweetness compared to what we get at roadside mandis.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'rev_2',
      _id: 'rev_2',
      product_id: 'prod_4',
      productId: 'prod_4',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      user_id: 'user_consumer',
      userId: 'user_consumer',
      user_name: 'Aaditya M.',
      userName: 'Aaditya M.',
      rating: 5,
      comment: 'Chena Creek spinach was completely crisp with zero yellow leaves or grit. Steamed it directly, tastes phenomenal.',
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'rev_3',
      _id: 'rev_3',
      product_id: 'prod_12',
      productId: 'prod_12',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      user_id: 'user_consumer',
      userId: 'user_consumer',
      user_name: 'Rajesh Nair',
      userName: 'Rajesh Nair',
      rating: 5,
      comment: 'Authentic Vasai Rajeli bananas! Naturally tree-ripened with unmistakable fragrance. 100% recommending Farm2Home to neighbours in Beverly Park.',
      created_at: new Date(Date.now() - 21600000).toISOString()
    }
  ];
}

function getInitialAddresses() {
  return [
    {
      id: 'addr_1',
      _id: 'addr_1',
      user_id: 'user_consumer',
      userId: 'user_consumer',
      full_name: 'Priya Sharma',
      fullName: 'Priya Sharma',
      phone: '+91 98204 45678',
      flat_building: 'Flat 402, Beverly Park Tower A',
      flatBuilding: 'Flat 402, Beverly Park Tower A',
      street: 'Kanakia Road',
      area: 'Mira Road East',
      landmark: 'Near Cinemax Multiplex',
      pincode: '401107',
      lat: 19.2812,
      lng: 72.8561,
      is_default: true,
      isDefault: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'addr_2',
      _id: 'addr_2',
      user_id: 'user_consumer',
      userId: 'user_consumer',
      full_name: 'Priya Sharma',
      fullName: 'Priya Sharma',
      phone: '+91 98204 45678',
      flat_building: 'Shop 12, Venkateshwar Plaza',
      flatBuilding: 'Shop 12, Venkateshwar Plaza',
      street: '150 Feet Road',
      area: 'Bhayandar West',
      landmark: 'Opposite Maxus Mall',
      pincode: '401101',
      lat: 19.3015,
      lng: 72.8423,
      is_default: false,
      isDefault: false,
      created_at: new Date().toISOString()
    }
  ];
}

function getInitialLocalState() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const defaultUsers = [
    {
      id: 'user_admin',
      _id: 'user_admin',
      name: 'Farm2Home Operations Admin',
      email: 'admin@farmtohome.com',
      password: adminPasswordHash,
      role: 'admin',
      phone: '+91 76710 14068',
      address: 'Farm2Home Hub, Station Road, Mira Road East, Mira Bhayandar 401107',
      login_history: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'user_farmer',
      _id: 'user_farmer',
      name: 'Ramesh Patil',
      email: 'farmer@farmtohome.com',
      password: defaultPasswordHash,
      role: 'farmer',
      phone: '+91 98201 12345',
      address: 'Survey 42, Uttan Coastal Agro Farm, Uttan, Mira Bhayandar 401106',
      login_history: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'user_farmer_2',
      _id: 'user_farmer_2',
      name: 'Sunita Mhatre',
      email: 'sunita@farmtohome.com',
      password: defaultPasswordHash,
      role: 'farmer',
      phone: '+91 98202 23456',
      address: 'Chena Creek Organic Greens, Ghodbunder Belt, Mira Bhayandar 401107',
      login_history: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'user_farmer_3',
      _id: 'user_farmer_3',
      name: 'Ganesh Tare',
      email: 'ganesh@farmtohome.com',
      password: defaultPasswordHash,
      role: 'farmer',
      phone: '+91 98203 34567',
      address: 'Rai-Morva Village Fields, Bhayandar West 401101',
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
      phone: '+91 98204 45678',
      address: 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107',
      login_history: [],
      created_at: new Date().toISOString()
    }
  ];

  const defaultProducts = [
    {
      id: 'prod_1',
      _id: 'prod_1',
      name: 'Fresh Vine Tomatoes',
      description: 'Sun-ripened, firm and juicy desi tomatoes hand-picked from Uttan red-soil beds.',
      price: 32,
      category: 'vegetables',
      unit: '1 kg',
      stock: 120,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Uttan Coastal Agro Farm',
      originFarm: 'Uttan Coastal Agro Farm',
      harvest_date: 'Today at 5:30 AM',
      harvestDate: 'Today at 5:30 AM',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      farmer_name: 'Ramesh Patil',
      farmerName: 'Ramesh Patil',
      farmer: { id: 'user_farmer', _id: 'user_farmer', name: 'Ramesh Patil', farm_name: 'Uttan Coastal Agro Farm', location: 'Uttan, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_2',
      _id: 'prod_2',
      name: 'Organic Red Onions',
      description: 'Crisp, aromatic red onions harvested and sun-cured naturally without chemicals.',
      price: 38,
      category: 'vegetables',
      unit: '1 kg',
      stock: 150,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Rai-Morva Family Fields',
      originFarm: 'Rai-Morva Family Fields',
      harvest_date: 'Yesterday Morning',
      harvestDate: 'Yesterday Morning',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      farmer_name: 'Ganesh Tare',
      farmerName: 'Ganesh Tare',
      farmer: { id: 'user_farmer_3', _id: 'user_farmer_3', name: 'Ganesh Tare', farm_name: 'Rai-Morva Family Fields', location: 'Rai Village, Bhayandar West' },
      is_available: true,
      isAvailable: true,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_3',
      _id: 'prod_3',
      name: 'Desi Farm Potatoes',
      description: 'Freshly dug unwashed earthy baking and curry potatoes with rich mineral texture.',
      price: 28,
      category: 'vegetables',
      unit: '1 kg',
      stock: 180,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Uttan Coastal Agro Farm',
      originFarm: 'Uttan Coastal Agro Farm',
      harvest_date: 'Yesterday Evening',
      harvestDate: 'Yesterday Evening',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      farmer_name: 'Ramesh Patil',
      farmerName: 'Ramesh Patil',
      farmer: { id: 'user_farmer', _id: 'user_farmer', name: 'Ramesh Patil', farm_name: 'Uttan Coastal Agro Farm', location: 'Uttan, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.7,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_4',
      _id: 'prod_4',
      name: 'Fresh Desi Spinach (Palak)',
      description: 'Tender, iron-rich broad-leafed spinach cut fresh at dawn from Chena Creek spring beds.',
      price: 25,
      category: 'leafy_greens',
      unit: '250 g bunch',
      stock: 70,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Chena Creek Organic Greens',
      originFarm: 'Chena Creek Organic Greens',
      harvest_date: 'Today at 5:00 AM',
      harvestDate: 'Today at 5:00 AM',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      farmer_name: 'Sunita Mhatre',
      farmerName: 'Sunita Mhatre',
      farmer: { id: 'user_farmer_2', _id: 'user_farmer_2', name: 'Sunita Mhatre', farm_name: 'Chena Creek Organic Greens', location: 'Chena Creek, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 5.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_5',
      _id: 'prod_5',
      name: 'Organic Methi (Fenugreek)',
      description: 'Fragrant, tender small-leaf methi grown naturally with zero synthetic sprays.',
      price: 22,
      category: 'leafy_greens',
      unit: '200 g bunch',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Chena Creek Organic Greens',
      originFarm: 'Chena Creek Organic Greens',
      harvest_date: 'Today at 5:15 AM',
      harvestDate: 'Today at 5:15 AM',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      farmer_name: 'Sunita Mhatre',
      farmerName: 'Sunita Mhatre',
      farmer: { id: 'user_farmer_2', _id: 'user_farmer_2', name: 'Sunita Mhatre', farm_name: 'Chena Creek Organic Greens', location: 'Chena Creek, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_6',
      _id: 'prod_6',
      name: 'Green Coriander (Kothmir)',
      description: 'Deep green aromatic coriander bunches with natural roots intact for prolonged kitchen freshness.',
      price: 18,
      category: 'leafy_greens',
      unit: '150 g bunch',
      stock: 85,
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Chena Creek Organic Greens',
      originFarm: 'Chena Creek Organic Greens',
      harvest_date: 'Today at 5:00 AM',
      harvestDate: 'Today at 5:00 AM',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      farmer_name: 'Sunita Mhatre',
      farmerName: 'Sunita Mhatre',
      farmer: { id: 'user_farmer_2', _id: 'user_farmer_2', name: 'Sunita Mhatre', farm_name: 'Chena Creek Organic Greens', location: 'Chena Creek, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_7',
      _id: 'prod_7',
      name: 'Tender Green Bhindi (Okra)',
      description: 'Crisp, slender ladyfingers picked tender to ensure zero fibrous seeds.',
      price: 45,
      category: 'vegetables',
      unit: '500 g',
      stock: 65,
      image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Uttan Coastal Agro Farm',
      originFarm: 'Uttan Coastal Agro Farm',
      harvest_date: 'Today at 6:00 AM',
      harvestDate: 'Today at 6:00 AM',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      farmer_name: 'Ramesh Patil',
      farmerName: 'Ramesh Patil',
      farmer: { id: 'user_farmer', _id: 'user_farmer', name: 'Ramesh Patil', farm_name: 'Uttan Coastal Agro Farm', location: 'Uttan, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_8',
      _id: 'prod_8',
      name: 'Spicy Green Chillies',
      description: 'Fiery, fresh hand-picked chillies full of natural capsaicin and punchy zing.',
      price: 25,
      category: 'vegetables',
      unit: '250 g',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1597115580039-b849ed2d6398?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Rai-Morva Family Fields',
      originFarm: 'Rai-Morva Family Fields',
      harvest_date: 'Yesterday Morning',
      harvestDate: 'Yesterday Morning',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      farmer_name: 'Ganesh Tare',
      farmerName: 'Ganesh Tare',
      farmer: { id: 'user_farmer_3', _id: 'user_farmer_3', name: 'Ganesh Tare', farm_name: 'Rai-Morva Family Fields', location: 'Rai Village, Bhayandar West' },
      is_available: true,
      isAvailable: true,
      rating: 4.7,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_9',
      _id: 'prod_9',
      name: 'Crisp Green Cabbage',
      description: 'Solid, dense cabbage head fresh from coastal winter garden plots.',
      price: 30,
      category: 'vegetables',
      unit: '1 pc (~800g)',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Uttan Coastal Agro Farm',
      originFarm: 'Uttan Coastal Agro Farm',
      harvest_date: 'Yesterday Morning',
      harvestDate: 'Yesterday Morning',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      farmer_name: 'Ramesh Patil',
      farmerName: 'Ramesh Patil',
      farmer: { id: 'user_farmer', _id: 'user_farmer', name: 'Ramesh Patil', farm_name: 'Uttan Coastal Agro Farm', location: 'Uttan, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_10',
      _id: 'prod_10',
      name: 'Vasai Gold Bananas (Rajeli)',
      description: 'Naturally tree-ripened sweet bananas famous from the neighboring Vasai-Bhayandar green tract.',
      price: 55,
      category: 'fruits',
      unit: '1 dozen',
      stock: 90,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Rai-Morva Family Fields',
      originFarm: 'Rai-Morva Family Fields',
      harvest_date: 'Tree-ripened 2 days ago',
      harvestDate: 'Tree-ripened 2 days ago',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      farmer_name: 'Ganesh Tare',
      farmerName: 'Ganesh Tare',
      farmer: { id: 'user_farmer_3', _id: 'user_farmer_3', name: 'Ganesh Tare', farm_name: 'Rai-Morva Family Fields', location: 'Rai Village, Bhayandar West' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_11',
      _id: 'prod_11',
      name: 'Ratnagiri Alphonso Mangoes (Hapus)',
      description: 'Grade-A naturally carbide-free ripened sweet Alphonso mangoes direct from partner orchards.',
      price: 750,
      category: 'fruits',
      unit: '1 dozen box',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Uttan Coastal Agro Farm',
      originFarm: 'Uttan Coastal Agro Farm',
      harvest_date: 'Tree Ripened',
      harvestDate: 'Tree Ripened',
      farmer_id: 'user_farmer',
      farmerId: 'user_farmer',
      farmer_name: 'Ramesh Patil',
      farmerName: 'Ramesh Patil',
      farmer: { id: 'user_farmer', _id: 'user_farmer', name: 'Ramesh Patil', farm_name: 'Uttan Coastal Agro Farm', location: 'Uttan, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 5.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_12',
      _id: 'prod_12',
      name: 'Pure Farm Cow Milk (A2 Gir)',
      description: 'Raw, chilled, unadulterated pure whole cow milk from grass-fed local dairy cows.',
      price: 70,
      category: 'dairy',
      unit: '1 Litre bottle',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Chena Creek Organic Greens',
      originFarm: 'Chena Creek Organic Greens',
      harvest_date: 'Today at 5:00 AM',
      harvestDate: 'Today at 5:00 AM',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      farmer_name: 'Sunita Mhatre',
      farmerName: 'Sunita Mhatre',
      farmer: { id: 'user_farmer_2', _id: 'user_farmer_2', name: 'Sunita Mhatre', farm_name: 'Chena Creek Organic Greens', location: 'Chena Creek, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 5.0,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_13',
      _id: 'prod_13',
      name: 'Free-Range Desi Eggs',
      description: 'Nutrient-rich country brown eggs from pasture-foraged hens with vibrant golden yolks.',
      price: 85,
      category: 'dairy',
      unit: '6 pcs pack',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Chena Creek Organic Greens',
      originFarm: 'Chena Creek Organic Greens',
      harvest_date: 'Laid Yesterday',
      harvestDate: 'Laid Yesterday',
      farmer_id: 'user_farmer_2',
      farmerId: 'user_farmer_2',
      farmer_name: 'Sunita Mhatre',
      farmerName: 'Sunita Mhatre',
      farmer: { id: 'user_farmer_2', _id: 'user_farmer_2', name: 'Sunita Mhatre', farm_name: 'Chena Creek Organic Greens', location: 'Chena Creek, Mira Bhayandar' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_14',
      _id: 'prod_14',
      name: 'Unpolished Moong Dal (Split)',
      description: 'Direct-from-field yellow split moong dal packed with clean, light plant protein.',
      price: 115,
      category: 'grains',
      unit: '1 kg pack',
      stock: 70,
      image: 'https://images.unsplash.com/photo-1521763069287-579ca77694e8?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Rai-Morva Family Fields',
      originFarm: 'Rai-Morva Family Fields',
      harvest_date: 'Season Harvest',
      harvestDate: 'Season Harvest',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      farmer_name: 'Ganesh Tare',
      farmerName: 'Ganesh Tare',
      farmer: { id: 'user_farmer_3', _id: 'user_farmer_3', name: 'Ganesh Tare', farm_name: 'Rai-Morva Family Fields', location: 'Rai Village, Bhayandar West' },
      is_available: true,
      isAvailable: true,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: 'prod_15',
      _id: 'prod_15',
      name: 'Aged Wada Kolam Rice',
      description: 'Fragrant, non-sticky premium Kolam rice traditionally cultivated in northern Konkan belt.',
      price: 65,
      category: 'grains',
      unit: '1 kg pack',
      stock: 150,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      origin_farm: 'Rai-Morva Family Fields',
      originFarm: 'Rai-Morva Family Fields',
      harvest_date: 'Milled Last Month',
      harvestDate: 'Milled Last Month',
      farmer_id: 'user_farmer_3',
      farmerId: 'user_farmer_3',
      farmer_name: 'Ganesh Tare',
      farmerName: 'Ganesh Tare',
      farmer: { id: 'user_farmer_3', _id: 'user_farmer_3', name: 'Ganesh Tare', farm_name: 'Rai-Morva Family Fields', location: 'Rai Village, Bhayandar West' },
      is_available: true,
      isAvailable: true,
      rating: 4.9,
      created_at: new Date().toISOString()
    }
  ];

  return {
    users: defaultUsers,
    farmers: getInitialFarmers(),
    customers: [
      {
        id: 'cust_1',
        _id: 'cust_1',
        user_id: 'user_consumer',
        userId: 'user_consumer',
        default_address: 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107',
        preferred_slot: '07:00 AM - 10:00 AM',
        phone: '+91 98204 45678'
      }
    ],
    categories: getInitialCategories(),
    delivery_slots: getInitialDeliverySlots(),
    addresses: getInitialAddresses(),
    deliveries: getInitialDeliveries(),
    reviews: getInitialReviews(),
    products: defaultProducts,
    cart_items: [],
    orders: [
      {
        id: 'order_1001',
        _id: 'order_1001',
        user_id: 'user_consumer',
        userId: 'user_consumer',
        user: {
          id: 'user_consumer',
          _id: 'user_consumer',
          name: 'Priya Sharma',
          email: 'consumer@farmtohome.com'
        },
        items: [
          {
            product: 'prod_1',
            name: 'Fresh Vine Tomatoes',
            price: 32,
            quantity: 2,
            unit: '1 kg',
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
            farmer_name: 'Ramesh Patil'
          },
          {
            product: 'prod_4',
            name: 'Fresh Desi Spinach (Palak)',
            price: 25,
            quantity: 2,
            unit: '250 g bunch',
            image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
            farmer_name: 'Sunita Mhatre'
          },
          {
            product: 'prod_10',
            name: 'Vasai Gold Bananas (Rajeli)',
            price: 55,
            quantity: 1,
            unit: '1 dozen',
            image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
            farmer_name: 'Ganesh Tare'
          }
        ],
        total_amount: 169,
        totalAmount: 169,
        shipping_address: 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107',
        shippingAddress: 'Flat 402, Beverly Park, Kanakia Road, Mira Road East, 401107',
        delivery_date: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        delivery_time_slot: '07:00 AM - 10:00 AM',
        deliveryTimeSlot: '07:00 AM - 10:00 AM',
        delivery_slot_id: 'slot_1',
        deliverySlotId: 'slot_1',
        status: 'Out for Delivery',
        order_status: 'Out for Delivery',
        orderStatus: 'Out for Delivery',
        payment_status: 'paid',
        paymentStatus: 'paid',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
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
        subject: 'Morning delivery slot confirmation (Beverly Park)',
        message: 'Could my Sunday harvest basket be dispatched before 8:30 AM to Beverly Park?',
        category: 'delivery',
        priority: 'low',
        status: 'resolved',
        response: 'Yes Priya! The morning electric van route to Beverly Park starts at 7:15 AM from Uttan collection point.',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  };
}

function ensureDefaultCollections(store) {
  if (!store) return;
  if (!store.farmers || store.farmers.length === 0) store.farmers = getInitialFarmers();
  if (!store.categories || store.categories.length === 0) store.categories = getInitialCategories();
  if (!store.delivery_slots || store.delivery_slots.length === 0) store.delivery_slots = getInitialDeliverySlots();
  if (!store.deliveries || store.deliveries.length === 0) store.deliveries = getInitialDeliveries();
  if (!store.reviews || store.reviews.length === 0) store.reviews = getInitialReviews();
  if (!store.addresses || store.addresses.length === 0) store.addresses = getInitialAddresses();

  // Ensure users include Mira Bhayandar farmers
  const hasSunita = store.users?.some(u => u.email === 'sunita@farmtohome.com');
  if (!hasSunita && store.users) {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('password123', salt);
    store.users.push(
      {
        id: 'user_farmer_2',
        _id: 'user_farmer_2',
        name: 'Sunita Mhatre',
        email: 'sunita@farmtohome.com',
        password: defaultPasswordHash,
        role: 'farmer',
        phone: '+91 98202 23456',
        address: 'Chena Creek Organic Greens, Ghodbunder Belt, Mira Bhayandar 401107',
        login_history: [],
        created_at: new Date().toISOString()
      },
      {
        id: 'user_farmer_3',
        _id: 'user_farmer_3',
        name: 'Ganesh Tare',
        email: 'ganesh@farmtohome.com',
        password: defaultPasswordHash,
        role: 'farmer',
        phone: '+91 98203 34567',
        address: 'Rai-Morva Village Fields, Bhayandar West 401101',
        login_history: [],
        created_at: new Date().toISOString()
      }
    );
  }

  // Enrich products with Mira provenance if not already set
  if (store.products) {
    store.products.forEach(p => {
      if (!p.origin_farm && !p.originFarm) {
        const origin = p.farmer_id === 'user_farmer_2' ? 'Chena Creek Organic Greens' :
          p.farmer_id === 'user_farmer_3' ? 'Rai-Morva Family Fields' : 'Uttan Coastal Agro Farm';
        p.origin_farm = origin;
        p.originFarm = origin;
      }
      if (!p.harvest_date && !p.harvestDate) {
        p.harvest_date = 'Today at 5:30 AM';
        p.harvestDate = 'Today at 5:30 AM';
      }
      if (p.rating === undefined) {
        p.rating = 4.8;
      }
    });
  }
}

function loadLocalStore() {
  if (localCache) return localCache;
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8').trim();
      if (raw && raw !== '{}') {
        localCache = JSON.parse(raw);
        ensureDefaultCollections(localCache);
        return localCache;
      }
    }
  } catch (e) {
    console.warn('Could not parse fallback db.json, initializing fresh store:', e.message);
  }
  localCache = getInitialLocalState();
  ensureDefaultCollections(localCache);
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

// Format entities ensuring both id and _id exist and bidirectional camelCase/snake_case
function formatEntity(item) {
  if (!item || typeof item !== 'object') return item;
  const id = item.id || item._id;
  const clone = { ...item, id, _id: id };

  const pairs = [
    ['is_available', 'isAvailable'],
    ['total_amount', 'totalAmount'],
    ['shipping_address', 'shippingAddress'],
    ['payment_status', 'paymentStatus'],
    ['order_status', 'orderStatus'],
    ['created_at', 'createdAt'],
    ['updated_at', 'updatedAt'],
    ['last_login', 'lastLogin'],
    ['farmer_id', 'farmerId'],
    ['user_id', 'userId'],
    ['product_id', 'productId'],
    ['farm_name', 'farmName'],
    ['farm_size', 'farmSize'],
    ['experience_years', 'experienceYears'],
    ['total_sales', 'totalSales'],
    ['is_approved', 'isApproved'],
    ['slot_date', 'slotDate'],
    ['time_window', 'timeWindow'],
    ['max_capacity', 'maxCapacity'],
    ['booked_count', 'bookedCount'],
    ['delivery_slot_id', 'deliverySlotId'],
    ['delivery_date', 'deliveryDate'],
    ['delivery_time_slot', 'deliveryTimeSlot'],
    ['delivery_status', 'deliveryStatus'],
    ['driver_name', 'driverName'],
    ['driver_phone', 'driverPhone'],
    ['origin_hub', 'originHub'],
    ['destination_area', 'destinationArea'],
    ['estimated_arrival', 'estimatedArrival'],
    ['current_lat', 'currentLat'],
    ['current_lng', 'currentLng'],
    ['full_name', 'fullName'],
    ['flat_building', 'flatBuilding'],
    ['is_default', 'isDefault'],
    ['user_name', 'userName'],
    ['origin_farm', 'originFarm'],
    ['harvest_date', 'harvestDate'],
    ['farmer_name', 'farmerName']
  ];

  pairs.forEach(([snake, camel]) => {
    if (clone[snake] !== undefined && clone[camel] === undefined) {
      clone[camel] = clone[snake];
    }
    if (clone[camel] !== undefined && clone[snake] === undefined) {
      clone[snake] = clone[camel];
    }
  });

  if (clone.stock !== undefined && clone.quantity === undefined) {
    clone.quantity = clone.stock;
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
        .select('id, name, email, role, phone, address, created_at, last_login')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? formatEntity(data) : null;
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.id === id || u._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return formatEntity(safeUser);
  },

  async createUser({ name, email, password, role, address = '', phone = '', farm_name = '', location = '' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role,
          address,
          phone
        })
        .select('id, name, email, role, phone, address, created_at')
        .single();
      if (error) throw error;

      // If farmer, also create farmer record
      if (role === 'farmer') {
        await supabase.from('farmers').insert({
          user_id: data.id,
          farm_name: farm_name || `${name}'s Agro Farm`,
          location: location || 'Mira Bhayandar Agricultural Belt',
          is_approved: true, // auto-approve for seamless testing, can toggle in admin
          phone
        });
      }

      return formatEntity(data);
    }

    const store = loadLocalStore();
    const id = `user_${Date.now()}`;
    const newUser = {
      id,
      _id: id,
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      address,
      phone,
      login_history: [],
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);

    if (role === 'farmer') {
      const farmerRecord = {
        id: `farmer_${Date.now()}`,
        _id: `farmer_${Date.now()}`,
        user_id: id,
        userId: id,
        name,
        farm_name: farm_name || `${name}'s Agro Farm`,
        farmName: farm_name || `${name}'s Agro Farm`,
        location: location || 'Mira Bhayandar Agricultural Belt',
        farm_size: '3 Acres',
        experience_years: 5,
        bio: 'Local farmer dedicated to chemical-free harvesting and direct consumer supply.',
        rating: 4.85,
        total_sales: 0,
        is_approved: true,
        isApproved: true,
        phone,
        image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400',
        created_at: new Date().toISOString()
      };
      if (!store.farmers) store.farmers = [];
      store.farmers.push(farmerRecord);
    }

    saveLocalStore();
    const { password: _, ...safeUser } = newUser;
    return formatEntity(safeUser);
  },

  async recordUserLogin(userId, ip, userAgent) {
    const loginEntry = {
      loginTime: new Date().toISOString(),
      ipAddress: ip || '127.0.0.1',
      userAgent: userAgent || ''
    };

    if (isSupabaseConfigured()) {
      const { data: user } = await supabase
        .from('users')
        .select('login_history')
        .eq('id', userId)
        .single();
      const history = (user && user.login_history) || [];
      history.push(loginEntry);
      if (history.length > 10) history.shift();

      await supabase
        .from('users')
        .update({
          login_history: history,
          last_login: loginEntry.loginTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      return;
    }

    const store = loadLocalStore();
    const user = store.users.find(u => u.id === userId || u._id === userId);
    if (user) {
      if (!user.login_history) user.login_history = [];
      user.login_history.push(loginEntry);
      if (user.login_history.length > 10) user.login_history.shift();
      user.last_login = loginEntry.loginTime;
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

  // ---------------- FARMERS ----------------
  async getFarmers() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('farmers')
        .select('*, user:users!farmers_user_id_fkey(id, name, email, phone)')
        .order('created_at', { ascending: false });
      if (!error && data) return data.map(formatEntity);
    }

    const store = loadLocalStore();
    return (store.farmers || []).map(formatEntity);
  },

  async getFarmerById(id) {
    if (!id) return null;
    const store = loadLocalStore();
    const f = (store.farmers || []).find(farm => farm.id === id || farm._id === id || farm.user_id === id || farm.userId === id);
    return f ? formatEntity(f) : null;
  },

  async approveFarmer(farmerId, isApproved = true) {
    const store = loadLocalStore();
    const farm = (store.farmers || []).find(f => f.id === farmerId || f._id === farmerId || f.user_id === farmerId || f.userId === farmerId);
    if (farm) {
      farm.is_approved = isApproved;
      farm.isApproved = isApproved;
      saveLocalStore();
      return formatEntity(farm);
    }
    return null;
  },

  // ---------------- CATEGORIES ----------------
  async getCategories() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) return data.map(formatEntity);
    }
    const store = loadLocalStore();
    return (store.categories || []).map(formatEntity);
  },

  // ---------------- ADDRESSES ----------------
  async getAddresses(userId) {
    const store = loadLocalStore();
    const addrs = (store.addresses || []).filter(a => a.user_id === userId || a.userId === userId);
    return addrs.map(formatEntity);
  },

  async createAddress(userId, addrData) {
    const store = loadLocalStore();
    const id = `addr_${Date.now()}`;
    const newAddr = {
      id,
      _id: id,
      user_id: userId,
      userId: userId,
      full_name: addrData.fullName || addrData.full_name || 'Customer',
      phone: addrData.phone || '',
      flat_building: addrData.flatBuilding || addrData.flat_building || '',
      street: addrData.street || '',
      area: addrData.area || 'Mira Road East',
      landmark: addrData.landmark || '',
      pincode: addrData.pincode || '401107',
      lat: addrData.lat || 19.2812,
      lng: addrData.lng || 72.8561,
      is_default: Boolean(addrData.isDefault || addrData.is_default),
      created_at: new Date().toISOString()
    };
    if (!store.addresses) store.addresses = [];
    if (newAddr.is_default) {
      store.addresses.forEach(a => { if (a.user_id === userId) a.is_default = false; });
    }
    store.addresses.push(newAddr);
    saveLocalStore();
    return formatEntity(newAddr);
  },

  // ---------------- DELIVERY SLOTS (OVERBOOKING GUARD) ----------------
  async getDeliverySlots(dateFilter) {
    const store = loadLocalStore();
    let slots = store.delivery_slots || [];
    if (dateFilter) {
      slots = slots.filter(s => (s.slot_date === dateFilter || s.slotDate === dateFilter));
      // If none exist for this specific date, generate standard 3 windows
      if (slots.length === 0) {
        const generated = [
          { id: `slot_${dateFilter}_1`, _id: `slot_${dateFilter}_1`, slot_date: dateFilter, slotDate: dateFilter, time_window: '07:00 AM - 10:00 AM', timeWindow: '07:00 AM - 10:00 AM', label: 'Morning Harvest Dispatch (7 AM - 10 AM)', max_capacity: 25, maxCapacity: 25, booked_count: 0, bookedCount: 0, is_active: true, isActive: true },
          { id: `slot_${dateFilter}_2`, _id: `slot_${dateFilter}_2`, slot_date: dateFilter, slotDate: dateFilter, time_window: '11:00 AM - 02:00 PM', timeWindow: '11:00 AM - 02:00 PM', label: 'Mid-Day Fresh Batch (11 AM - 2 PM)', max_capacity: 20, maxCapacity: 20, booked_count: 0, bookedCount: 0, is_active: true, isActive: true },
          { id: `slot_${dateFilter}_3`, _id: `slot_${dateFilter}_3`, slot_date: dateFilter, slotDate: dateFilter, time_window: '05:00 PM - 08:00 PM', timeWindow: '05:00 PM - 08:00 PM', label: 'Evening Kitchen Dispatch (5 PM - 8 PM)', max_capacity: 25, maxCapacity: 25, booked_count: 0, bookedCount: 0, is_active: true, isActive: true }
        ];
        store.delivery_slots.push(...generated);
        saveLocalStore();
        slots = generated;
      }
    }
    return slots.map(s => {
      const e = formatEntity(s);
      e.available_capacity = Math.max(0, (e.max_capacity || 20) - (e.booked_count || 0));
      e.is_full = e.available_capacity <= 0;
      return e;
    });
  },

  async createDeliverySlot(data) {
    const store = loadLocalStore();
    const id = `slot_${Date.now()}`;
    const newSlot = {
      id,
      _id: id,
      slot_date: data.slotDate || data.slot_date,
      time_window: data.timeWindow || data.time_window,
      label: data.label || data.time_window,
      max_capacity: parseInt(data.maxCapacity || data.max_capacity, 10) || 25,
      booked_count: 0,
      is_active: data.isActive !== undefined ? Boolean(data.isActive) : true,
      created_at: new Date().toISOString()
    };
    if (!store.delivery_slots) store.delivery_slots = [];
    store.delivery_slots.push(newSlot);
    saveLocalStore();
    return formatEntity(newSlot);
  },

  async updateDeliverySlot(id, data) {
    const store = loadLocalStore();
    const slot = (store.delivery_slots || []).find(s => s.id === id || s._id === id);
    if (!slot) return null;
    if (data.maxCapacity !== undefined) slot.max_capacity = parseInt(data.maxCapacity, 10);
    if (data.max_capacity !== undefined) slot.max_capacity = parseInt(data.max_capacity, 10);
    if (data.isActive !== undefined) slot.is_active = Boolean(data.isActive);
    if (data.is_active !== undefined) slot.is_active = Boolean(data.is_active);
    saveLocalStore();
    return formatEntity(slot);
  },

  async bookDeliverySlot(slotId) {
    const store = loadLocalStore();
    const slot = (store.delivery_slots || []).find(s => s.id === slotId || s._id === slotId);
    if (!slot) return { success: true }; // Proceed gracefully if custom slot
    const booked = slot.booked_count || 0;
    const max = slot.max_capacity || 25;
    if (booked >= max) {
      throw new Error(`The delivery slot (${slot.time_window}) is fully booked. Please select another slot.`);
    }
    slot.booked_count = booked + 1;
    saveLocalStore();
    return { success: true, slot: formatEntity(slot) };
  },

  // ---------------- DELIVERIES & LIVE TRACKING ----------------
  async getDeliveryByOrderId(orderId) {
    const store = loadLocalStore();
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    let delivery = (store.deliveries || []).find(d => d.order_id === orderId || d.orderId === orderId);
    if (!delivery) {
      // Create initial delivery record if missing
      delivery = {
        id: `del_${orderId}`,
        _id: `del_${orderId}`,
        order_id: orderId,
        orderId: orderId,
        delivery_slot_id: order.delivery_slot_id || 'slot_1',
        delivery_status: order.order_status || order.status || 'Pending',
        driver_name: 'Sanjay Raut (Mira Electric Van #03)',
        driver_phone: '+91 98205 99887',
        origin_hub: 'Uttan Farmers Collection Hub (Mira Bhayandar)',
        destination_area: order.shipping_address || 'Mira Road East',
        current_lat: 19.2845,
        current_lng: 72.8612,
        estimated_arrival: 'Scheduled within selected delivery window',
        updated_at: new Date().toISOString()
      };
      if (!store.deliveries) store.deliveries = [];
      store.deliveries.push(delivery);
      saveLocalStore();
    }

    const currentStatus = order.order_status || order.status || delivery.delivery_status || 'Pending';

    // 6-stage delivery pipeline specification
    const stages = [
      { key: 'Pending', label: 'Order Placed', desc: 'Received & routed to local farmer network', completed: true },
      { key: 'Accepted', label: 'Farmer Accepted', desc: 'Harvest availability confirmed at village plot', completed: ['Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'].includes(currentStatus) },
      { key: 'Preparing', label: 'Field Harvest & Packing', desc: 'Hand-picked fresh and packed in eco-crates', completed: ['Preparing', 'Ready', 'Out for Delivery', 'Delivered'].includes(currentStatus) },
      { key: 'Ready', label: 'Quality Hub Verified', desc: 'Arrival at Mira Road collection station', completed: ['Ready', 'Out for Delivery', 'Delivered'].includes(currentStatus) },
      { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Dispatched via electric delivery van #03', completed: ['Out for Delivery', 'Delivered'].includes(currentStatus) },
      { key: 'Delivered', label: 'Delivered', desc: 'Handed over fresh to customer doorstep', completed: currentStatus === 'Delivered' }
    ];

    // Coordinates for the interactive map
    const mapCoordinates = {
      farmOrigin: { name: 'Uttan Coastal Farm', lat: 19.2800, lng: 72.7830 },
      qualityHub: { name: 'Mira Road Fulfillment Hub', lat: 19.2812, lng: 72.8561 },
      driverCurrent: { name: 'Delivery Van #03', lat: delivery.current_lat || 19.2845, lng: delivery.current_lng || 72.8612 },
      destination: { name: 'Delivery Address', lat: 19.2860, lng: 72.8640, address: order.shipping_address }
    };

    return {
      order: formatEntity(order),
      delivery: formatEntity(delivery),
      currentStatus,
      status: currentStatus,
      deliveryStatus: currentStatus,
      stages,
      trackingStages: stages,
      mapCoordinates
    };
  },

  async updateDeliveryStatus(orderId, status, details = {}) {
    const store = loadLocalStore();
    await this.updateOrderStatus(orderId, status);

    let delivery = (store.deliveries || []).find(d => d.order_id === orderId || d.orderId === orderId);
    if (!delivery) {
      delivery = {
        id: `del_${orderId}`,
        _id: `del_${orderId}`,
        order_id: orderId,
        orderId: orderId,
        delivery_status: status
      };
      if (!store.deliveries) store.deliveries = [];
      store.deliveries.push(delivery);
    }

    delivery.delivery_status = status;
    delivery.deliveryStatus = status;
    if (details.driverName) delivery.driver_name = details.driverName;
    if (details.driverPhone) delivery.driver_phone = details.driverPhone;
    if (details.currentLat) delivery.current_lat = details.currentLat;
    if (details.currentLng) delivery.current_lng = details.currentLng;
    if (details.estimatedArrival) delivery.estimated_arrival = details.estimatedArrival;
    delivery.updated_at = new Date().toISOString();

    saveLocalStore();
    return formatEntity(delivery);
  },

  // ---------------- REVIEWS ----------------
  async getReviews(productId) {
    const store = loadLocalStore();
    let revs = store.reviews || [];
    if (productId) {
      revs = revs.filter(r => r.product_id === productId || r.productId === productId);
    }
    return revs.map(formatEntity);
  },

  async addReview(reviewData) {
    const store = loadLocalStore();
    const id = `rev_${Date.now()}`;
    const newRev = {
      id,
      _id: id,
      product_id: reviewData.productId || reviewData.product_id,
      productId: reviewData.productId || reviewData.product_id,
      farmer_id: reviewData.farmerId || reviewData.farmer_id || 'user_farmer',
      farmerId: reviewData.farmerId || reviewData.farmer_id || 'user_farmer',
      user_id: reviewData.userId || reviewData.user_id,
      userId: reviewData.userId || reviewData.user_id,
      user_name: reviewData.userName || reviewData.user_name || 'Verified Consumer',
      userName: reviewData.userName || reviewData.user_name || 'Verified Consumer',
      rating: parseInt(reviewData.rating, 10) || 5,
      comment: reviewData.comment || 'Excellent quality produce.',
      created_at: new Date().toISOString()
    };
    if (!store.reviews) store.reviews = [];
    store.reviews.unshift(newRev);

    // Update product average rating
    const prod = store.products?.find(p => p.id === newRev.product_id || p._id === newRev.product_id);
    if (prod) {
      const prodRevs = store.reviews.filter(r => r.product_id === newRev.product_id);
      const avg = prodRevs.reduce((acc, r) => acc + (r.rating || 5), 0) / prodRevs.length;
      prod.rating = parseFloat(avg.toFixed(1));
    }

    saveLocalStore();
    return formatEntity(newRev);
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
        if (item.farmer) item.farmer = formatEntity(item.farmer);
        return item;
      });
    }

    const store = loadLocalStore();
    let list = store.products || [];
    if (filter.isAvailable !== undefined) {
      list = list.filter(p => (p.is_available !== false && p.isAvailable !== false));
    }
    if (filter.category && filter.category !== 'all') {
      list = list.filter(p => p.category?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.farmerId || filter.farmer_id) {
      const target = filter.farmerId || filter.farmer_id;
      list = list.filter(p => p.farmer_id === target || p.farmerId === target);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q)));
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
      unit: productData.unit || '1 kg',
      farmer_id: farmerId,
      farmerId: farmerId,
      farmer_name: user.name,
      farmerName: user.name,
      origin_farm: productData.originFarm || productData.origin_farm || 'Mira Bhayandar Green Belt',
      harvest_date: productData.harvestDate || productData.harvest_date || 'Harvested Today at 5:30 AM',
      farmer: {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email
      },
      is_available: true,
      isAvailable: true,
      rating: 4.8,
      created_at: new Date().toISOString()
    };
    store.products.unshift(newProduct);
    saveLocalStore();
    return formatEntity(newProduct);
  },

  async updateProduct(id, updateData) {
    const store = loadLocalStore();
    const index = store.products.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const existing = store.products[index];
    const updated = {
      ...existing,
      ...updateData,
      id: existing.id,
      _id: existing.id,
      farmer_id: existing.farmer_id || updateData.farmer_id || updateData.farmerId,
      updated_at: new Date().toISOString()
    };
    if (updateData.price !== undefined) updated.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updated.stock = parseInt(updateData.stock, 10);
    if (updateData.isAvailable !== undefined) updated.is_available = updateData.isAvailable;
    if (updateData.is_available !== undefined) updated.isAvailable = updateData.is_available;

    store.products[index] = updated;
    saveLocalStore();
    return formatEntity(updated);
  },

  async deleteProduct(id) {
    const store = loadLocalStore();
    store.products = store.products.filter(p => p.id !== id && p._id !== id);
    saveLocalStore();
    return { success: true };
  },

  // ---------------- CART ----------------
  async getCart(userId) {
    const store = loadLocalStore();
    const items = store.cart_items.filter(i => i.user_id === userId);
    let total = 0;
    const populated = items.map(item => {
      const product = store.products.find(p => p.id === item.product_id || p._id === item.product_id);
      if (product) {
        total += product.price * item.quantity;
      }
      return {
        id: item.id || item._id,
        _id: item.id || item._id,
        quantity: item.quantity,
        product: product ? formatEntity(product) : null
      };
    }).filter(i => i.product !== null);

    return {
      items: populated,
      totalAmount: total,
      total_amount: total
    };
  },

  async addToCart(userId, productId, quantity = 1) {
    const qty = parseInt(quantity, 10) || 1;
    const store = loadLocalStore();
    const product = store.products.find(p => p.id === productId || p._id === productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < qty) throw new Error('Insufficient stock for this product');

    let existing = store.cart_items.find(i => i.user_id === userId && (i.product_id === productId || i.product_id === product.id));
    if (existing) {
      if (product.stock < (existing.quantity + qty)) {
        throw new Error('Cannot add more of this item, stock limit reached');
      }
      existing.quantity += qty;
    } else {
      const id = `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      store.cart_items.push({
        id,
        _id: id,
        user_id: userId,
        product_id: product.id,
        quantity: qty
      });
    }

    saveLocalStore();
    return this.getCart(userId);
  },

  async updateCartItem(userId, itemId, quantity) {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) return this.removeFromCart(userId, itemId);

    const store = loadLocalStore();
    const item = store.cart_items.find(i => i.user_id === userId && (i.id === itemId || i._id === itemId));
    if (!item) throw new Error('Cart item not found');

    const product = store.products.find(p => p.id === item.product_id || p._id === item.product_id);
    if (product && product.stock < qty) throw new Error('Insufficient stock');

    item.quantity = qty;
    saveLocalStore();
    return this.getCart(userId);
  },

  async removeFromCart(userId, itemId) {
    const store = loadLocalStore();
    store.cart_items = store.cart_items.filter(i => !(i.user_id === userId && (i.id === itemId || i._id === itemId)));
    saveLocalStore();
    return this.getCart(userId);
  },

  async clearCart(userId) {
    const store = loadLocalStore();
    store.cart_items = store.cart_items.filter(i => i.user_id !== userId);
    saveLocalStore();
    return { success: true };
  },

  // ---------------- ORDERS ----------------
  async getOrders(userId, role) {
    const store = loadLocalStore();
    let orders = store.orders || [];
    if (role === 'farmer') {
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
    const store = loadLocalStore();
    const order = store.orders?.find(o => o.id === id || o._id === id);
    return order ? formatEntity(order) : null;
  },

  async createOrder({ userId, shippingAddress, deliverySlotId, deliveryDate, deliveryTimeSlot, paymentMethod = 'paid' }) {
    const cart = await this.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Protect against slot overbooking
    if (deliverySlotId) {
      await this.bookDeliverySlot(deliverySlotId);
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
        unit: product.unit || '1 kg',
        image: product.image,
        farmer_name: product.farmer_name || product.farmer?.name || 'Local Farmer'
      });

      // Deduct stock
      const updatedStock = product.stock - item.quantity;
      await this.updateProduct(product.id, {
        stock: updatedStock,
        isAvailable: updatedStock > 0
      });
    }

    const store = loadLocalStore();
    const id = `order_${Date.now()}`;
    const user = store.users.find(u => u.id === userId || u._id === userId);

    const now = new Date();
    const effectiveDate = deliveryDate || now.toISOString().split('T')[0];
    const effectiveSlot = deliveryTimeSlot || '07:00 AM - 10:00 AM';

    const newOrder = {
      id,
      _id: id,
      user_id: userId,
      userId,
      user: user ? { id: user.id, _id: user.id, name: user.name, email: user.email, phone: user.phone } : null,
      items: orderItems,
      total_amount: totalAmount,
      totalAmount,
      shipping_address: shippingAddress,
      shippingAddress,
      delivery_date: effectiveDate,
      deliveryDate: effectiveDate,
      delivery_time_slot: effectiveSlot,
      deliveryTimeSlot: effectiveSlot,
      delivery_slot_id: deliverySlotId || 'slot_1',
      deliverySlotId: deliverySlotId || 'slot_1',
      status: 'Pending',
      order_status: 'Pending',
      orderStatus: 'Pending',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      created_at: now.toISOString()
    };

    if (!store.orders) store.orders = [];
    store.orders.unshift(newOrder);

    // Create associated tracking delivery record
    const delivery = {
      id: `del_${id}`,
      _id: `del_${id}`,
      order_id: id,
      orderId: id,
      delivery_slot_id: deliverySlotId || 'slot_1',
      delivery_status: 'Pending',
      driver_name: 'Sanjay Raut (Mira Electric Van #03)',
      driver_phone: '+91 98205 99887',
      origin_hub: 'Uttan Farmers Collection Hub (Mira Bhayandar)',
      destination_area: shippingAddress,
      current_lat: 19.2812,
      current_lng: 72.8561,
      estimated_arrival: `Scheduled for delivery window: ${effectiveSlot}`,
      updated_at: now.toISOString()
    };
    if (!store.deliveries) store.deliveries = [];
    store.deliveries.push(delivery);

    await this.clearCart(userId);
    saveLocalStore();
    return formatEntity(newOrder);
  },

  async updateOrderStatus(id, status) {
    const store = loadLocalStore();
    const order = store.orders?.find(o => o.id === id || o._id === id);
    if (!order) return null;

    // Normalize status
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Accepted',
      accepted: 'Accepted',
      processing: 'Preparing',
      preparing: 'Preparing',
      ready: 'Ready',
      shipped: 'Out for Delivery',
      'out for delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    const normalized = statusMap[status.toLowerCase()] || status;

    order.status = normalized;
    order.order_status = normalized;
    order.orderStatus = normalized;
    order.updated_at = new Date().toISOString();

    // Sync delivery record
    const delivery = (store.deliveries || []).find(d => d.order_id === id || d.orderId === id);
    if (delivery) {
      delivery.delivery_status = normalized;
      delivery.deliveryStatus = normalized;
      delivery.updated_at = new Date().toISOString();

      if (normalized === 'Out for Delivery') {
        delivery.current_lat = 19.2845;
        delivery.current_lng = 72.8612;
        delivery.estimated_arrival = '15-20 mins (Driver on Mira Road East route)';
      } else if (normalized === 'Delivered') {
        delivery.current_lat = 19.2860;
        delivery.current_lng = 72.8640;
        delivery.estimated_arrival = 'Delivered to Doorstep';
      }
    }

    saveLocalStore();
    return formatEntity(order);
  },

  async cancelOrder(id, userId) {
    const order = await this.getOrderById(id);
    if (!order) throw new Error('Order not found');
    if (order.user_id !== userId && order.user?.id !== userId && order.user?._id !== userId) {
      throw new Error('Access denied to cancel this order');
    }

    const cancellable = ['pending', 'ordered', 'Pending', 'Accepted'];
    if (!cancellable.includes(order.status)) {
      throw new Error('Order can no longer be cancelled as it is already being harvested or dispatched.');
    }

    return this.updateOrderStatus(id, 'Cancelled');
  },

  // ---------------- SUPPORT TICKETS ----------------
  async getSupportTickets(userId, role) {
    const store = loadLocalStore();
    let tickets = store.support_tickets || [];
    if (role !== 'admin') {
      tickets = tickets.filter(t => t.user_id === userId);
    }
    return tickets.map(formatEntity);
  },

  async getSupportTicketById(id) {
    if (!id) return null;
    const store = loadLocalStore();
    const t = store.support_tickets?.find(ticket => ticket.id === id || ticket._id === id);
    return t ? formatEntity(t) : null;
  },

  async createSupportTicket({ userId, subject, message, category = 'delivery', priority = 'medium' }) {
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
    const store = loadLocalStore();
    const orders = store.orders || [];
    const tickets = store.support_tickets || [];
    const farmers = (store.farmers || []).length || store.users.filter(u => u.role === 'farmer').length;
    const consumers = store.users.filter(u => u.role === 'consumer').length;

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0);

    const pendingDeliveries = orders
      .filter(o => ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.status || o.order_status))
      .length;

    return {
      totalUsers: store.users.length,
      totalProducts: store.products.length,
      farmers,
      consumers,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'pending').length,
      pendingDeliveries,
      openTickets: tickets.filter(t => t.status === 'open').length,
      totalRevenue,
      activeSlots: (store.delivery_slots || []).length
    };
  }
};

module.exports = dbAdapter;
