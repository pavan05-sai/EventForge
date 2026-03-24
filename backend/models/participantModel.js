// ====================================
// Participant Model
// ====================================
// This file contains all database queries related to event participants.
// It interacts with the "participants" table in Supabase.

const supabase = require('../config/supabase');

// ---- Get all participants for an event ----
async function findByEvent(eventId) {
    const { data, error } = await supabase
        .from('participants')
        .select('*, users!participants_user_id_fkey(id, email, full_name)')
        .eq('event_id', eventId)
        .order('invited_at', { ascending: true });

    if (error) throw error;
    return data;
}

// ---- Add a participant to an event ----
async function create(participantData) {
    const { data, error } = await supabase
        .from('participants')
        .insert([participantData])
        .select('*, users!participants_user_id_fkey(id, email, full_name)')
        .single();

    if (error) throw error;
    return data;
}

// ---- Update participant status (accept/decline) ----
async function updateStatus(id, status) {
    const { data, error } = await supabase
        .from('participants')
        .update({ status })
        .eq('id', id)
        .select('*, users!participants_user_id_fkey(id, email, full_name)')
        .single();

    if (error) throw error;
    return data;
}

// ---- Remove a participant from an event ----
async function remove(id) {
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ---- Check if a user is already a participant in an event ----
async function findByEventAndUser(eventId, userId) {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

module.exports = {
    findByEvent,
    create,
    updateStatus,
    remove,
    findByEventAndUser,
};
