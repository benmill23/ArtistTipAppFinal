import { useEffect, useRef } from 'react'
import { useAuthStore } from '../lib/auth-store'
import { AuthState, AuthActions } from '../types/auth.types'

/**
 * Custom hook for authentication that provides auth state and actions
 * @returns AuthState & AuthActions
 */
export const useAuth = (): AuthState & AuthActions => {
  const authStore = useAuthStore()
  const hasInitialized = useRef(false)

  // Initialize auth only once when component mounts
  useEffect(() => {
    if (!hasInitialized.current && !authStore.initialized && !authStore.loading) {
      hasInitialized.current = true
      authStore.initialize().catch(console.error)
    }
  }, [authStore.initialized, authStore.loading, authStore.initialize])

  return authStore
}

/**
 * Hook to check if user is authenticated
 * @returns boolean indicating if user is logged in
 */
export const useIsAuthenticated = (): boolean => {
  const { user } = useAuth()
  return !!user
}

/**
 * Hook to get current user profile
 * @returns User profile or null
 */
export const useCurrentUser = () => {
  const { user, profile } = useAuth()
  return { user, profile }
}

/**
 * Hook that requires authentication - redirects if not authenticated
 * @param redirectTo - Where to redirect if not authenticated (default: '/login')
 * @returns AuthState & AuthActions or null if redirecting
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const auth = useAuth()
  const { user, initialized } = auth

  useEffect(() => {
    if (initialized && !user) {
      // In a real app, you'd use React Router navigate here
      window.location.href = redirectTo
    }
  }, [user, initialized, redirectTo])

  // Don't return auth state if not authenticated
  if (initialized && !user) {
    return null
  }

  return auth
}