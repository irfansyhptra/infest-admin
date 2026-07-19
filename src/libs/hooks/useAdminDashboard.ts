import { useState, useEffect, use } from "react";
import {
  adminDashboardService,
  DashboardStats,
  UserProfile,
  CompetitionWithRegistrations,
  RegistrationDetail,
  TeamDetail,
} from "@/libs/services/adminDashboardService";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { isAuthorizedForCompetition } from "../helpers/competitionAuthorization";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const { stats, error } = await adminDashboardService.getDashboardStats();

      if (error) {
        setStatsError(error);
      } else {
        setStats(stats);
      }
    } catch (error) {
      setStatsError("Failed to fetch dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    isLoadingStats,
    statsError,
    refetchStats: fetchDashboardStats,
  };
};

export const useAdminUsers = (
  page: number = 1,
  limit: number = 10,
  searchTerm?: string,
  teamFilter?: "all" | "with" | "without"
) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);

    try {
      const { users, total, error } = await adminDashboardService.getAllUsers(
        page,
        limit,
        searchTerm,
        teamFilter
      );

      if (error) {
        setUsersError(error);
      } else {
        setUsers(users || []);
        setTotalUsers(total);
      }
    } catch (error) {
      setUsersError("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchTerm, teamFilter]);

  return {
    users,
    totalUsers,
    isLoadingUsers,
    usersError,
    refetchUsers: fetchUsers,
  };
};

export const useAdminCompetitions = () => {
  const [competitions, setCompetitions] = useState<
    CompetitionWithRegistrations[]
  >([]);
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);
  const [competitionsError, setCompetitionsError] = useState<string | null>(
    null
  );

  const fetchCompetitions = async () => {
    setIsLoadingCompetitions(true);
    setCompetitionsError(null);

    try {
      const { competitions, error } =
        await adminDashboardService.getAllCompetitionsWithRegistrations();

      if (error) {
        setCompetitionsError(error);
      } else {
        setCompetitions(competitions || []);
      }
    } catch (error) {
      setCompetitionsError("Failed to fetch competitions");
    } finally {
      setIsLoadingCompetitions(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return {
    competitions,
    isLoadingCompetitions,
    competitionsError,
    refetchCompetitions: fetchCompetitions,
  };
};

export const useCompetitionRegistrations = (competitionId: string) => {
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(
    null
  );
  const { user } = useAdminAuth();

  const fetchRegistrations = async () => {
    if (!competitionId) {
      setRegistrations([]);
      return;
    }

    // if (!isAuthorizedForCompetition(user, competitionId)) {
    //   setRegistrationsError("You are not authorized to view these registrations.");
    //   return;
    // }

    setIsLoadingRegistrations(true);
    setRegistrationsError(null);

    try {
      const { registrations, error } =
        await adminDashboardService.getCompetitionRegistrations(competitionId);

      if (error) {
        setRegistrationsError(error);
      } else {
        setRegistrations(registrations || []);
      }
    } catch (error) {
      setRegistrationsError("Failed to fetch registrations");
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [competitionId]);

  const updateRegistrationStatus = async (
    registrationId: string,
    status: "approved" | "rejected",
    adminId: string,
    adminNotes?: string
  ) => {
    if (!isAuthorizedForCompetition(user, competitionId)) {
      return { success: false, error: "You are not authorized to manage these registrations." };
    }
    try {
      const { success, error } =
        await adminDashboardService.updateRegistrationStatus(
          registrationId,
          status,
          adminId,
          adminNotes
        );

      if (success) {
        await fetchRegistrations(); // Refresh data
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: "Failed to update registration status" };
    }
  };

  return {
    registrations,
    isLoadingRegistrations,
    registrationsError,
    refetchRegistrations: fetchRegistrations,
    updateRegistrationStatus,
  };
};

export const useCompetitionDetail = (competitionId: string) => {
  const [competition, setCompetition] =
    useState<CompetitionWithRegistrations | null>(null);
  const [isLoadingCompetition, setIsLoadingCompetition] = useState(false);
  const [competitionError, setCompetitionError] = useState<string | null>(null);
  const { user } = useAdminAuth();

  const fetchCompetitionDetail = async () => {
    if (!competitionId) return;
    // if (!isAuthorizedForCompetition(user, competitionId)) {
    //   setCompetitionError("You are not authorized to manage this competition.");
    //   return { success: false, error: "You can't manage this competition." };
    // }
    setIsLoadingCompetition(true);
    setCompetitionError(null);

    try {
      const { competition, error } =
        await adminDashboardService.getCompetitionDetail(competitionId);

      if (error) {
        setCompetitionError(error);
      } else {
        setCompetition(competition);
      }
    } catch (error) {
      setCompetitionError("Failed to fetch competition details");
    } finally {
      setIsLoadingCompetition(false);
    }
  };

  useEffect(() => {
    fetchCompetitionDetail();
  }, [competitionId]);

  const updateWhatsappGroup = async (whatsappGroup: string) => {
    try {
      const { success, error } = await adminDashboardService.updateCompetitionWhatsappGroup(
        competitionId,
        whatsappGroup
      );

      if (success) {
        // Refresh competition data
        await fetchCompetitionDetail();
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: "Failed to update WhatsApp group" };
    }
  };

  return {
    competition,
    isLoadingCompetition,
    competitionError,
    refetchCompetition: fetchCompetitionDetail,
    updateWhatsappGroup,
  };
};

// export const useAdminActions = () => {
//   const updateRegistrationStatus = async (
//     registrationId: string,
//     status: "approved" | "rejected",
//     adminId: string,
//     adminNotes?: string
//   ) => {
//     if (!isAuthorizedForCompetition(user, competitionId)) {
//       // setRegistrationsError("You are not authorized to view these registrations.");
//       return { success: false, error: "Unauthorized" };
//     }
//     try {
//       const { success, error } =
//         await adminDashboardService.updateRegistrationStatus(
//           registrationId,
//           status,
//           adminId,
//           adminNotes
//         );

//       if (success) {
//         return { success: true };
//       } else {
//         return { success: false, error };
//       }
//     } catch (error) {
//       return { success: false, error: "Failed to update registration status" };
//     }
//   };

//   // const verifyPayment = async (registrationId: string, adminId: string, verified: boolean) => {
//   //   try {
//   //     const { success, error } = await adminDashboardService.verifyPayment(registrationId, adminId, verified);

//   //     if (success) {
//   //       return { success: true };
//   //     } else {
//   //       return { success: false, error };
//   //     }
//   //   } catch (error) {
//   //     return { success: false, error: 'Failed to verify payment' };
//   //   }
//   // };

//   return {
//     updateRegistrationStatus,
//   };
// };

export const useAdminTeams = (
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  statusFilter?: string
) => {
  const [teams, setTeams] = useState<TeamDetail[]>([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    setTeamsError(null);

    try {
      const { teams, totalTeams, error } = await adminDashboardService.fetchTeams(
        page,
        limit,
        searchTerm,
        statusFilter
      );

      if (error) {
        setTeamsError(error);
      } else {
        setTeams(teams);
        setTotalTeams(totalTeams);
      }
    } catch (error) {
      setTeamsError("Failed to fetch teams");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [page, limit, searchTerm, statusFilter]);

  return {
    teams,
    totalTeams,
    isLoadingTeams,
    teamsError,
    refetchTeams: fetchTeams,
  };
};

export const useTeamActions = () => {
  const updateTeamStatus = async (  
    teamId: string,
    status: "active" | "inactive" | "disbanded"
  ) => {
    try {
      const { success, error } = await adminDashboardService.updateTeamStatus(
        teamId,
        status
      );

      if (success) {
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: "Failed to update team status" };
    }
  };

  const removeTeamMember = async (userId: string, teamId: string) => {
    try {
      const { success, error } = await adminDashboardService.removeTeamMember(
        userId,
        teamId
      );

      if (success) {
        const team = await adminDashboardService.getTeamDetail(teamId);
        if (team.team?.members.length === 0) {
          const { success } = await adminDashboardService.updateTeamStatus(teamId, "disbanded");
          if (!success) {
            return {
              success: false,
              error: "Failed to disband team after removing last member",
            };
          }
        }
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: "Failed to remove team member" };
    }
  };

  return {
    updateTeamStatus,
    removeTeamMember,
  };
};

export const useTeamDetail = (teamId: string) => {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamDetail = async () => {
    if (!teamId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { team, error } = await adminDashboardService.getTeamDetail(teamId);

      if (error) {
        setError(error);
      } else {
        setTeam(team);
      }
    } catch (error) {
      setError("Failed to fetch team details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetail();
  }, [teamId]);

  return {
    team,
    isLoading,
    error,
    refetchTeam: fetchTeamDetail,
  };
};

export const useTeamDetailModal = () => {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamDetail = async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { team, error } = await adminDashboardService.getTeamDetailForModal(
        teamId
      );

      if (error) {
        setError(error);
        setTeam(null);
      } else {
        setTeam(team);
      }
    } catch (error) {
      setError("Failed to fetch team details");
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    team,
    isLoading,
    error,
    fetchTeamDetail,
    clearTeam: () => setTeam(null),
  };
};

// Hook for getting user detail
export const useUserDetail = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetail = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await adminDashboardService.getUserDetail(userId);

      if (error) {
        setError(error);
        setUser(null);
      } else {
        // console.log('Fetched user detail:', user);
        setUser(user);
      }
    } catch (error) {
      setError("Failed to fetch user details");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    updateData: Partial<UserProfile>
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      const {
        success,
        user: updatedUser,
        error,
      } = await adminDashboardService.updateUser(userId, updateData);

      if (success && updatedUser) {
        setUser(updatedUser);
      }

      return { success, error };
    } catch (error) {
      return { success: false, error: "Failed to update user" };
    }
  };

  return {
    user,
    isLoading,
    error,
    fetchUserDetail,
    updateUser,
    clearUser: () => setUser(null),
  };
};
