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
