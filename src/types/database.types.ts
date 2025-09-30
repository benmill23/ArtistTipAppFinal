export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      artist_accounts: {
        Row: {
          charges_enabled: boolean
          created_at: string
          details_submitted: boolean
          id: string
          onboarding_completed: boolean
          payouts_enabled: boolean
          stripe_account_id: string
          stripe_account_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          onboarding_completed?: boolean
          payouts_enabled?: boolean
          stripe_account_id: string
          stripe_account_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          charges_enabled?: boolean
          created_at?: string
          details_submitted?: boolean
          id?: string
          onboarding_completed?: boolean
          payouts_enabled?: boolean
          stripe_account_id?: string
          stripe_account_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_sessions: {
        Row: {
          artist_id: string
          created_at: string
          ended_at: string | null
          id: string
          is_active: boolean
          location: string | null
          session_code: string
          started_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          session_code: string
          started_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          session_code?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_sessions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_artist: number
          amount_platform_fee: number
          amount_stripe_fee: number
          amount_total: number
          artist_id: string
          artist_session_id: string | null
          created_at: string
          currency: string
          customer_id: string | null
          customer_message: string | null
          customer_name: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          refund_reason: string | null
          song_request: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_payment_intent_id: string
          updated_at: string
        }
        Insert: {
          amount_artist: number
          amount_platform_fee: number
          amount_stripe_fee: number
          amount_total: number
          artist_id: string
          artist_session_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_message?: string | null
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          refund_reason?: string | null
          song_request?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id: string
          updated_at?: string
        }
        Update: {
          amount_artist?: number
          amount_platform_fee?: number
          amount_stripe_fee?: number
          amount_total?: number
          artist_id?: string
          artist_session_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_message?: string | null
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          refund_reason?: string | null
          song_request?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_artist_session_id_fkey"
            columns: ["artist_session_id"]
            isOneToOne: false
            referencedRelation: "artist_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          arrival_date: string | null
          artist_id: string
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id: string
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          artist_id: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id: string
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          artist_id?: string
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_payout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          artist_id: string
          ended_at: string | null
          id: string
          minimum_tip_amount: number
          qr_code_url: string | null
          started_at: string
          status: string
          total_earnings: number
          total_requests: number
        }
        Insert: {
          artist_id: string
          ended_at?: string | null
          id?: string
          minimum_tip_amount?: number
          qr_code_url?: string | null
          started_at?: string
          status?: string
          total_earnings?: number
          total_requests?: number
        }
        Update: {
          artist_id?: string
          ended_at?: string | null
          id?: string
          minimum_tip_amount?: number
          qr_code_url?: string | null
          started_at?: string
          status?: string
          total_earnings?: number
          total_requests?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      song_queue: {
        Row: {
          artist_session_id: string
          created_at: string
          customer_name: string | null
          id: string
          payment_id: string
          played_at: string | null
          queue_position: number
          song_request: string
          status: string
          tip_amount: number
        }
        Insert: {
          artist_session_id: string
          created_at?: string
          customer_name?: string | null
          id?: string
          payment_id: string
          played_at?: string | null
          queue_position: number
          song_request: string
          status?: string
          tip_amount: number
        }
        Update: {
          artist_session_id?: string
          created_at?: string
          customer_name?: string | null
          id?: string
          payment_id?: string
          played_at?: string | null
          queue_position?: number
          song_request?: string
          status?: string
          tip_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_queue_artist_session_id_fkey"
            columns: ["artist_session_id"]
            isOneToOne: false
            referencedRelation: "artist_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_queue_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      song_requests: {
        Row: {
          created_at: string
          id: string
          played_at: string | null
          queue_position: number
          requester_name: string | null
          session_id: string
          song_title: string
          status: string
          stripe_payment_intent_id: string | null
          tip_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          played_at?: string | null
          queue_position: number
          requester_name?: string | null
          session_id: string
          song_title: string
          status?: string
          stripe_payment_intent_id?: string | null
          tip_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          played_at?: string | null
          queue_position?: number
          requester_name?: string | null
          session_id?: string
          song_title?: string
          status?: string
          stripe_payment_intent_id?: string | null
          tip_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          id: string
          net_amount: number | null
          platform_fee: number | null
          request_id: string | null
          session_id: string
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string
          id?: string
          net_amount?: number | null
          platform_fee?: number | null
          request_id?: string | null
          session_id: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          id?: string
          net_amount?: number | null
          platform_fee?: number | null
          request_id?: string | null
          session_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          artist_name: string | null
          birthday: string | null
          created_at: string
          email: string | null
          id: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          artist_name?: string | null
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          artist_name?: string | null
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
      payout_status: "pending" | "paid" | "failed"
      user_role: "artist" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
      ],
      payout_status: ["pending", "paid", "failed"],
      user_role: ["artist", "customer"],
    },
  },
} as const

// Export commonly used types
export type User = Tables<'profiles'>
export type ArtistAccount = Tables<'artist_accounts'>
export type Payment = Tables<'payments'>
export type ArtistSession = Tables<'artist_sessions'>
export type SongQueue = Tables<'song_queue'>
export type Payout = Tables<'payouts'>
