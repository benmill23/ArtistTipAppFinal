# Stripe Setup Complete ✅

## What's Been Done

1. ✅ Removed secret keys from frontend (.env and .env.local)
2. ✅ Created database schema for Stripe integration
3. ✅ Created and deployed 3 Edge Functions:
   - `create-payment-intent` - Creates payment intents for tips
   - `create-connect-account` - Handles artist Stripe Connect onboarding
   - `stripe-webhook` - Processes Stripe webhook events
4. ✅ Configured Stripe secret key in Supabase secrets

## Important URLs

### Edge Function URLs
- **Create Payment Intent**: `https://qhdihaabdwpwuzqiwyhm.supabase.co/functions/v1/create-payment-intent`
- **Create Connect Account**: `https://qhdihaabdwpwuzqiwyhm.supabase.co/functions/v1/create-connect-account`
- **Stripe Webhook**: `https://qhdihaabdwpwuzqiwyhm.supabase.co/functions/v1/stripe-webhook`

## Next Steps

### 1. Configure Stripe Webhook

You need to tell Stripe to send events to your webhook endpoint:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter this URL: `https://qhdihaabdwpwuzqiwyhm.supabase.co/functions/v1/stripe-webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `charge.refunded`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)

### 2. Add Webhook Secret to Supabase

Run this command (replace with your actual webhook secret):

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE --project-ref qhdihaabdwpwuzqiwyhm
```

### 3. Enable Stripe Connect

1. Go to: https://dashboard.stripe.com/test/connect/accounts/overview
2. Make sure Connect is enabled
3. Verify Express accounts are supported

## Database Schema Created

The following tables have been created:

- **profiles** - User profiles with role (artist/customer)
- **artist_accounts** - Stripe Connect account info for artists
- **artist_sessions** - Active tipping sessions with QR codes
- **payments** - All payment transactions with fee breakdown
- **song_queue** - Song requests tied to payments
- **payouts** - Artist payout tracking

## Security Features

- ✅ Secret keys stored securely in Supabase (never exposed to frontend)
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Proper authentication required for all endpoints
- ✅ Webhook signature verification
- ✅ Payment amount validation ($10-$500)

## Fee Structure

- Customer pays: **$100.00** (example)
- Platform fee (1%): **$1.00**
- Stripe fee (2.9% + $0.30): **$3.20**
- Artist receives: **$95.80**

All fees are calculated automatically in the Edge Function.

## Testing the Setup

Once you complete the webhook configuration, we can test:

1. Artist onboarding flow
2. Creating a payment
3. Webhook processing
4. Payment confirmation
