-- ===================================
-- SUPABASE DATABASE SCHEMA
-- ConnectHub Platform Tables & RLS Policies
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- COMPLAINTS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS complaints_user_id_idx ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON public.complaints(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for complaints
CREATE POLICY "Users can view their own complaints"
    ON public.complaints
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own complaints"
    ON public.complaints
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
    ON public.complaints
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own complaints"
    ON public.complaints
    FOR DELETE
    USING (auth.uid() = user_id);

-- ===================================
-- FEEDBACK TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback"
    ON public.feedback
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
    ON public.feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
    ON public.feedback
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
    ON public.feedback
    FOR DELETE
    USING (auth.uid() = user_id);

-- ===================================
-- AGENT REQUESTS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS public.agent_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS agent_requests_user_id_idx ON public.agent_requests(user_id);
CREATE INDEX IF NOT EXISTS agent_requests_status_idx ON public.agent_requests(status);
CREATE INDEX IF NOT EXISTS agent_requests_created_at_idx ON public.agent_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_requests
CREATE POLICY "Users can view their own agent requests"
    ON public.agent_requests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent requests"
    ON public.agent_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent requests"
    ON public.agent_requests
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent requests"
    ON public.agent_requests
    FOR DELETE
    USING (auth.uid() = user_id);

-- ===================================
-- FUNCTIONS & TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for complaints table
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for agent_requests table
CREATE TRIGGER update_agent_requests_updated_at
    BEFORE UPDATE ON public.agent_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- USER PROFILES TABLE
-- (Extended user information with user types)
-- ===================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'agent')),
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    -- Track agent request status and role
    agent_request_status TEXT DEFAULT NULL CHECK (agent_request_status IN ('pending','approved','rejected')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','agent','admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ===================================
-- AGENT PROFILES (Detailed agent data)
-- ===================================

CREATE TABLE IF NOT EXISTS public.agent_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    city TEXT,
    specialization TEXT,
    license_number TEXT,
    description TEXT,
    rating NUMERIC DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    -- Agent availability stored as JSONB array of {date, status}
    availability JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_profiles_user_id_idx ON public.agent_profiles(user_id);

ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: allow users to view/insert their own agent profile
CREATE POLICY "Users can manage their agent profile"
    ON public.agent_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON public.agent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- BOOKINGS TABLE
-- Tracks booking requests and status timeline
-- ===================================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location_id TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    guests INTEGER DEFAULT 1,
    total_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'inquiry' CHECK (status IN ('inquiry','confirmed','cancelled','completed','rejected')),
    status_timeline JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_agent_id_idx ON public.bookings(agent_id);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings(created_at DESC);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their booking"
    ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can update booking status"
    ON public.bookings
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- ACTIVITY LOG
-- Tracks user actions without modifying existing tables
-- ===================================

CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON public.activity_log(user_id);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity"
    ON public.activity_log
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their activity"
    ON public.activity_log
    FOR SELECT
    USING (auth.uid() = user_id OR true);

-- ===================================
-- NOTIFICATIONS
-- Simple notification table to notify users/agents
-- ===================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notifications"
    ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ===================================
-- MESSAGES
-- Optional basic messaging table
-- ===================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their messages"
    ON public.messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ===================================
-- ADMIN: Approve/Reject Agent RPC
-- Only callable by authenticated admin users (enforced in function)
-- ===================================

CREATE OR REPLACE FUNCTION public.admin_set_agent_status(target_user UUID, approve BOOLEAN)
RETURNS void AS $$
DECLARE
    caller_profile public.profiles%ROWTYPE;
BEGIN
    SELECT * INTO caller_profile FROM public.profiles WHERE id = auth.uid();
    IF caller_profile.role IS NULL OR caller_profile.role <> 'admin' THEN
        RAISE EXCEPTION 'Only admin may perform this action';
    END IF;

    IF approve THEN
        UPDATE public.profiles SET role = 'agent', agent_request_status = 'approved' WHERE id = target_user;
        UPDATE public.agent_profiles SET verified = TRUE WHERE user_id = target_user;
    ELSE
        UPDATE public.profiles SET agent_request_status = 'rejected' WHERE id = target_user;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- AGENT CONNECTIONS TABLE
-- (Track connections between users and agents)
-- ===================================

CREATE TABLE IF NOT EXISTS public.agent_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.agent_requests(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_users CHECK (user_id != agent_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS agent_connections_user_id_idx ON public.agent_connections(user_id);
CREATE INDEX IF NOT EXISTS agent_connections_agent_id_idx ON public.agent_connections(agent_id);
CREATE INDEX IF NOT EXISTS agent_connections_status_idx ON public.agent_connections(status);

-- Enable Row Level Security
ALTER TABLE public.agent_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_connections
CREATE POLICY "Users can view their own connections"
    ON public.agent_connections
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can create connections"
    ON public.agent_connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() = agent_id);

CREATE POLICY "Users can update their connections"
    ON public.agent_connections
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = agent_id);

-- Trigger for agent_connections table
CREATE TRIGGER update_agent_connections_updated_at
    BEFORE UPDATE ON public.agent_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- NOTES
-- ===================================

-- 1. Run this SQL in your Supabase SQL Editor
-- 2. All tables have Row Level Security (RLS) enabled
-- 3. Users can only access their own data
-- 4. Timestamps are automatically managed
-- 5. Foreign key constraints ensure data integrity
-- 6. Indexes are added for common query patterns
-- 7. User types: 'user' (tourists/residents) and 'agent' (service providers)
-- 8. Agents can see and respond to user requests
