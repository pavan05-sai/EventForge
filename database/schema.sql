-- ====================================
-- Event Management System - Database Schema
-- ====================================
-- Run this SQL in your Supabase SQL Editor:
-- Go to Supabase Dashboard → SQL Editor → New Query → Paste & Run

-- ====================================
-- 1. USERS TABLE
-- ====================================
-- Stores all registered users (both admins and regular users)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. EVENTS TABLE
-- ====================================
-- Stores all events created by users
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(300),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 3. PARTICIPANTS TABLE
-- ====================================
-- Tracks which users are invited to which events
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Prevent duplicate invitations (same user can't be invited twice to the same event)
    UNIQUE(event_id, user_id)
);

-- ====================================
-- 4. NOTIFICATIONS TABLE
-- ====================================
-- Stores in-app notifications for users
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 5. INDEXES (for faster queries)
-- ====================================
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ====================================
-- 6. ROW LEVEL SECURITY
-- ====================================
-- The backend uses the server-only service-role key. Keep RLS enabled and
-- remove the old permissive policies so the public anon key cannot access data.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Allow all operations on participants" ON participants;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
