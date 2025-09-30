import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { stripe } from '../_shared/stripe.ts';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Webhook signature or secret missing', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log(`Received event: ${event.type}`);

    // Create Supabase client with service role for webhook processing
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      // Payment succeeded
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            stripe_charge_id: paymentIntent.latest_charge,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Error updating payment:', updateError);
        }

        // If there's a song request, add to queue
        const metadata = paymentIntent.metadata;
        if (metadata.song_request && metadata.artist_session_id) {
          // Get current queue position
          const { data: queueData, error: queueError } = await supabase
            .from('song_queue')
            .select('queue_position')
            .eq('artist_session_id', metadata.artist_session_id)
            .order('queue_position', { ascending: false })
            .limit(1);

          const nextPosition = queueData && queueData.length > 0
            ? queueData[0].queue_position + 1
            : 1;

          // Get payment ID
          const { data: payment } = await supabase
            .from('payments')
            .select('id')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single();

          if (payment) {
            await supabase.from('song_queue').insert({
              payment_id: payment.id,
              artist_session_id: metadata.artist_session_id,
              song_request: metadata.song_request,
              customer_name: metadata.customer_name || 'Anonymous',
              tip_amount: paymentIntent.amount,
              queue_position: nextPosition,
              status: 'pending',
            });
          }
        }

        console.log(`Payment ${paymentIntent.id} succeeded`);
        break;
      }

      // Payment failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        await supabase
          .from('payments')
          .update({
            status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        console.log(`Payment ${paymentIntent.id} failed`);
        break;
      }

      // Payment processing
      case 'payment_intent.processing': {
        const paymentIntent = event.data.object;

        await supabase
          .from('payments')
          .update({
            status: 'processing',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        console.log(`Payment ${paymentIntent.id} processing`);
        break;
      }

      // Refund issued
      case 'charge.refunded': {
        const charge = event.data.object;

        await supabase
          .from('payments')
          .update({
            status: 'refunded',
          })
          .eq('stripe_charge_id', charge.id);

        console.log(`Charge ${charge.id} refunded`);
        break;
      }

      // Account updated
      case 'account.updated': {
        const account = event.data.object;

        await supabase
          .from('artist_accounts')
          .update({
            stripe_account_status: account.charges_enabled ? 'active' : 'pending',
            onboarding_completed: account.details_submitted || false,
            charges_enabled: account.charges_enabled || false,
            payouts_enabled: account.payouts_enabled || false,
            details_submitted: account.details_submitted || false,
          })
          .eq('stripe_account_id', account.id);

        console.log(`Account ${account.id} updated`);
        break;
      }

      // Payout paid
      case 'payout.paid': {
        const payout = event.data.object;

        // Check if this is for a connected account
        if (payout.destination) {
          // Find artist by stripe account
          const { data: artistAccount } = await supabase
            .from('artist_accounts')
            .select('user_id')
            .eq('stripe_account_id', payout.destination)
            .single();

          if (artistAccount) {
            // Store payout record
            await supabase.from('payouts').insert({
              artist_id: artistAccount.user_id,
              stripe_payout_id: payout.id,
              amount: payout.amount,
              currency: payout.currency,
              status: 'paid',
              arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
            });
          }
        }

        console.log(`Payout ${payout.id} paid`);
        break;
      }

      // Payout failed
      case 'payout.failed': {
        const payout = event.data.object;

        await supabase
          .from('payouts')
          .update({
            status: 'failed',
          })
          .eq('stripe_payout_id', payout.id);

        console.log(`Payout ${payout.id} failed`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
