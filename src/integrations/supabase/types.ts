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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_shares: {
        Row: {
          access_type: string
          created_at: string
          credential_id: string
          current_views: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_views: number | null
          owner_id: string
          share_token: string | null
          shared_with_id: string | null
        }
        Insert: {
          access_type?: string
          created_at?: string
          credential_id: string
          current_views?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          owner_id: string
          share_token?: string | null
          shared_with_id?: string | null
        }
        Update: {
          access_type?: string
          created_at?: string
          credential_id?: string
          current_views?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          owner_id?: string
          share_token?: string | null
          shared_with_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_shares_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credential_shares_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credential_shares_shared_with_id_fkey"
            columns: ["shared_with_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          blockchain_tx_hash: string | null
          created_at: string
          credential_hash: string
          credential_id: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          description: string | null
          id: string
          ipfs_cid: string | null
          issued_at: string
          issuer_id: string
          merkle_root: string | null
          metadata: Json | null
          revocation_reason: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["credential_status"]
          subject_id: string
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          blockchain_tx_hash?: string | null
          created_at?: string
          credential_hash: string
          credential_id: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          description?: string | null
          id?: string
          ipfs_cid?: string | null
          issued_at?: string
          issuer_id: string
          merkle_root?: string | null
          metadata?: Json | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          subject_id: string
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          blockchain_tx_hash?: string | null
          created_at?: string
          credential_hash?: string
          credential_id?: string
          credential_type?: Database["public"]["Enums"]["credential_type"]
          description?: string | null
          id?: string
          ipfs_cid?: string | null
          issued_at?: string
          issuer_id?: string
          merkle_root?: string | null
          metadata?: Json | null
          revocation_reason?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          subject_id?: string
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_issuer_id_fkey"
            columns: ["issuer_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_proposals: {
        Row: {
          action_type: Database["public"]["Enums"]["governance_action"]
          created_at: string
          description: string
          executed_at: string | null
          expires_at: string
          id: string
          is_executed: boolean | null
          metadata: Json | null
          proposer_id: string | null
          quorum_required: number | null
          target_id: string | null
          title: string
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["governance_action"]
          created_at?: string
          description: string
          executed_at?: string | null
          expires_at: string
          id?: string
          is_executed?: boolean | null
          metadata?: Json | null
          proposer_id?: string | null
          quorum_required?: number | null
          target_id?: string | null
          title: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["governance_action"]
          created_at?: string
          description?: string
          executed_at?: string | null
          expires_at?: string
          id?: string
          is_executed?: boolean | null
          metadata?: Json | null
          proposer_id?: string | null
          quorum_required?: number | null
          target_id?: string | null
          title?: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          reasoning: string | null
          vote: Database["public"]["Enums"]["governance_vote"]
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          reasoning?: string | null
          vote: Database["public"]["Enums"]["governance_vote"]
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          reasoning?: string | null
          vote?: Database["public"]["Enums"]["governance_vote"]
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          accreditation_number: string | null
          country: string | null
          created_at: string
          id: string
          institution_did: string | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          profile_id: string
          total_credentials_issued: number | null
          trust_score: number | null
          updated_at: string
          verified_at: string | null
          website: string | null
        }
        Insert: {
          accreditation_number?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_did?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          profile_id: string
          total_credentials_issued?: number | null
          trust_score?: number | null
          updated_at?: string
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          accreditation_number?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_did?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          profile_id?: string
          total_credentials_issued?: number | null
          trust_score?: number | null
          updated_at?: string
          verified_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          did: string | null
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          did?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          did?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          blockchain_verified: boolean | null
          created_at: string
          credential_hash: string
          credential_id: string | null
          id: string
          ip_address: unknown
          issuer_verified: boolean | null
          metadata: Json | null
          revocation_checked: boolean | null
          user_agent: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verification_time_ms: number | null
          verifier_id: string | null
        }
        Insert: {
          blockchain_verified?: boolean | null
          created_at?: string
          credential_hash: string
          credential_id?: string | null
          id?: string
          ip_address?: unknown
          issuer_verified?: boolean | null
          metadata?: Json | null
          revocation_checked?: boolean | null
          user_agent?: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verification_time_ms?: number | null
          verifier_id?: string | null
        }
        Update: {
          blockchain_verified?: boolean | null
          created_at?: string
          credential_hash?: string
          credential_id?: string | null
          id?: string
          ip_address?: unknown
          issuer_verified?: boolean | null
          metadata?: Json | null
          revocation_checked?: boolean | null
          user_agent?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verification_time_ms?: number | null
          verifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_profile_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      credential_status: "active" | "revoked" | "expired" | "pending"
      credential_type:
        | "degree"
        | "transcript"
        | "skill_certificate"
        | "internship_proof"
        | "micro_credential"
      governance_action:
        | "institution_approval"
        | "credential_standard"
        | "dispute_resolution"
        | "revocation_approval"
        | "protocol_upgrade"
      governance_vote: "approve" | "reject" | "abstain"
      user_role: "student" | "institution" | "employer" | "admin"
      verification_status:
        | "verified"
        | "invalid"
        | "revoked"
        | "expired"
        | "pending"
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
  public: {
    Enums: {
      credential_status: ["active", "revoked", "expired", "pending"],
      credential_type: [
        "degree",
        "transcript",
        "skill_certificate",
        "internship_proof",
        "micro_credential",
      ],
      governance_action: [
        "institution_approval",
        "credential_standard",
        "dispute_resolution",
        "revocation_approval",
        "protocol_upgrade",
      ],
      governance_vote: ["approve", "reject", "abstain"],
      user_role: ["student", "institution", "employer", "admin"],
      verification_status: [
        "verified",
        "invalid",
        "revoked",
        "expired",
        "pending",
      ],
    },
  },
} as const
