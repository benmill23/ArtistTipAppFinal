import Stripe from 'https://esm.sh/stripe@17.5.0?target=deno';

// Initialize Stripe with the secret key from environment
export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// Platform fee percentage (1%)
export const PLATFORM_FEE_PERCENTAGE = 0.01;

// Minimum and maximum tip amounts (in cents)
export const MIN_TIP_AMOUNT = 1000; // $10
export const MAX_TIP_AMOUNT = 50000; // $500

/**
 * Calculate platform fee from total amount
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE);
}

/**
 * Estimate Stripe fee (2.9% + $0.30)
 */
export function estimateStripeFee(amount: number): number {
  return Math.round(amount * 0.029 + 30);
}

/**
 * Calculate artist payout after platform and Stripe fees
 */
export function calculateArtistAmount(amount: number): number {
  const platformFee = calculatePlatformFee(amount);
  const stripeFee = estimateStripeFee(amount);
  return amount - platformFee - stripeFee;
}

/**
 * Validate tip amount
 */
export function validateTipAmount(amount: number): { valid: boolean; error?: string } {
  if (amount < MIN_TIP_AMOUNT) {
    return { valid: false, error: `Minimum tip amount is $${MIN_TIP_AMOUNT / 100}` };
  }
  if (amount > MAX_TIP_AMOUNT) {
    return { valid: false, error: `Maximum tip amount is $${MAX_TIP_AMOUNT / 100}` };
  }
  return { valid: true };
}
