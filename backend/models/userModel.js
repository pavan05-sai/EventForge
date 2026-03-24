// ====================================
// User Model
// ====================================
// This file contains all database queries related to users.
// It interacts with the "users" table in Supabase.

const supabase = require('../config/supabase');

// ---- Find a user by their email address ----
// Used during login to check if the user exists
async function findByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single(); // .single() returns one row or null

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
}

// ---- Find a user by their ID ----
// Used to get user profile info from the JWT token
async function findById(id) {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// ---- Create a new user ----
// Used during registration
async function create(userData) {
    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ---- Get all users (Admin only) ----
// Returns all users without their password hashes
async function findAll() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// ---- Search users by email (for participant invitation) ----
async function searchByEmail(emailQuery) {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .ilike('email', `%${emailQuery}%`)
        .limit(10);

    if (error) throw error;
    return data;
}

module.exports = {
    findByEmail,
    findById,
    create,
    findAll,
    searchByEmail,
};
