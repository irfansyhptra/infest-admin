import { supabase } from "@/libs/supabase/client";
import { AdminUser, AdminLoginResponse } from "@/types/admin";
import { User } from "@supabase/supabase-js";

export class AdminAuthService {
  private lastFetchedUserId: string | null = null;
  private lastFetchedUser: AdminUser | null = null;
  private activeFetchPromise: Promise<{ role: AdminUser["role"], competitionId: string | null } | null> | null = null;
  private activeFetchUserId: string | null = null;

  private clearCache() {
    this.lastFetchedUserId = null;
    this.lastFetchedUser = null;
    this.activeFetchPromise = null;
    this.activeFetchUserId = null;
  }

  private async fetchAdminRecordCached(userId: string) {
    if (this.activeFetchUserId === userId && this.activeFetchPromise) {
      return this.activeFetchPromise;
    }
    
    this.activeFetchUserId = userId;
    this.activeFetchPromise = this.fetchAdminRecord(userId);
    
    try {
      return await this.activeFetchPromise;
    } finally {
      if (this.activeFetchUserId === userId) {
        this.activeFetchPromise = null;
        this.activeFetchUserId = null;
      }
    }
  }
  /**
   * Login admin dengan email dan password
   */
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    try {
      // Validasi basic
      if (!email || !password) {
        return {
          success: false,
          error: "Email dan password harus diisi",
        };
      }

      // Login dengan Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) {
        console.error("Supabase auth error:", authError);

        if (authError.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error: "Email atau password salah",
          };
        } else if (authError.message.includes("Email not confirmed")) {
          return {
            success: false,
            error: "Email belum diverifikasi",
          };
        } else {
          return {
            success: false,
            error: "Gagal login: " + authError.message,
          };
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Gagal mendapatkan data user",
        };
      }

      const record = await this.fetchAdminRecordCached(authData.user.id);

      if (!record) {
        // Punya akun auth tapi bukan admin aktif — jangan biarkan masuk.
        this.clearCache();
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Akun ini tidak terdaftar sebagai admin aktif",
        };
      }

      const adminUser: AdminUser = {
        id: authData.user.id,
        username: authData.user.email?.split("@")[0] || "admin",
        email: authData.user.email || "",
        full_name: authData.user.user_metadata?.full_name || "Administrator",
        role: record.role,
        competition_id: record.competitionId,
        is_active: true,
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at:
          (authData.user as any).updated_at ||
          authData.user.last_sign_in_at ||
          new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      this.lastFetchedUserId = authData.user.id;
      this.lastFetchedUser = adminUser;
      
      console.log("Login successful for user ID:", adminUser);

      return {
        success: true,
        user: adminUser,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      this.clearCache();
      return {
        success: false,
        error: "Terjadi kesalahan sistem",
      };
    }
  }

  /**
   * Logout admin
   */
  async logout(): Promise<void> {
    try {
      this.clearCache();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  /**
   * Get current authenticated admin user
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session || !session.user) {
        this.clearCache();
        return null;
      }

      const userId = session.user.id;
      if (this.lastFetchedUserId === userId && this.lastFetchedUser) {
        return this.lastFetchedUser;
      }

      const record = await this.fetchAdminRecordCached(userId);
      if (!record) {
        this.clearCache();
        return null;
      }

      const adminUser = this.getAdminUserFromAuth(session.user, record.role, record.competitionId);
      this.lastFetchedUserId = userId;
      this.lastFetchedUser = adminUser;
      return adminUser;
    } catch (error) {
      console.error("Get current user error:", error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Get admin user data from auth user
   */
  /**
   * CATATAN KEAMANAN: `role` dan `competition_id` WAJIB berasal dari tabel
   * admin_users, tidak boleh dari user_metadata. user_metadata bisa ditulis
   * sendiri oleh pemilik akun (supabase.auth.updateUser({ data: ... })), jadi
   * membacanya dari sana berarti user biasa bisa mengangkat dirinya jadi
   * SUPER_ADMIN. Parameter `role`/`competitionId` di bawah selalu diisi
   * pemanggil dari hasil query admin_users.
   */
  private getAdminUserFromAuth(
    authUser: User,
    role: AdminUser["role"],
    competitionId: string | null
  ): AdminUser {
    return {
      id: authUser.id,
      username: authUser.email?.split("@")[0] || "admin",
      email: authUser.email || "",
      full_name: authUser.user_metadata?.full_name || "Administrator",
      role,
      competition_id: competitionId,
      is_active: true,
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: (authUser as any).updated_at || new Date().toISOString(),
      last_login: new Date().toISOString(),
    };
  }

  /** Ambil role & lomba dari admin_users. null kalau user bukan admin. */
  private async fetchAdminRecord(userId: string) {
    const { data, error } = await supabase
      .from("admin_users")
      .select("admin_competition_id, role, is_active")
      .eq("id", userId)
      .single();

    if (error || !data || data.is_active === false) return null;
    return {
      role: (data.role as AdminUser["role"]) || "ADMIN",
      competitionId: data.admin_competition_id ?? null,
    };
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AdminUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        
        // Gunakan cache jika data untuk userId ini sudah dimuat sebelumnya
        if (this.lastFetchedUserId === userId && this.lastFetchedUser) {
          callback(this.lastFetchedUser);
          return;
        }

        try {
          const record = await this.fetchAdminRecordCached(userId);
          if (record) {
            const adminUser = this.getAdminUserFromAuth(session.user, record.role, record.competitionId);
            this.lastFetchedUserId = userId;
            this.lastFetchedUser = adminUser;
            callback(adminUser);
          } else {
            this.clearCache();
            callback(null);
          }
        } catch (err) {
          console.error("Error in onAuthStateChange fetch:", err);
          this.clearCache();
          callback(null);
        }
      } else {
        this.clearCache();
        callback(null);
      }
    });
  }

  /**
   * Get admin client with authenticated context
   */
  getAuthenticatedClient() {
    return supabase;
  }

  /**
   * Refresh authentication status
   */
  async refreshAuth(): Promise<AdminUser | null> {
    try {
      this.clearCache();
      return await this.getCurrentUser();
    } catch (error) {
      console.error("Refresh auth error:", error);
      this.clearCache();
      return null;
    }
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
