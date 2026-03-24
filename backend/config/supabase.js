// ====================================
// Supabase Client Configuration
// ====================================
// This file creates a connection to your Supabase database.
// It reads the URL and key from your .env file.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate that credentials are set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials! Check your .env file.');
    process.exit(1);
}

// Create and export the Supabase client
// This client is used throughout the app to interact with the database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
