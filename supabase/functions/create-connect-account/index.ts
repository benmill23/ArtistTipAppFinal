import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase.ts';
import { stripe } from '../_shared/stripe.ts';

interface CreateAccountRequest {
  returnUrl?: string;
  refreshUrl?: string;
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
    const body: CreateAccountRequest = await req.json();
    const { returnUrl, refreshUrl } = body;

    // Check if user already has a Stripe account
    const { data: existingAccount } = await supabase
      .from('artist_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let accountId: string;
    let isNewAccount = false;

    if (existingAccount) {
      // Use existing account
      accountId = existingAccount.stripe_account_id;

      // Update account status from Stripe
      const account = await stripe.accounts.retrieve(accountId);
      await supabase
        .from('artist_accounts')
        .update({
          onboarding_completed: account.details_submitted || false,
          charges_enabled: account.charges_enabled || false,
          payouts_enabled: account.payouts_enabled || false,
          details_submitted: account.details_submitted || false,
          stripe_account_status: account.charges_enabled ? 'active' : 'pending',
        })
        .eq('user_id', user.id);
    } else {
      // Create new Stripe Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
              delay_days: 'minimum', // Get paid as fast as possible
            },
          },
        },
      });

      accountId = account.id;
      isNewAccount = true;

      // Store in database
      const { error: insertError } = await supabase.from('artist_accounts').insert({
        user_id: user.id,
        stripe_account_id: accountId,
        stripe_account_status: 'pending',
        onboarding_completed: false,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });

      if (insertError) {
        console.error('Error storing artist account:', insertError);
        throw new Error('Failed to store artist account');
      }

      // Update user role to artist
      await supabase.from('profiles').update({ role: 'artist' }).eq('id', user.id);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${req.headers.get('origin')}/dashboard/artist/onboarding`,
      return_url: returnUrl || `${req.headers.get('origin')}/dashboard/artist/onboarding/complete`,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId,
        isNewAccount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating connect account:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
