const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

const isValidSupabaseConfig = () => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
};

if (isValidSupabaseConfig()) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not found or placeholder in .env. Initializing fallback data adapter.');
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => Boolean(supabase),
  getSupabaseClient: () => supabase,
};
