import { AdminUser, UserProfile, Competition, Team, CompetitionRegistration } from './admin'

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      competitions: {
        Row: Competition
        Insert: Omit<Competition, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Competition, 'id' | 'created_at' | 'updated_at'>>
      }
      teams: {
        Row: Team
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>
      }
      competition_registrations: {
        Row: CompetitionRegistration
        Insert: Omit<CompetitionRegistration, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CompetitionRegistration, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      admin_users_with_auth: {
        Row: AdminUser & {
          auth_id: string
          auth_email: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: 'super_admin' | 'admin' | 'moderator'
      user_gender: 'male' | 'female'
      competition_status: 'draft' | 'open' | 'ongoing' | 'closed' | 'completed'
      team_status: 'active' | 'inactive' | 'disbanded'
      registration_status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
