const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmtohome';
const SEED_FARMER_EMAIL = process.env.SEED_FARMER_EMAIL || 'demo.farmer@farmtohome.com';
const SEED_FARMER_PASSWORD = process.env.SEED_FARMER_PASSWORD || 'password123';

const products = [
  {
    name: 'Organic Tomatoes',
    description: 'Field-grown, pesticide-free tomatoes picked this morning.',
    price: 2.5,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce',
    stock: 120,
    unit: 'kg'
  },
  {
    name: 'Free-Range Eggs',
    description: 'Fresh brown eggs from pasture-raised hens.',
    price: 4.75,
    category: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1517959105821-eaf229239e85',
    stock: 80,
    unit: 'dozen'
  },
  {
    name: 'Wildflower Honey',
    description: 'Raw honey sourced from local wildflowers.',
    price: 9.0,
    category: 'Pantry',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e',
    stock: 45,
    unit: 'jar'
  },
  {
    name: 'Baby Spinach',
    description: 'Tender baby spinach leaves triple-washed and ready to eat.',
    price: 3.25,
    category: 'Leafy Greens',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979',
    stock: 60,
    unit: 'bag'
  },
  {
    name: 'Heirloom Carrots',
    description: 'Crunchy rainbow carrots packed with beta-carotene.',
    price: 2.0,
    category: 'Root Vegetables',
    image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443',
    stock: 100,
    unit: 'kg'
  }
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    let farmer = await User.findOne({ email: SEED_FARMER_EMAIL });
    if (!farmer) {
      farmer = await User.create({
        name: 'Demo Farmer',
        email: SEED_FARMER_EMAIL,
        password: SEED_FARMER_PASSWORD,
        role: 'farmer',
        address: '123 Country Road, Springfield',
        phone: '+1-555-0100'
      });
      console.log(`Created demo farmer account: ${SEED_FARMER_EMAIL}`);
    } else {
      console.log(`Using existing farmer account: ${SEED_FARMER_EMAIL}`);
    }

    const productsWithFarmer = products.map((product) => ({
      ...product,
      farmer: farmer._id,
      isAvailable: true
    }));

    await Product.deleteMany({
      farmer: farmer._id,
      name: { $in: products.map((product) => product.name) }
    });

    const inserted = await Product.insertMany(productsWithFarmer);
    console.log(`Inserted ${inserted.length} products for farmer ${farmer.email}`);
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit();
  }
}

seedProducts();
