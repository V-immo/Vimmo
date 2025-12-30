/**
 * Supabase Keep-Alive Script
 * Run this periodically (e.g., daily via Task Scheduler) to prevent
 * Supabase Free Tier from auto-pausing your project.
 * 
 * Usage: node keep-alive.js
 * Or add to package.json scripts: "keep-alive": "node keep-alive.js"
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Pinging Supabase...`);
    
    try {
        // Simple SELECT query to keep database active
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);
        
        if (error) {
            console.error('❌ Supabase error:', error.message);
            return false;
        }
        
        console.log(`✅ Supabase is ACTIVE - ${data?.length || 0} rows returned`);
        console.log(`   Project: ${supabaseUrl.split('//')[1].split('.')[0]}`);
        return true;
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        return false;
    }
}

// Run immediately
keepAlive().then(success => {
    if (success) {
        console.log('\n💚 Keep-alive ping successful! Your project will stay active.');
    } else {
        console.log('\n⚠️ Keep-alive failed. Check your Supabase dashboard.');
    }
    process.exit(success ? 0 : 1);
});
