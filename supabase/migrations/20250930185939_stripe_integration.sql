-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('artist', 'customer');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');

-- Create enum for payout status
CREATE TYPE payout_status AS ENUM ('pending', 'paid', 'failed');

-- Extend auth.users with profile information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create artist_accounts table for Stripe Connect
CREATE TABLE IF NOT EXISTS public.artist_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL UNIQUE,
    stripe_account_id TEXT UNIQUE NOT NULL,
    stripe_account_status TEXT NOT NULL DEFAULT 'pending', -- pending, active, restricted, disabled
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    charges_enabled BOOLEAN NOT NULL DEFAULT false,
    payouts_enabled BOOLEAN NOT NULL DEFAULT false,
    details_submitted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create artist_sessions table for tracking active tipping sessions
CREATE TABLE IF NOT EXISTS public.artist_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.profiles(id) NOT NULL,
    session_code TEXT UNIQUE NOT NULL, -- QR code identifier
    is_active BOOLEAN NOT NULL DEFAULT true,
    location TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payments table for tracking all transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.profiles(id) NOT NULL,
    customer_id UUID REFERENCES public.profiles(id),
    artist_session_id UUID REFERENCES public.artist_sessions(id),

    -- Stripe details
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_charge_id TEXT,

    -- Amount breakdown (in cents)
    amount_total INTEGER NOT NULL, -- Total amount customer paid
    amount_platform_fee INTEGER NOT NULL, -- 1% platform fee
    amount_stripe_fee INTEGER NOT NULL, -- Stripe's fee (estimated)
    amount_artist INTEGER NOT NULL, -- Amount artist receives

    -- Payment details
    status payment_status NOT NULL DEFAULT 'pending',
    currency TEXT NOT NULL DEFAULT 'usd',
    payment_method TEXT, -- card, apple_pay, google_pay

    -- Song request (optional)
    song_request TEXT,
    customer_name TEXT,
    customer_message TEXT,

    -- Metadata
    refund_reason TEXT,
    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create queue table for song requests
CREATE TABLE IF NOT EXISTS public.song_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) NOT NULL UNIQUE,
    artist_session_id UUID REFERENCES public.artist_sessions(id) NOT NULL,

    song_request TEXT NOT NULL,
    customer_name TEXT,
    tip_amount INTEGER NOT NULL,

    queue_position INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, playing, completed, skipped

    played_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payouts table for tracking artist payouts
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.profiles(id) NOT NULL,
    stripe_payout_id TEXT UNIQUE NOT NULL,

    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status payout_status NOT NULL DEFAULT 'pending',

    arrival_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_artist_accounts_user_id ON public.artist_accounts(user_id);
CREATE INDEX idx_artist_accounts_stripe_id ON public.artist_accounts(stripe_account_id);

CREATE INDEX idx_artist_sessions_artist_id ON public.artist_sessions(artist_id);
CREATE INDEX idx_artist_sessions_code ON public.artist_sessions(session_code);
CREATE INDEX idx_artist_sessions_active ON public.artist_sessions(is_active);

CREATE INDEX idx_payments_artist_id ON public.payments(artist_id);
CREATE INDEX idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX idx_payments_stripe_intent ON public.payments(stripe_payment_intent_id);

CREATE INDEX idx_queue_session_id ON public.song_queue(artist_session_id);
CREATE INDEX idx_queue_status ON public.song_queue(status);
CREATE INDEX idx_queue_position ON public.song_queue(queue_position);

CREATE INDEX idx_payouts_artist_id ON public.payouts(artist_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_accounts_updated_at BEFORE UPDATE ON public.artist_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view artist profiles" ON public.profiles
    FOR SELECT USING (role = 'artist');

-- RLS Policies for artist_accounts
CREATE POLICY "Artists can view their own account" ON public.artist_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can update their own account" ON public.artist_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for artist_sessions
CREATE POLICY "Artists can manage their own sessions" ON public.artist_sessions
    FOR ALL USING (auth.uid() = artist_id);

CREATE POLICY "Anyone can view active sessions" ON public.artist_sessions
    FOR SELECT USING (is_active = true);

-- RLS Policies for payments
CREATE POLICY "Artists can view their payments" ON public.payments
    FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Customers can view their payments" ON public.payments
    FOR SELECT USING (auth.uid() = customer_id);

-- RLS Policies for song_queue
CREATE POLICY "Artists can view their queue" ON public.song_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.artist_sessions
            WHERE artist_sessions.id = song_queue.artist_session_id
            AND artist_sessions.artist_id = auth.uid()
        )
    );

CREATE POLICY "Artists can update their queue" ON public.song_queue
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.artist_sessions
            WHERE artist_sessions.id = song_queue.artist_session_id
            AND artist_sessions.artist_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view queue by session" ON public.song_queue
    FOR SELECT USING (true);

-- RLS Policies for payouts
CREATE POLICY "Artists can view their payouts" ON public.payouts
    FOR SELECT USING (auth.uid() = artist_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
