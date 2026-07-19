import { AdminUser } from "@/types/admin";

export const isAuthorizedForCompetition = (user: AdminUser | null, competitionId: string | null): boolean => {
  if (!user || !competitionId) return false;

  return user.role === "SUPER_ADMIN" || user.competition_id === competitionId;
};
