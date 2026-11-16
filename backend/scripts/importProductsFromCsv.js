const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmtohome';
const CSV_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : (fs.existsSync(path.join(__dirname, '..', '..', 'farmtohome_products.csv'))
      ? path.join(__dirname, '..', '..', 'farmtohome_products.csv')
      : path.join(__dirname, '..', '..', 'farm2home_products.csv'));
const SEED_FARMER_EMAIL = process.env.SEED_FARMER_EMAIL || 'demo.farmer@farmtohome.com';
const SEED_FARMER_PASSWORD = process.env.SEED_FARMER_PASSWORD || 'password123';

const USD_TO_INR_RATE = 93;

const readCsvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV file does not contain data rows.');
  }

  const headers = lines[0].split(',').map((header) => header.trim());

  return lines.slice(1).map((line, rowIndex) => {
    const values = line.split(',').map((value) => value.trim());
    if (values.length !== headers.length) {
      throw new Error(`Row ${rowIndex + 2} has ${values.length} columns instead of ${headers.length}.`);
    }

    return headers.reduce((acc, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {});
  });
};

const parseQuantity = (quantityRaw = '') => {
  const trimmed = quantityRaw.trim();
  if (!trimmed) {
    return { amount: 1, unit: 'unit' };
  }

  const parts = trimmed.split(' ');
  const amountCandidate = parseFloat(parts[0]);
  const unit = parts.slice(1).join(' ') || 'unit';

  return {
    amount: Number.isFinite(amountCandidate) ? amountCandidate : 1,
    unit
  };
};

const categorizeProduct = (name = '') => {
  const normalized = name.toLowerCase();

  const categoryMatches = [
    { list: ['tomato', 'onion', 'potato', 'carrot', 'brinjal', 'cabbage', 'cauliflower', 'green chilli', 'capsicum'], category: 'Vegetables' },
    { list: ['apple', 'banana', 'mango', 'grapes', 'pomegranate', 'watermelon'], category: 'Fruits' },
    { list: ['rice', 'wheat', 'maize', 'sugarcane', 'groundnut'], category: 'Grains & Pulses' },
    { list: ['tur dal', 'moong dal', 'chana dal'], category: 'Pulses' },
    { list: ['milk', 'curd'], category: 'Dairy' },
    { list: ['eggs'], category: 'Poultry' }
  ];

  for (const { list, category } of categoryMatches) {
    if (list.some((item) => normalized.includes(item))) {
      return category;
    }
  }

  return 'General Produce';
};

const ensureFarmerAccount = async () => {
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

  return farmer;
};

const convertRupeesToUsd = (rupeesValue) => {
  const numericValue = Number(rupeesValue);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Number((numericValue / USD_TO_INR_RATE).toFixed(2));
};

const buildProducts = (rows, farmerId) => {
  return rows.map((row) => {
    const { unit } = parseQuantity(row.quantity);
    const priceInUsd = convertRupeesToUsd(row.price_in_rupees);

    return {
      name: row.product_name,
      description: `Fresh ${row.product_name} sourced directly from local farmers.`,
      price: priceInUsd,
      category: categorizeProduct(row.product_name),
      image: row.image_path || 'https://via.placeholder.com/300x300?text=Product+Image',
      stock: 100,
      unit,
      farmer: farmerId,
      isAvailable: true
    };
  });
};

async function importProducts() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const farmer = await ensureFarmerAccount();

    console.log(`Reading CSV file from ${CSV_PATH}...`);
    const rows = readCsvFile(CSV_PATH);

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    const products = buildProducts(rows, farmer._id);
    await Product.insertMany(products);

    console.log(`Inserted ${products.length} products from CSV dataset.`);
  } catch (error) {
    console.error('Failed to import products from CSV:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

importProducts();
