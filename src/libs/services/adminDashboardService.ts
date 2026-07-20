import { supabase } from "@/libs/supabase/client";

// Types untuk admin dashboard
export interface DashboardStats {
  total_users: number;
  total_teams: number;
  total_competitions: number;
  total_registrations: number;
  pending_registrations: number;
  approved_registrations: number;
  rejected_registrations: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  whatsapp?: string;
  date_of_birth?: string;
  gender?: string;
  university?: string;
  faculty?: string;
  major?: string;
  student_id?: string;
  student_id_image_url?: string;
  semester?: number;
  graduation_year?: number;
  province?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  team_id?: string;
  is_team_leader: boolean;
  created_at: string;
  team?: {
    name: string;
    code: string;
    status: string;
  };
}

export interface CompetitionWithRegistrations {
  id: string;
  name: string;
  slug: string;
  status: string;
  description?: string;
  short_description?: string;
  poster_image_url?: string;
  whatsapp_group?: string;
  registration_start: string;
  registration_end: string;
  registration_fee: number;
  total_registrations: number;
  pending_registrations: number;
  approved_registrations: number;
  rejected_registrations: number;
  registrations?: RegistrationDetail[];
}

export interface RegistrationDetail {
  id: string;
  status: string;
  registration_date: string;
  payment_proof_url?: string;
  proposal_url?: string;
  orisinalitas_url?: string;
  notes?: string;
  admin_notes?: string;
  twibbon_proof_url?: string;
  team: {
    id: string;
    name: string;
    code: string;
    current_members: number;
    created_by_name: string;
  };
  team_members: Array<{
    id: string;
    full_name: string;
    email: string;
    university?: string;
    faculty?: string;
    major?: string;
    is_team_leader: boolean;
  }>;
}

export interface TeamDetail {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive" | "disbanded";
  current_members: number;
  max_members?: number;
  description?: string;
  competition_id?: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  competition_name?: string;
  members: TeamMember[];
  registrations?: TeamRegistration[];
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  university?: string;
  faculty?: string;
  major?: string;
  student_id?: string;
  phone?: string;
  address?: string;
  year?: number;
  is_team_leader: boolean;
  joined_at?: string;
  created_at?: string;
}

export interface TeamRegistration {
  id: string;
  competition_id: string;
  status: string;
  registration_date: string;
  notes?: string;
  competition_name: string;
}

export const adminDashboardService = {
  // Helper function to normalize team data from Supabase
  _normalizeTeamData(teamData: any) {
    if (!teamData) return undefined;
    
    // If it's an array, take the first element
    if (Array.isArray(teamData)) {
      return teamData.length > 0 ? {
        name: teamData[0].name,
        code: teamData[0].code,
        status: teamData[0].status
      } : undefined;
    }
    
    // If it's already an object, use it directly
    return {
      name: teamData.name,
      code: teamData.code,
      status: teamData.status
    };
  },

  /**
   * id semua tim yang terdaftar di sebuah lomba.
   *
   * Dipakai untuk membatasi admin lomba: peserta tidak terhubung langsung ke
   * lomba — rantainya user_profiles.team_id -> competition_registrations.team_id
   * -> competition_id. Jadi "peserta lomba saya" = peserta yang timnya punya
   * pendaftaran di lomba itu.
   *
   * Array kosong berarti belum ada tim yang mendaftar, dan pemanggil memang
   * harus mendapat hasil kosong — bukan seluruh data.
   */
  async getTeamIdsForCompetition(competitionId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("competition_registrations")
      .select("team_id")
      .eq("competition_id", competitionId);

    if (error) {
      console.error("Error fetching team ids for competition:", error);
      return [];
    }
    return (data || []).map((r: any) => r.team_id).filter(Boolean);
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(competitionScope?: string | null): Promise<{
    stats: DashboardStats | null;
    error: string | null;
  }> {
    try {
      // Admin lomba: semua angka dihitung hanya dari tim yang mendaftar di
      // lombanya. null = super admin (seluruh data).
      const scopeTeamIds = competitionScope
        ? await this.getTeamIdsForCompetition(competitionScope)
        : null;

      // Keempatnya tidak saling bergantung — dijalankan barengan. Berurutan
      // artinya 4 round-trip ditumpuk, dan itu yang paling terasa waktu refresh.
      //
      // `head: true` bikin PostgREST cuma mengirim angka count-nya, bukan
      // seluruh baris id yang tadinya diunduh lalu dibuang.
      let userQuery = supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true });
      if (scopeTeamIds !== null) userQuery = userQuery.in("team_id", scopeTeamIds);

      let teamQuery = supabase
        .from("teams")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      if (scopeTeamIds !== null) teamQuery = teamQuery.in("id", scopeTeamIds);

      let competitionQuery = supabase
        .from("competitions")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "ongoing"]);
      if (competitionScope) competitionQuery = competitionQuery.eq("id", competitionScope);

      let regQuery = supabase.from("competition_registrations").select("status");
      if (competitionScope) regQuery = regQuery.eq("competition_id", competitionScope);

      const [
        { count: userCount, error: userError },
        { count: teamCount, error: teamError },
        { count: competitionCount, error: competitionError },
        { data: registrationStats, error: registrationError },
      ] = await Promise.all([userQuery, teamQuery, competitionQuery, regQuery]);

      if (userError) {
        console.error("Error fetching user count:", userError);
        return { stats: null, error: "Failed to fetch user statistics" };
      }

      if (teamError) {
        console.error("Error fetching team count:", teamError);
        return { stats: null, error: "Failed to fetch team statistics" };
      }

      if (competitionError) {
        console.error("Error fetching competition count:", competitionError);
        return { stats: null, error: "Failed to fetch competition statistics" };
      }

      if (registrationError) {
        console.error("Error fetching registration stats:", registrationError);
        return {
          stats: null,
          error: "Failed to fetch registration statistics",
        };
      }

      const totalRegistrations = registrationStats?.length || 0;
      const pendingRegistrations =
        registrationStats?.filter((r) => r.status === "pending").length || 0;
      const approvedRegistrations =
        registrationStats?.filter((r) => r.status === "approved").length || 0;
      const rejectedRegistrations =
        registrationStats?.filter((r) => r.status === "rejected").length || 0;    

      const stats: DashboardStats = {
        total_users: userCount || 0,
        total_teams: teamCount || 0,
        total_competitions: competitionCount || 0,
        total_registrations: totalRegistrations,
        pending_registrations: pendingRegistrations,
        approved_registrations: approvedRegistrations,
        rejected_registrations: rejectedRegistrations,
      };

      return { stats, error: null };
    } catch (error: any) {
      console.error("Unexpected error fetching dashboard stats:", error);
      return { stats: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get all user profiles with team information
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    teamFilter?: "all" | "with" | "without",
    competitionScope?: string | null
  ): Promise<{
    users: UserProfile[] | null;
    total: number;
    error: string | null;
  }> {
    try {
      const offset = (page - 1) * limit;
      const term = (searchTerm || "").trim();
      const like = term ? `%${term}%` : undefined;

      // Admin lomba hanya boleh melihat peserta lombanya sendiri.
      // null = super admin (tanpa batas).
      const scopeTeamIds = competitionScope
        ? await this.getTeamIdsForCompetition(competitionScope)
        : null;

      // Optional: find team ids matching the search term (by name/code) for better search
      let teamIdsForSearch: string[] = [];
      if (like) {
        const { data: teamRows } = await supabase
          .from("teams")
          .select("id")
          .or(`name.ilike.${like},code.ilike.${like}`);
        teamIdsForSearch = (teamRows || []).map((t: any) => t.id);
      }

      // Build a base filter applier used for count and data queries equally
      const applyUserFilters = (q: any) => {
        if (scopeTeamIds !== null) q = q.in("team_id", scopeTeamIds);
        if (teamFilter === "with") q = q.not("team_id", "is", null);
        if (teamFilter === "without") q = q.is("team_id", null);
        if (like) {
          const orConds: string[] = [
            `full_name.ilike.${like}`,
            `email.ilike.${like}`,
            `university.ilike.${like}`,
            `faculty.ilike.${like}`,
            `major.ilike.${like}`,
          ];
          if (teamIdsForSearch.length > 0) {
            const inList = teamIdsForSearch.map((id) => `"${id}"`).join(",");
            orConds.push(`team_id.in.(${inList})`);
          }
          q = q.or(orConds.join(","));
        }
        return q;
      };

      // Get total count with filters
      const { count: totalCount, error: countError } = await applyUserFilters(
        supabase.from("user_profiles").select("id", { count: "exact", head: true })
      );

      if (countError) {
        console.error("Error fetching user count:", countError);
        return { users: null, total: 0, error: "Failed to fetch user count" };
      }

      // Get paginated users with team info using the same filters
      const { data: users, error: usersError } = await applyUserFilters(
        supabase
          .from("user_profiles")
          .select(
            `
          id,
          full_name,
          email,
          whatsapp,
          university,
          faculty,
          major,
          student_id,
          team_id,
          is_team_leader,
          created_at,
          team:teams!fk_user_team(
            name,
            code,
            status
          )
        `
          )
          .order("created_at", { ascending: false })
      ).range(offset, offset + limit - 1);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return { users: null, total: 0, error: "Failed to fetch users" };
      }

      return {
        users: (users || []) as UserProfile[],
        total: totalCount || 0,
        error: null,
      };
    } catch (error: any) {
      console.error("Unexpected error fetching users:", error);
      return { users: null, total: 0, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get all competitions with registration details
   */
  async getAllCompetitionsWithRegistrations(competitionScope?: string | null): Promise<{
    competitions: CompetitionWithRegistrations[] | null;
    error: string | null;
  }> {
    try {
      // Admin lomba hanya melihat lombanya sendiri di daftar.
      let competitionsQuery = supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });
      if (competitionScope) competitionsQuery = competitionsQuery.eq("id", competitionScope);
      const { data: competitions, error: competitionsError } = await competitionsQuery;

      if (competitionsError) {
        console.error("Error fetching competitions:", competitionsError);
        return { competitions: null, error: "Failed to fetch competitions" };
      }

      // Get registration stats for each competition
      const competitionsWithStats = await Promise.all(
        (competitions || []).map(async (competition) => {
          const { data: registrations, error: regError } = await supabase
            .from("competition_registrations")
            .select("status")
            .eq("competition_id", competition.id);

          if (regError) {
            console.error(
              "Error fetching registrations for competition:",
              competition.id,
              regError
            );
            return {
              ...competition,
              total_registrations: 0,
              pending_registrations: 0,
              approved_registrations: 0,
              rejected_registrations: 0,
            };
          }

          const totalRegistrations = registrations?.length || 0;
          const pendingRegistrations =
            registrations?.filter((r) => r.status === "pending").length || 0;
          const approvedRegistrations =
            registrations?.filter((r) => r.status === "approved").length || 0;
          const rejectedRegistrations =
            registrations?.filter((r) => r.status === "rejected").length || 0;

          return {
            ...competition,
            total_registrations: totalRegistrations,
            pending_registrations: pendingRegistrations,
            approved_registrations: approvedRegistrations,
            rejected_registrations: rejectedRegistrations,
          };
        })
      );

      return { competitions: competitionsWithStats, error: null };
    } catch (error: any) {
      console.error("Unexpected error fetching competitions:", error);
      return { competitions: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get detailed registrations for a specific competition
   */
  async getCompetitionRegistrations(
    competitionId: string
  ): Promise<{
    registrations: RegistrationDetail[] | null;
    error: string | null;
  }> {
    try {
      // Get registrations with team and member details
      const { data: registrations, error: registrationsError } = await supabase
        .from("competition_registrations")
        .select(
          `
          id,
          status,
          registration_date,
          payment_proof_url,
          proposal_url,
          orisinalitas_url,
          twibbon_proof_url,
          notes,
          admin_notes,
          team:teams(
            id,
            name,
            code,
            created_by,
            created_by_profile:user_profiles!teams_created_by_fkey(full_name)
          )
        `
        )
        .eq("competition_id", competitionId)
        .order("registration_date", { ascending: false });

      if (registrationsError) {
        console.error(
          "Error fetching competition registrations:",
          registrationsError
        );
        return { registrations: null, error: "Failed to fetch registrations" };
      }

      // Get team members for each registration
      const registrationsWithMembers = await Promise.all(
        (registrations || []).map(async (registration: any) => {
          const teamId = registration.team?.id;
          if (!teamId) return registration;

          // Get team member count
          const { count: memberCount, error: countError } = await supabase
            .from("user_profiles")
            .select("id", { count: "exact" })
            .eq("team_id", teamId);

          // Get team members
          const { data: members, error: membersError } = await supabase
            .from("user_profiles")
            .select(
              `
              id,
              full_name,
              email,
              address,
              postal_code,
              city,
              province,
              date_of_birth,
              whatsapp,
              gender,
              student_id,
              semester,
              university,
              faculty,
              major,
              is_team_leader
            `
            )
            .eq("team_id", teamId)
            .order("is_team_leader", { ascending: false });

          if (membersError) {
            console.error("Error fetching team members:", membersError);
            return registration;
          }

          return {
            ...registration,
            team: {
              id: registration.team.id,
              name: registration.team.name,
              code: registration.team.code,
              current_members: memberCount || 0,
              created_by_name:
                registration.team.created_by_profile?.full_name ||
                "Unknown",
            },
            team_members: members || [],
          };
        })
      );

      return {
        registrations:
          registrationsWithMembers as unknown as RegistrationDetail[],
        error: null,
      };
    } catch (error: any) {
      console.error(
        "Unexpected error fetching competition registrations:",
        error
      );
      return { registrations: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get competition details by ID
   */
  async getCompetitionDetail(
    competitionId: string
  ): Promise<{
    competition: CompetitionWithRegistrations | null;
    error: string | null;
  }> {
    try {
      const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select(
          `
          id,
          name,
          slug,
          status,
          description,
          short_description,
          poster_image_url,
          whatsapp_group,
          registration_start,
          registration_end,
          registration_fee
        `
        )
        .eq("id", competitionId)
        .single();

      if (competitionError) {
        console.error("Error fetching competition detail:", competitionError);
        return { competition: null, error: "Competition not found" };
      }

      // Get registration counts
      const { count: totalRegistrations } = await supabase
        .from("competition_registrations")
        .select("id", { count: "exact" })
        .eq("competition_id", competitionId);

      const { count: pendingRegistrations } = await supabase
        .from("competition_registrations")
        .select("id", { count: "exact" })
        .eq("competition_id", competitionId)
        .eq("status", "pending");

      const { count: approvedRegistrations } = await supabase
        .from("competition_registrations")
        .select("id", { count: "exact" })
        .eq("competition_id", competitionId)
        .eq("status", "approved");

      const { count: rejectedRegistrations } = await supabase
        .from("competition_registrations")
        .select("id", { count: "exact" })
        .eq("competition_id", competitionId)
        .eq("status", "rejected");

      const competitionWithStats: CompetitionWithRegistrations = {
        ...competition,
        total_registrations: totalRegistrations || 0,
        pending_registrations: pendingRegistrations || 0,
        approved_registrations: approvedRegistrations || 0,
        rejected_registrations: rejectedRegistrations || 0,
      };

      return { competition: competitionWithStats, error: null };
    } catch (error) {
      console.error("Error in getCompetitionDetail:", error);
      return { competition: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Update registration status
   */
  async updateRegistrationStatus(
    registrationId: string,
    status: "approved" | "rejected",
    adminId: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // For rejected status, admin_notes is required
      if (status === "rejected" && (!adminNotes || adminNotes.trim() === "")) {
        return { success: false, error: "Admin notes are required when rejecting a registration" };
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      } else if (status === "rejected") {
        updateData.admin_notes = adminNotes; // Required for rejection
      }

      // Add admin_notes for approved status if provided
      if (status === "approved" && adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from("competition_registrations")
        .update(updateData)
        .eq("id", registrationId);

      if (error) {
        console.error("Error updating registration status:", error);
        return {
          success: false,
          error: "Failed to update registration status",
        };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error updating registration status:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  /**
   * Update competition WhatsApp group link
   */
  async updateCompetitionWhatsappGroup(
    competitionId: string,
    whatsappGroup: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("competitions")
        .update({
          whatsapp_group: whatsappGroup,
          updated_at: new Date().toISOString(),
        })
        .eq("id", competitionId);

      if (error) {
        console.error("Error updating WhatsApp group:", error);
        return {
          success: false,
          error: "Failed to update WhatsApp group link",
        };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error updating WhatsApp group:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get all teams with their members
   */
  async fetchTeams(
    page: number = 1,
    limit: number = 20,
    searchTerm?: string,
    statusFilter?: string,
    competitionScope?: string | null
  ): Promise<{
    teams: TeamDetail[];
    totalTeams: number;
    error: string | null;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Normalize filters
      const term = (searchTerm || "").trim();
      const wantsStatus = statusFilter && statusFilter !== "all";

      // Admin lomba hanya melihat tim yang mendaftar di lombanya.
      const scopeTeamIds = competitionScope
        ? await this.getTeamIdsForCompetition(competitionScope)
        : null;

      // Helper to apply common filters to a query
      const applyFilters = (q: any, usingView: boolean) => {
        if (scopeTeamIds !== null) q = q.in("id", scopeTeamIds);
        if (wantsStatus) q = q.eq("status", statusFilter);
        if (term) {
          const like = `%${term}%`;
          // Use OR filter across name, code and leader name (created_by_name when using view)
          if (usingView) {
            q = q.or(
              `name.ilike.${like},code.ilike.${like},created_by_name.ilike.${like}`
            );
          } else {
            // Filter on team fields and creator profile name via foreign table
            q = q.or(`name.ilike.${like},code.ilike.${like}`);
            // Apply foreign table filter as well
            q = q.ilike(
              "user_profiles!teams_created_by_fkey.full_name",
              like
            );
          }
        }
        return q;
      };

      // Count with filters
      let totalCount = 0;
      {
        // Try counting via view first
        const { count, error } = await applyFilters(
          supabase.from("teams_with_member_count").select("id", {
            count: "exact",
            head: true,
          }),
          true
        );

        if (!error) {
          totalCount = count || 0;
        } else {
          // Fallback to base teams table with possible join filter
          const { count: tCount, error: tErr } = await applyFilters(
            supabase
              .from("teams")
              .select(
                `id, user_profiles!teams_created_by_fkey(full_name)`,
                { count: "exact", head: true }
              ),
            false
          );
          if (tErr) {
            console.error("Error fetching teams count:", tErr);
            if (
              tErr.code === "PGRST106" ||
              tErr.message?.includes("relation") ||
              tErr.message?.includes("table")
            ) {
              return this.getMockTeams();
            }
            return {
              teams: [],
              totalTeams: 0,
              error: "Failed to fetch teams count",
            };
          }
          totalCount = tCount || 0;
        }
      }

      // Try to use the teams_with_member_count view first, fall back to teams table
      let teamsData, teamsError;

      try {
        // First try to use the view if it exists
        const { data, error } = await applyFilters(
          supabase
            .from("teams_with_member_count")
            .select(
              `
            id,
            name,
            code,
            status,
            current_members,
            created_at,
            created_by,
            created_by_name
          `
            )
            .order("created_at", { ascending: false }),
          true
        ).range(offset, offset + limit - 1);

        if (
          error &&
          (error.code === "PGRST106" || error.message?.includes("relation"))
        ) {
          // View doesn't exist, fall back to teams table
          throw new Error("View not found");
        }

        teamsData = data;
        teamsError = error;
      } catch (viewError) {

        // Fallback to teams table without current_members column
        const baseQuery = applyFilters(
          supabase
            .from("teams")
            .select(
              `
            id,
            name,
            code,
            status,
            created_at,
            created_by,
            user_profiles!teams_created_by_fkey(full_name)
          `
            )
            .order("created_at", { ascending: false }),
          false
        );
        const { data, error } = await baseQuery.range(
          offset,
          offset + limit - 1
        );

        teamsData = data;
        teamsError = error;
      }

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        // Return mock data if view doesn't exist
        if (
          teamsError.code === "PGRST106" ||
          teamsError.message?.includes("relation") ||
          teamsError.message?.includes("table")
        ) {
          return this.getMockTeams();
        }
        return { teams: [], totalTeams: 0, error: "Failed to fetch teams" };
      }

      // Compose response without N+1 member fetch; compute counts if needed in one query
      let memberCountByTeam: Record<string, number> = {};
      const pageTeamIds = (teamsData || []).map((t: any) => t.id);
      const needsCountFallback = !!(teamsData?.length && !(teamsData[0] as any).current_members);

      if (needsCountFallback && pageTeamIds.length > 0) {
        // Single query to fetch team_id for all members in these teams, then aggregate in memory
        const { data: memberRows, error: membersErr } = await supabase
          .from("user_profiles")
          .select("team_id")
          .in("team_id", pageTeamIds);
        if (membersErr) {
          console.error("Error fetching member counts:", membersErr);
        } else {
          memberCountByTeam = (memberRows || []).reduce((acc: any, row: any) => {
            if (!row.team_id) return acc;
            acc[row.team_id] = (acc[row.team_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      const teamsWithMembers: TeamDetail[] = (teamsData || []).map((team: any) => {
        const createdByName = team.created_by_name || team.user_profiles?.[0]?.full_name || "Unknown";
        const currentMembers = (team as any).current_members ?? memberCountByTeam[team.id] ?? 0;
        const teamDetail: TeamDetail = {
          id: team.id,
          name: team.name,
          code: team.code,
          status: team.status,
          current_members: currentMembers,
          created_at: team.created_at,
          created_by: team.created_by,
          created_by_name: createdByName,
          // Do not include members array here to avoid heavy payload; load lazily when needed
          members: [],
        };
        return teamDetail;
      });

      return {
        teams: teamsWithMembers,
        totalTeams: totalCount || 0,
        error: null,
      };
    } catch (error: any) {
      console.error("Unexpected error fetching teams:", error);
      return this.getMockTeams();
    }
  },

  /**
   * Get mock teams data for development/fallback
   */
  getMockTeams(): {
    teams: TeamDetail[];
    totalTeams: number;
    error: string | null;
  } {
    const mockTeams: TeamDetail[] = [
      {
        id: "1",
        name: "Team Alpha",
        code: "ALPHA-001",
        status: "active",
        current_members: 3,
        created_at: "2024-01-15T10:00:00Z",
        created_by: "user1",
        created_by_name: "John Doe",
        competition_name: "Hackathon",
        members: [
          {
            id: "1",
            full_name: "John Doe",
            email: "john@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Informatika",
            is_team_leader: true,
            joined_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            full_name: "Jane Smith",
            email: "jane@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Informatika",
            is_team_leader: false,
            joined_at: "2024-01-15T11:00:00Z",
          },
          {
            id: "3",
            full_name: "Bob Johnson",
            email: "bob@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Sistem Informasi",
            is_team_leader: false,
            joined_at: "2024-01-15T12:00:00Z",
          },
        ],
      },
      {
        id: "2",
        name: "Team Beta",
        code: "BETA-002",
        status: "active",
        current_members: 2,
        created_at: "2024-01-16T14:00:00Z",
        created_by: "user4",
        created_by_name: "Alice Johnson",
        competition_name: "UI/UX Design",
        members: [
          {
            id: "4",
            full_name: "Alice Johnson",
            email: "alice@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Informatika",
            is_team_leader: true,
            joined_at: "2024-01-16T14:00:00Z",
          },
          {
            id: "5",
            full_name: "Charlie Brown",
            email: "charlie@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Informatika",
            is_team_leader: false,
            joined_at: "2024-01-16T15:00:00Z",
          },
        ],
      },
      {
        id: "3",
        name: "Team Gamma",
        code: "GAMMA-003",
        status: "inactive",
        current_members: 1,
        created_at: "2024-01-17T09:00:00Z",
        created_by: "user6",
        created_by_name: "David Wilson",
        competition_name: "Computer Olympiad",
        members: [
          {
            id: "6",
            full_name: "David Wilson",
            email: "david@example.com",
            university: "Universitas Syiah Kuala",
            faculty: "MIPA",
            major: "Informatika",
            is_team_leader: true,
            joined_at: "2024-01-17T09:00:00Z",
          },
        ],
      },
    ];

    return {
      teams: mockTeams,
      totalTeams: mockTeams.length,
      error: null,
    };
  },

  /**
   * Update team status
   */
  async updateTeamStatus(
    teamId: string,
    status: "active" | "inactive" | "disbanded"
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", teamId);

      if (error) {
        console.error("Error updating team status:", error);
        // If using mock data, just return success
        if (
          error.code === "PGRST106" ||
          error.message?.includes("relation") ||
          error.message?.includes("table")
        ) {
          return { success: true, error: null };
        }
        return { success: false, error: "Failed to update team status" };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error updating team status:", error);
      return { success: true, error: null }; // Mock success for development
    }
  },

  /**
   * Remove team member
   */
  async removeTeamMember(
    userId: string,
    teamId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          team_id: null,
          is_team_leader: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("team_id", teamId);

      if (error) {
        console.error("Error removing team member:", error);
        if (
          error.code === "PGRST106" ||
          error.message?.includes("relation") ||
          error.message?.includes("table")
        ) {
          return { success: true, error: null };
        }
        return { success: false, error: "Failed to remove team member" };
      }

      // // Update team current_members count
      // const { error: updateError } = await supabase.rpc(
      //   "update_team_member_count",
      //   {
      //     team_id_param: teamId,
      //   }
      // );

      // if (updateError) {
      //   console.error("Error updating team member count:", updateError);
      //   // Don't fail the operation if this RPC doesn't exist
      // }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error removing team member:", error);
      return { success: true, error: null }; // Mock success for development
    }
  },

  /**
   * Get detailed information about a specific team
   */
  async getTeamDetail(
    teamId: string
  ): Promise<{ team: TeamDetail | null; error: string | null }> {
    try {
      // Get team basic info
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        return { team: null, error: "Failed to fetch team information" };
      }

      if (!team) {
        return { team: null, error: "Team not found" };
      }

      // Get creator name separately
      let creatorName = "Unknown";
      if (team.created_by) {
        const { data: creator } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", team.created_by)
          .single();

        if (creator?.full_name) {
          creatorName = creator.full_name;
        }
      }

      // Get team members
      const { data: members, error: membersError } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          full_name,
          email,
          whatsapp,
          university,
          faculty,
          major,
          student_id,
          semester,
          graduation_year,
          province,
          city,
          address,
          is_team_leader,
          created_at
        `
        )
        .eq("team_id", teamId)
        .order("is_team_leader", { ascending: false });

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        return { team: null, error: "Failed to fetch team members" };
      }

      // Get team registrations through competition_registrations table
      const { data: registrations, error: registrationsError } = await supabase
        .from("competition_registrations")
        .select(
          `
          id,
          status,
          registration_date,
          notes,
          admin_notes,
          payment_proof_url,
          competition_id
        `
        )
        .eq("team_id", teamId)
        .order("registration_date", { ascending: false });

      if (registrationsError) {
        console.error("Error fetching team registrations:", registrationsError);
      }

      // Get competition names for registrations
      const registrationsWithCompetition = [];
      if (registrations && registrations.length > 0) {
        for (const reg of registrations) {
          let competitionName = "Unknown Competition";
          if (reg.competition_id) {
            const { data: competition } = await supabase
              .from("competitions")
              .select("name")
              .eq("id", reg.competition_id)
              .single();

            if (competition?.name) {
              competitionName = competition.name;
            }
          }

          registrationsWithCompetition.push({
            id: reg.id,
            competition_id: reg.competition_id,
            status: reg.status,
            registration_date: reg.registration_date,
            notes: reg.notes || reg.admin_notes,
            competition_name: competitionName,
          });
        }
      }

      // Calculate current members count
      const currentMembers = members?.length || 0;

      const teamDetail: TeamDetail = {
        id: team.id,
        name: team.name,
        code: team.code,
        status: team.status,
        current_members: currentMembers,
        max_members: 3, // Default max members based on schema context
        description: team.description,
        created_at: team.created_at,
        created_by: team.created_by,
        created_by_name: creatorName,
        members:
          members?.map((member) => ({
            id: member.id,
            full_name: member.full_name,
            email: member.email,
            university: member.university,
            faculty: member.faculty,
            major: member.major,
            student_id: member.student_id,
            phone: member.whatsapp, // Using whatsapp as phone field
            address: member.address
              ? `${member.address}, ${member.city || ""}, ${
                  member.province || ""
                }`
                  .trim()
                  .replace(/,\s*$/, "")
              : undefined,
            year: member.graduation_year,
            is_team_leader: member.is_team_leader,
            joined_at: member.created_at,
            created_at: member.created_at,
          })) || [],
        registrations: registrationsWithCompetition,
      };

      return { team: teamDetail, error: null };
    } catch (error: any) {
      console.error("Unexpected error fetching team detail:", error);
      return { team: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get complete team detail for modal display
   */
  async getTeamDetailForModal(
    teamId: string
  ): Promise<{ team: TeamDetail | null; error: string | null }> {
    try {
      // Get team basic info
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select(
          `
          id,
          name,
          code,
          description,
          status,
          is_public,
          created_at,
          created_by
        `
        )
        .eq("id", teamId)
        .single();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        return { team: null, error: "Team not found" };
      }

      // Get team members count
      const { count: memberCount, error: countError } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact" })
        .eq("team_id", teamId);

      // Get team members with correct fields from schema
      const { data: members, error: membersError } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          full_name,
          email,
          whatsapp,
          date_of_birth,
          gender,
          university,
          faculty,
          major,
          student_id,
          semester,
          graduation_year,
          province,
          city,
          address,
          postal_code,
          is_team_leader,
          created_at
        `
        )
        .eq("team_id", teamId)
        .order("is_team_leader", { ascending: false })
        .order("created_at", { ascending: true });

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        return { team: null, error: "Failed to fetch team members" };
      }

      // Get team registrations with competition details
      const { data: registrations, error: registrationsError } = await supabase
        .from("competition_registrations")
        .select(
          `
          id,
          status,
          registration_date,
          notes,
          admin_notes,
          payment_proof_url,
          competition_id,
          competition:competitions(
            id,
            name
          )
        `
        )
        .eq("team_id", teamId)
        .order("registration_date", { ascending: false });

      if (registrationsError) {
        console.error("Error fetching team registrations:", registrationsError);
        return { team: null, error: "Failed to fetch team registrations" };
      }

      // Get created_by user name
      const { data: createdByUser, error: createdByError } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", team.created_by)
        .single();

      // Format members according to TeamMember interface
      const formattedMembers = (members || []).map((member: any) => ({
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        university: member.university,
        faculty: member.faculty,
        major: member.major,
        student_id: member.student_id,
        phone: member.whatsapp, // Use whatsapp as phone field
        address: member.address
          ? `${member.address}${member.city ? ", " + member.city : ""}${
              member.province ? ", " + member.province : ""
            }${member.postal_code ? " " + member.postal_code : ""}`.trim()
          : undefined,
        year: member.graduation_year,
        is_team_leader: member.is_team_leader,
        joined_at: member.created_at,
        created_at: member.created_at,
      }));

      // Format registrations
      const formattedRegistrations = (registrations || []).map((reg: any) => ({
        id: reg.id,
        competition_id: reg.competition_id,
        status: reg.status,
        registration_date: reg.registration_date,
        notes: reg.notes || reg.admin_notes,
        competition_name: reg.competition?.name || "Unknown Competition",
      }));

      const teamDetail: TeamDetail = {
        id: team.id,
        name: team.name,
        code: team.code,
        status: team.status,
        current_members: memberCount || 0,
        max_members: 3, // Default max members based on common competition rules
        description: team.description,
        created_at: team.created_at,
        created_by: team.created_by,
        created_by_name: createdByUser?.full_name || "Unknown",
        members: formattedMembers,
        registrations: formattedRegistrations,
      };

      return { team: teamDetail, error: null };
    } catch (error) {
      console.error("Error in getTeamDetailForModal:", error);
      return { team: null, error: "An unexpected error occurred" };
    }
  },

  /**
   * Get detailed information about a specific user
   */
  async getUserDetail(userId: string): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          whatsapp,
          date_of_birth,
          gender,
          university,
          faculty,
          major,
          student_id,
          student_id_image_url,
          semester,
          graduation_year,
          province,
          city,
          address,
          postal_code,
          team_id,
          is_team_leader,
          created_at,
          team:teams!fk_user_team(
            name,
            code,
            status
          )
        `)
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user detail:', userError);
        return { user: null, error: 'Failed to fetch user details' };
      }

      if (!user) {
        return { user: null, error: 'User not found' };
      }

      const userProfile: UserProfile = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        whatsapp: user.whatsapp,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        university: user.university,
        faculty: user.faculty,
        major: user.major,
        student_id: user.student_id,
        student_id_image_url: user.student_id_image_url,
        semester: user.semester,
        graduation_year: user.graduation_year,
        province: user.province,
        city: user.city,
        address: user.address,
        postal_code: user.postal_code,
        team_id: user.team_id,
        is_team_leader: user.is_team_leader,
        created_at: user.created_at,
        team: this._normalizeTeamData(user.team)
      };

      return { user: userProfile, error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching user detail:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  },

  /**
   * Update user profile information
   */
  async updateUser(
    userId: string,
    updateData: Partial<UserProfile>
  ): Promise<{ success: boolean; user: UserProfile | null; error: string | null }> {
    try {
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: updateData.full_name,
          email: updateData.email,
          whatsapp: updateData.whatsapp,
          university: updateData.university,
          faculty: updateData.faculty,
          major: updateData.major,
          student_id: updateData.student_id,
          semester: updateData.semester,
          graduation_year: updateData.graduation_year,
          province: updateData.province,
          city: updateData.city,
          address: updateData.address,
          postal_code: updateData.postal_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select(`
          id,
          full_name,
          email,
          whatsapp,
          date_of_birth,
          gender,
          university,
          faculty,
          major,
          student_id,
          semester,
          graduation_year,
          province,
          city,
          address,
          postal_code,
          team_id,
          is_team_leader,
          created_at,
          team:teams!fk_user_team(
            name,
            code,
            status
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return { success: false, user: null, error: 'Failed to update user' };
      }

      const userProfile: UserProfile = {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp,
        date_of_birth: updatedUser.date_of_birth,
        gender: updatedUser.gender,
        university: updatedUser.university,
        faculty: updatedUser.faculty,
        major: updatedUser.major,
        student_id: updatedUser.student_id,
        semester: updatedUser.semester,
        graduation_year: updatedUser.graduation_year,
        province: updatedUser.province,
        city: updatedUser.city,
        address: updatedUser.address,
        postal_code: updatedUser.postal_code,
        team_id: updatedUser.team_id,
        is_team_leader: updatedUser.is_team_leader,
        created_at: updatedUser.created_at,
        team: this._normalizeTeamData(updatedUser.team)
      };

      return { success: true, user: userProfile, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating user:', error);
      return { success: false, user: null, error: 'An unexpected error occurred' };
    }
  },
};
