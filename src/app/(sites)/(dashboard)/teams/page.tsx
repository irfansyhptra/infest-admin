"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAdminProtection } from "@/libs/hooks/useAdminAuth";
import { useAdminAuth } from "@/libs/contexts/AdminAuthContext";
import { useAdminTeams, useTeamActions } from "@/libs/hooks/useAdminDashboard";
import { adminDashboardService } from "@/libs/services/adminDashboardService";
import {
  Users,
  User,
  Calendar,
  Mail,
  School,
  BookOpen,
  Crown,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";

export default function TeamsPage() {
  useAdminProtection();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [membersCache, setMembersCache] = useState<Record<string, any[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Record<string, boolean>>(
    {}
  );

  // Debounce search term to reduce requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const { teams, totalTeams, isLoadingTeams, teamsError, refetchTeams } =
    useAdminTeams(currentPage, pageSize, debouncedSearch, statusFilter);
  const { updateTeamStatus, removeTeamMember } = useTeamActions();

  // const handleUpdateTeamStatus = async (teamId: string, status: 'active' | 'inactive' | 'disbanded') => {
  //   try {
  //     const { success, error } = await updateTeamStatus(teamId, status);
  //     if (success) {
  //       toast.success('Team status updated successfully');
  //       refetchTeams();
  //     } else {
  //       toast.error(error || 'Failed to update team status');
  //     }
  //   } catch (error) {
  //     toast.error('An error occurred while updating team status');
  //   }
  // };

  const handleRemoveMember = async (userId: string, teamId: string) => {
    try {
      const { success, error } = await removeTeamMember(userId, teamId);
      if (success) {
        toast.success("Team member removed successfully");
        refetchTeams();
      } else {
        toast.error(error || "Failed to remove team member");
      }
    } catch (error) {
      toast.error("An error occurred while removing team member");
    }
  };

  const toggleTeamExpansion = async (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
      setExpandedTeams(newExpanded);
      if (!membersCache[teamId]) {
        setLoadingMembers((s) => ({ ...s, [teamId]: true }));
        try {
          const { team, error } =
            await adminDashboardService.getTeamDetailForModal(teamId);
          if (!error && team) {
            setMembersCache((s) => ({ ...s, [teamId]: team.members }));
          } else {
            toast.error(error || "Failed to load team members");
            newExpanded.delete(teamId);
          }
        } finally {
          setLoadingMembers((s) => ({ ...s, [teamId]: false }));
        }
      }
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        color: "text-green-300",
        bg: "bg-green-500/20",
        border: "border-green-500/30",
        label: "Active",
      },
      inactive: {
        color: "text-yellow-300",
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/30",
        label: "Inactive",
      },
      disbanded: {
        color: "text-red-300",
        bg: "bg-red-500/20",
        border: "border-red-500/30",
        label: "Disbanded",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border} border`}
      >
        {config.label}
      </span>
    );
  };

  // Server-side filtering already applied
  const filteredTeams = teams;

  const totalPages = useMemo(
    () => (totalTeams > 0 ? Math.ceil(totalTeams / pageSize) : 1),
    [totalTeams, pageSize]
  );

  // Remove full-screen loading condition - let static content always render

  return (
    <div className="min-h-screen surface-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary tracking-tight">
              Team Management
            </h1>
            <p className="text-sm mt-2 text-muted">
              Manage teams and their members (
              {isLoadingTeams ? "-" : totalTeams} teams total)
            </p>
          </div>
          <button
            onClick={refetchTeams}
            className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {teamsError && (
          <div className="rounded-lg p-6 mb-8 border border-red-700/40 bg-red-900/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-red-300">{teamsError}</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="surface-card rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search teams by name, code, or leader..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-neutral pl-10 py-2"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-neutral px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="disbanded">Disbanded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {isLoadingTeams ? (
          // Loading state - show skeleton cards
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="surface-card rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 bg-gray-700 rounded animate-pulse w-40"></div>
                      <div className="h-5 bg-gray-700 rounded-full animate-pulse w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-32 mb-4"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-28"></div>
                      </div>
                    </div>
                  </div>

                  <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredTeams.length === 0 ? (
          <div className="surface-card rounded-xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h3 className="text-sm font-medium text-secondary mb-2 tracking-wide uppercase">
              No Teams Found
            </h3>
            <p className="text-muted text-xs">
              {searchTerm || statusFilter !== "all"
                ? "No teams match your current filters."
                : "No teams have been created yet."}
            </p>
          </div>
        ) : (
          // Actual teams data
          filteredTeams.map((team) => (
            <div
              key={team.id}
              className="surface-card rounded-xl shadow-sm overflow-hidden"
            >
              {/* Team Header */}
              <div
                className="p-6 cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-medium text-primary">
                        {team.name}
                      </h3>
                      <span className="text-xs font-mono text-muted bg-[var(--tertiary-bg)] px-2 py-1 rounded border border-[var(--border-color)]">
                        {team.code}
                      </span>
                      {getStatusBadge(team.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{team.current_members}/3 members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        <span>Leader: {team.created_by_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created:{" "}
                          {format(new Date(team.created_at), "dd MMM yyyy", {
                            locale: id,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {expandedTeams.has(team.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </div>
              </div>

              {/* Team Members (Expanded) */}
              {expandedTeams.has(team.id) && (
                <div className="border-t border-[var(--border-color)] bg-[var(--primary-bg)]/40">
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-secondary mb-4 tracking-tight">
                      Team Members (
                      {membersCache[team.id]?.length ?? team.current_members})
                    </h4>

                    {loadingMembers[team.id] ? (
                      <div className="space-y-4">
                        {Array.from({ length: team.current_members }).map(
                          (_, idx) => (
                            <div
                              key={`member-skeleton-${idx}`}
                              className="flex items-center justify-between p-4 surface-card rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-700 rounded animate-pulse w-40"></div>
                                  <div className="flex items-center gap-4">
                                    <div className="h-3 bg-gray-700 rounded animate-pulse w-32"></div>
                                    <div className="h-3 bg-gray-700 rounded animate-pulse w-24"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (membersCache[team.id]?.length ?? 0) === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        No members found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {(membersCache[team.id] || []).map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 surface-card rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                                <span className="text-primary font-semibold">
                                  {member.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-primary">
                                    {member.full_name}
                                  </p>
                                  {member.is_team_leader && (
                                    <span className="badge badge-warn">
                                      <Crown className="w-3 h-3" /> Leader
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{member.email}</span>
                                  </div>
                                  {member.university && (
                                    <div className="flex items-center gap-1">
                                      <School className="w-3 h-3" />
                                      <span>{member.university}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  await handleRemoveMember(member.id, team.id);
                                  setMembersCache((s) => ({
                                    ...s,
                                    [team.id]: (s[team.id] || []).filter(
                                      (m) => m.id !== member.id
                                    ),
                                  }));
                                }}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                title="Remove from team"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 mt-4 border-t border-[var(--border-color)] surface-card rounded-xl">
          <div className="text-xs text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalTeams)} of {totalTeams} teams
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
              className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {(() => {
              const pages: number[] = [];
              if (totalPages <= 3) {
                for (let p = 1; p <= totalPages; p++) pages.push(p);
              } else {
                let start = Math.max(1, currentPage - 1);
                let end = Math.min(totalPages, start + 2);
                start = Math.max(1, end - 2);
                for (let p = start; p <= end; p++) pages.push(p);
              }
              return pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                    page === currentPage ? "btn-neutral" : "btn-outline"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
              className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
