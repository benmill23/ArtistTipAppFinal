import { create } from 'zustand'
import { supabase } from './supabase'
import { AuthStore, SignUpData } from '../types/auth.types'
import { User } from '../types/database.types'
import { toast } from 'react-hot-toast'

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true })

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
      })

      // Get initial session with timeout
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        timeoutPromise
      ]) as any

      if (error) {
        console.error('Error getting session:', error)
        set({ initialized: true, loading: false })
        return
      }

      if (session?.user) {
        // Try to fetch user profile, but don't fail if table doesn't exist
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          }

          set({
            user: session.user,
            profile: profile || null,
            initialized: true
          })
        } catch (profileError) {
          console.warn('Profile table may not exist yet:', profileError)
          set({
            user: session.user,
            profile: null,
            initialized: true
          })
        }
      } else {
        set({
          user: null,
          profile: null,
          initialized: true
        })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile:', profileError)
            }

            set({
              user: session.user,
              profile: profile || null
            })
          } catch (profileError) {
            console.warn('Profile table may not exist yet:', profileError)
            set({
              user: session.user,
              profile: null
            })
          }
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null
          })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ initialized: true })
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        }

        set({
          user: data.user,
          profile: profile || null
        })

        toast.success('Welcome back!')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (data: SignUpData) => {
    set({ loading: true })

    try {
      // Check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', data.username)
        .single()

      if (existingUser) {
        throw new Error('Username is already taken')
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          username: data.username,
          artist_name: data.artist_name,
          birthday: data.birthday,
          subscription_status: 'canceled' as const, // Will be updated after Stripe setup
        })

      if (profileError) {
        throw profileError
      }

      toast.success('Account created! Please check your email to verify your account.')

    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true })

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      set({
        user: null,
        profile: null
      })

      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error(error.message || 'Failed to sign out')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=recovery`,
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sent!')
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Failed to send reset email')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ loading: true })

    try {
      // Ensure there is an active session (including recovery session from the email link)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session. Please open the reset link from your email again.')
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      toast.success('Password updated successfully')
    } catch (error: any) {
      console.error('Update password error:', error)
      toast.error(error.message || 'Failed to update password')
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    const { user } = get()

    if (!user) {
      throw new Error('No authenticated user')
    }

    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      set({ profile: data })
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error(error.message || 'Failed to update profile')
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))