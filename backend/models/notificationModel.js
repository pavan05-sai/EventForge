// ====================================
// Notification Model
// ====================================
// This file contains all database queries related to notifications.
// It interacts with the "notifications" table in Supabase.

const supabase = require('../config/supabase');

// ---- Get all notifications for a user ----
// Most recent first, optionally filter by read status
async function findByUser(userId, onlyUnread = false) {
    let query = supabase
        .from('notifications')
        .select('*, events!notifications_event_id_fkey(title, date)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (onlyUnread) {
        query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// ---- Create a new notification ----
async function create(notificationData) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ---- Mark a notification as read ----
async function markAsRead(id, userId) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

// ---- Mark all notifications as read for a user ----
async function markAllAsRead(userId) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return true;
}

// ---- Get unread notification count ----
async function getUnreadCount(userId) {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count || 0;
}

module.exports = {
    findByUser,
    create,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
};
