import { supabase } from './supabase';

const SUPABASE_FUNCTIONS_URL = process.env.REACT_APP_SUPABASE_URL!.replace(
  'https://',
  ''
).replace('.supabase.co', '');

const FUNCTIONS_BASE_URL = `https://${SUPABASE_FUNCTIONS_URL}.supabase.co/functions/v1`;

/**
 * Create a payment intent for tipping an artist
 */
export async function createPaymentIntent(params: {
  artistId: string;
  amount: number;
  songRequest?: string;
  customerName?: string;
  customerMessage?: string;
  sessionCode?: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
}

/**
 * Create or retrieve Stripe Connect account for artist onboarding
 */
export async function createConnectAccount(params?: {
  returnUrl?: string;
  refreshUrl?: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${FUNCTIONS_BASE_URL}/create-connect-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params || {}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create connect account');
  }

  return response.json();
}

/**
 * Get artist's Stripe account status
 */
export async function getArtistAccountStatus(userId: string) {
  const { data, error } = await supabase
    .from('artist_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    throw error;
  }

  return data;
}

/**
 * Get artist's payments
 */
export async function getArtistPayments(artistId: string, limit = 50) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Get artist's active session
 */
export async function getActiveArtistSession(artistId: string) {
  const { data, error } = await supabase
    .from('artist_sessions')
    .select('*')
    .eq('artist_id', artistId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Create a new artist session
 */
export async function createArtistSession(params: {
  artistId: string;
  location?: string;
}) {
  // Generate a unique session code
  const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data, error } = await supabase
    .from('artist_sessions')
    .insert({
      artist_id: params.artistId,
      session_code: sessionCode,
      location: params.location,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * End an artist session
 */
export async function endArtistSession(sessionId: string) {
  const { data, error } = await supabase
    .from('artist_sessions')
    .update({
      is_active: false,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get song queue for a session
 */
export async function getSongQueue(sessionId: string) {
  const { data, error } = await supabase
    .from('song_queue')
    .select('*')
    .eq('artist_session_id', sessionId)
    .order('queue_position', { ascending: true });

  if (error) throw error;

  return data;
}
