const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('✅ Database name:', mongoose.connection.name);
    
    // List all collections (optional)
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections in the database:');
    collections.forEach(collection => console.log(`- ${collection.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
