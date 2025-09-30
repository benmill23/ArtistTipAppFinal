import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!)

/**
 * Creates a Stripe Connect Express account for an artist
 * @param userId - The user ID from Supabase Auth
 * @param email - The user's email
 * @param country - The user's country (default: US)
 * @returns Promise with account creation result
 */
export const createStripeConnectAccount = async (
  userId: string,
  email: string,
  country: string = 'US'
): Promise<{ accountId: string; onboardingUrl: string }> => {
  try {
    // Call your backend API to create Stripe Connect account
    const response = await fetch('/api/stripe/create-connect-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        email,
        country,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe Connect account')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    throw error
  }
}

/**
 * Creates a Stripe Customer for subscription billing
 * @param userId - The user ID from Supabase Auth
 * @param email - The user's email
 * @param name - The customer's name
 * @returns Promise with customer ID
 */
export const createStripeCustomer = async (
  userId: string,
  email: string,
  name: string
): Promise<string> => {
  try {
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        email,
        name,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe customer')
    }

    const data = await response.json()
    return data.customerId
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Creates a subscription for the artist
 * @param customerId - The Stripe customer ID
 * @param priceId - The Stripe price ID for the subscription
 * @returns Promise with subscription data
 */
export const createSubscription = async (
  customerId: string,
  priceId: string
): Promise<any> => {
  try {
    const response = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        customerId,
        priceId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create subscription')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

/**
 * Gets the Stripe Connect account status
 * @param accountId - The Stripe Connect account ID
 * @returns Promise with account status
 */
export const getConnectAccountStatus = async (accountId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/stripe/connect-account-status/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get account status')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting account status:', error)
    throw error
  }
}

/**
 * Creates a payment intent for song requests
 * @param amount - Amount in cents
 * @param artistStripeAccountId - The artist's Stripe Connect account ID
 * @param metadata - Additional metadata for the payment
 * @returns Promise with payment intent
 */
export const createPaymentIntent = async (
  amount: number,
  artistStripeAccountId: string,
  metadata: Record<string, string>
): Promise<any> => {
  try {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        artistStripeAccountId,
        metadata,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}