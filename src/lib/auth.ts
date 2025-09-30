import { supabase } from './supabase'

/**
 * Validates if a username is URL-safe and follows our rules
 * @param username - The username to validate
 * @returns boolean indicating if username is valid
 */
export const isValidUsername = (username: string): boolean => {
  // Check length (3-30 characters)
  if (username.length < 3 || username.length > 30) {
    return false
  }

  // Check if URL-safe: alphanumeric, hyphens, underscores only
  const urlSafeRegex = /^[a-zA-Z0-9_-]+$/
  if (!urlSafeRegex.test(username)) {
    return false
  }

  // Cannot start or end with hyphen or underscore
  if (username.startsWith('-') || username.startsWith('_') ||
      username.endsWith('-') || username.endsWith('_')) {
    return false
  }

  // Reserved usernames
  const reserved = [
    'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'test',
    'dashboard', 'settings', 'profile', 'account', 'signup', 'login',
    'register', 'auth', 'oauth', 'callback', 'webhook', 'stripe',
    'billing', 'payment', 'support', 'help', 'about', 'contact',
    'privacy', 'terms', 'tos', 'legal', 'dev', 'staging', 'prod'
  ]

  if (reserved.includes(username.toLowerCase())) {
    return false
  }

  return true
}

/**
 * Checks if a username is available in the database
 * @param username - The username to check
 * @returns Promise<boolean> indicating availability
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    // If error code is PGRST116, it means no rows found (username available)
    if (error && error.code === 'PGRST116') {
      return true
    }

    // If no error and data exists, username is taken
    if (data) {
      return false
    }

    // If other error, throw it
    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error checking username availability:', error)
    throw error
  }
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns object with isValid boolean and errors array
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates age (must be 18+)
 * @param birthday - The birthday string (YYYY-MM-DD)
 * @returns boolean indicating if user is 18+
 */
export const isValidAge = (birthday: string): boolean => {
  const birthDate = new Date(birthday)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18
  }

  return age >= 18
}

/**
 * Gets the current authenticated user's profile
 * @returns Promise<User | null>
 */
export const getCurrentUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return profile
  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}

/**
 * Checks if current user has an active session
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export const hasActiveSession = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id')
      .eq('artist_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code === 'PGRST116') {
      return false // No active session found
    }

    if (error) {
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error checking active session:', error)
    return false
  }
}