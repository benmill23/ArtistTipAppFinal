export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          artist_name: string
          birthday: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          subscription_status: 'active' | 'past_due' | 'canceled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          artist_name: string
          birthday: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'past_due' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          artist_name?: string
          birthday?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'past_due' | 'canceled'
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          artist_id: string
          status: 'active' | 'ended'
          minimum_tip_amount: number
          started_at: string
          ended_at: string | null
          total_earnings: number
          total_requests: number
          qr_code_url: string | null
        }
        Insert: {
          id?: string
          artist_id: string
          status?: 'active' | 'ended'
          minimum_tip_amount?: number
          started_at?: string
          ended_at?: string | null
          total_earnings?: number
          total_requests?: number
          qr_code_url?: string | null
        }
        Update: {
          id?: string
          artist_id?: string
          status?: 'active' | 'ended'
          minimum_tip_amount?: number
          started_at?: string
          ended_at?: string | null
          total_earnings?: number
          total_requests?: number
          qr_code_url?: string | null
        }
      }
      song_requests: {
        Row: {
          id: string
          session_id: string
          song_title: string
          requester_name: string | null
          tip_amount: number
          queue_position: number
          status: 'pending' | 'playing' | 'completed' | 'skipped'
          stripe_payment_intent_id: string
          created_at: string
          played_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          song_title: string
          requester_name?: string | null
          tip_amount: number
          queue_position?: number
          status?: 'pending' | 'playing' | 'completed' | 'skipped'
          stripe_payment_intent_id: string
          created_at?: string
          played_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          song_title?: string
          requester_name?: string | null
          tip_amount?: number
          queue_position?: number
          status?: 'pending' | 'playing' | 'completed' | 'skipped'
          stripe_payment_intent_id?: string
          created_at?: string
          played_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          artist_id: string
          session_id: string
          request_id: string
          amount: number
          platform_fee: number
          net_amount: number
          stripe_payment_intent_id: string
          status: 'pending' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          session_id: string
          request_id: string
          amount: number
          platform_fee: number
          net_amount: number
          stripe_payment_intent_id: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          session_id?: string
          request_id?: string
          amount?: number
          platform_fee?: number
          net_amount?: number
          stripe_payment_intent_id?: string
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SongRequest = Database['public']['Tables']['song_requests']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']