// Admin user interface
export interface AdminUser {
  id: string;
  username: string;
  competition_id?: string | null;
  email?: string;
  full_name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Admin auth context interface
export interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean; 
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// Login response interface
export interface AdminLoginResponse {
  success: boolean;
  user?: AdminUser;
  token?: string;
  error?: string;
}

// Database types from schema
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  profile_image_url?: string;
  university?: string;
  faculty?: string;
  major?: string;
  student_id?: string;
  semester?: number;
  graduation_year?: number;
  province?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  team_id?: string;
  is_team_leader: boolean;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  registration_fee: number;
  registration_start: string;
  registration_end: string;
  competition_start: string;
  competition_end: string;
  guidebook_url?: string;
  poster_image_url?: string;
  whatsapp_group?: string;
  first_prize_amount?: number;
  first_prize_description?: string;
  second_prize_amount?: number;
  second_prize_description?: string;
  third_prize_amount?: number;
  third_prize_description?: string;
  status: 'draft' | 'open' | 'ongoing' | 'closed' | 'completed';
  is_google_form_registration: boolean;
  google_form_registration_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_public: boolean;
  status: 'active' | 'inactive' | 'disbanded';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitionRegistration {
  id: string;
  competition_id: string;
  team_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  registration_date: string;
  approved_at?: string;
  payment_proof_url?: string;
  proposal_url?: string;
  orisinalitas_url?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// Extended types with joins for admin views
export interface TeamWithMembers extends Team {
  members: UserProfile[];
  member_count: number;
  is_full: boolean;
  created_by_name: string;
}
