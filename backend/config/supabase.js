// ====================================
// Supabase Client Configuration
// ====================================
// This file creates a connection to your Supabase database.
// It reads the URL and key from your .env file.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that credentials are set
if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey.startsWith('your_')) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.');
}

try {
    if (!['http:', 'https:'].includes(new URL(supabaseUrl).protocol)) {
        throw new Error();
    }
} catch {
    throw new Error('SUPABASE_URL must be a valid HTTP or HTTPS URL.');
}

// Create and export the Supabase client
// This client is used throughout the app to interact with the database
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
