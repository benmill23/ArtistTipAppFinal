import { User as SupabaseUser } from '@supabase/supabase-js'
import { User } from './database.types'

export interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  initialized: boolean
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  initialize: () => Promise<void>
}

export interface SignUpData {
  email: string
  password: string
  username: string
  artist_name: string
  birthday: string
}

export interface AuthStore extends AuthState, AuthActions {}