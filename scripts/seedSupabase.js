const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { supabase, isSupabaseConfigured } = require('../api/supabase');
const dbAdapter = require('../api/services/dbAdapter');

async function seedSupabase() {
  console.log('🌾 FarmToHome Supabase Seeder');
  console.log('==============================');

  if (!isSupabaseConfigured()) {
    console.log('ℹ️ Supabase not configured in .env. Current database mode: Fallback Local Storage');
    console.log('ℹ️ Local storage is already primed with demo users (admin, farmer, consumer) and all 27 products.');
    console.log('👉 To seed a remote Supabase instance, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file');
    console.log('👉 Or execute supabase/schema.sql in the Supabase SQL Editor.');
    return;
  }

  console.log('🚀 Connected to Supabase! Verifying tables...');
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Error communicating with Supabase:', error.message);
      console.log('💡 Note: Have you run supabase/schema.sql in your Supabase SQL Editor yet?');
      return;
    }

    console.log(`✅ Supabase tables online. Currently found ${count || 0} products in database.`);
    if (count === 0) {
      console.log('📦 Seeding initial products...');
      const store = dbAdapter.loadDefaultProductsFromCSV ? dbAdapter.loadDefaultProductsFromCSV() : [];
      // Seeding can also be executed by pasting supabase/schema.sql
      console.log('👉 Please execute supabase/schema.sql in your Supabase SQL Editor for complete DDL & seed data.');
    }
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

seedSupabase();
