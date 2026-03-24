// ====================================
// Event Model
// ====================================
// This file contains all database queries related to events.
// It interacts with the "events" table in Supabase.

const supabase = require('../config/supabase');

// ---- Get all events for a specific user ----
// Supports filtering by date and status
async function findByUser(userId, filters = {}) {
    let query = supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('date', { ascending: true });

    // Apply optional filters
    if (filters.status) {
        query = query.eq('status', filters.status);
    }
    if (filters.date) {
        query = query.eq('date', filters.date);
    }
    if (filters.from_date) {
        query = query.gte('date', filters.from_date);
    }
    if (filters.to_date) {
        query = query.lte('date', filters.to_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// ---- Get events where user is a participant ----
async function findByParticipant(userId, filters = {}) {
    let query = supabase
        .from('participants')
        .select(`
            status,
            events (*)
        `)
        .eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    // Extract event data and attach participant status
    return data.map(p => ({
        ...p.events,
        participant_status: p.status,
    }));
}

// ---- Get a single event by ID ----
async function findById(id) {
    const { data, error } = await supabase
        .from('events')
        .select('*, users!events_created_by_fkey(full_name, email)')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// ---- Create a new event ----
async function create(eventData) {
    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ---- Update an existing event ----
async function update(id, eventData) {
    const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ---- Delete an event ----
async function remove(id) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// ---- Check for scheduling conflicts ----
// Prevents a user from creating overlapping events on the same date
async function checkConflict(userId, date, startTime, endTime, excludeEventId = null) {
    // Find events on the same date for this user
    let query = supabase
        .from('events')
        .select('id, title, start_time, end_time')
        .eq('created_by', userId)
        .eq('date', date)
        .neq('status', 'cancelled');

    // If we're updating an event, exclude it from conflict check
    if (excludeEventId) {
        query = query.neq('id', excludeEventId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Check for time overlaps
    // Conflict exists if: new start < existing end AND new end > existing start
    const conflicts = data.filter(event => {
        return startTime < event.end_time && endTime > event.start_time;
    });

    return conflicts;
}

// ---- Get all events (Admin only) ----
async function findAll() {
    const { data, error } = await supabase
        .from('events')
        .select('*, users!events_created_by_fkey(full_name, email)')
        .order('date', { ascending: true });

    if (error) throw error;
    return data;
}

module.exports = {
    findByUser,
    findByParticipant,
    findById,
    create,
    update,
    remove,
    checkConflict,
    findAll,
};
