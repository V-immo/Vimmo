const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Only try to load .env if not on Vercel/Production
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    console.log('📝 Local .env loaded');
  } catch (e) {
    console.log('ℹ️ No local .env found, using system env');
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase URL or Key is missing!');
  console.log('Available Env Vars:', Object.keys(process.env).filter(k => !k.includes('PASS') && !k.includes('KEY')));
}

// Create client only if we have the required info to avoid immediate crash
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client initialized');
} else {
  console.error('❌ Supabase Client could NOT be initialized');
}

module.exports = supabase;
