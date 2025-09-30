import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import {
  stripe,
  validateTipAmount,
  calculatePlatformFee,
  estimateStripeFee,
  calculateArtistAmount,
} from '../_shared/stripe.ts';

interface PaymentIntentRequest {
  artistId: string;
  amount: number; // in cents
  currency?: string;
  songRequest?: string;
  customerName?: string;
  customerMessage?: string;
  sessionCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabase = createSupabaseClient(authHeader);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const body: PaymentIntentRequest = await req.json();
    const { artistId, amount, currency = 'usd', songRequest, customerName, customerMessage, sessionCode } = body;

    // Validate tip amount
    const validation = validateTipAmount(amount);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get artist profile
    const { data: artistProfile, error: artistError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .eq('role', 'artist')
      .single();

    if (artistError || !artistProfile) {
      return new Response(JSON.stringify({ error: 'Artist not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get artist's Stripe account
    const { data: artistAccount, error: accountError } = await supabase
      .from('artist_accounts')
      .select('*')
      .eq('user_id', artistId)
      .single();

    if (accountError || !artistAccount) {
      return new Response(JSON.stringify({ error: 'Artist has not connected their Stripe account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!artistAccount.charges_enabled) {
      return new Response(JSON.stringify({ error: 'Artist account is not ready to accept payments' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate fees
    const platformFee = calculatePlatformFee(amount);
    const stripeFee = estimateStripeFee(amount);
    const artistAmount = calculateArtistAmount(amount);

    // Get or create artist session if sessionCode provided
    let artistSessionId = null;
    if (sessionCode) {
      const { data: session, error: sessionError } = await supabase
        .from('artist_sessions')
        .select('id')
        .eq('session_code', sessionCode)
        .eq('is_active', true)
        .single();

      if (!sessionError && session) {
        artistSessionId = session.id;
      }
    }

    // Create Stripe Payment Intent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: artistAccount.stripe_account_id,
      },
      metadata: {
        artist_id: artistId,
        customer_id: user.id,
        song_request: songRequest || '',
        customer_name: customerName || '',
        customer_message: customerMessage || '',
        artist_session_id: artistSessionId || '',
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    // Store payment in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        artist_id: artistId,
        customer_id: user.id,
        artist_session_id: artistSessionId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_total: amount,
        amount_platform_fee: platformFee,
        amount_stripe_fee: stripeFee,
        amount_artist: artistAmount,
        status: 'pending',
        currency,
        song_request: songRequest,
        customer_name: customerName,
        customer_message: customerMessage,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      // Payment intent created but DB insert failed - log this for manual reconciliation
      // In production, you'd want to handle this more gracefully
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment?.id,
        breakdown: {
          total: amount,
          platformFee,
          stripeFee,
          artistReceives: artistAmount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
