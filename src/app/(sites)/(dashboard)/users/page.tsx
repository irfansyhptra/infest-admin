"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAdminProtection } from "@/libs/hooks/useAdminAuth";
import { useAdminUsers } from "@/libs/hooks/useAdminDashboard";
import UserDetailModal from "@/components/modals/UserDetailModal";
import {
  Users,
  Search,
  Download,
  Eye,
  Mail,
  Phone,
  Building,
  GraduationCap,
  UserCheck,
  Crown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import UnifiedUserDetailModal from "@/components/modals/UnifiedUserDetailModal";

export default function UsersPage() {
  useAdminProtection();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState<"all" | "with" | "without">(
    "all"
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { users, totalUsers, isLoadingUsers, usersError, refetchUsers } =
    useAdminUsers(currentPage, pageSize, debouncedSearch, teamFilter);

  const totalPages = useMemo(
    () => (totalUsers > 0 ? Math.ceil(totalUsers / pageSize) : 1),
    [totalUsers, pageSize]
  );

  const filteredUsers = users; // server-side filtered

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdate = () => {
    // Refresh the users list after update
    refetchUsers();
  };

  // Reset to first page when search/filter changes to keep results visible
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, teamFilter]);

  const getStatusBadge = (user: any) => {
    if (user.team_id) {
      return user.is_team_leader ? (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          <Crown className="w-3 h-3" />
          Team Leader
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <UserCheck className="w-3 h-3" />
          Team Member
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
        Individual
      </span>
    );
  };

  // Remove the full-screen loading condition - let static content always render

  return (
  <div className="min-h-screen surface-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-primary tracking-tight">User Management</h1>
            <p className="text-sm mt-2 text-muted">
              Kelola data peserta yang sudah registrasi
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refetchUsers}
              className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 btn-neutral">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="surface-card rounded-xl p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide mb-2 text-muted">
                  Total Users
                </p>
                <p className="text-2xl font-semibold text-primary">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--accent-soft)]/40 border border-[var(--border-color)]">
                <Users className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
          <div className="surface-card rounded-xl p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide mb-2 text-muted">
                  Dengan Tim
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {users.filter((u) => u.team_id).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--accent-soft)]/40 border border-[var(--border-color)]">
                <UserCheck className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
          <div className="surface-card rounded-xl p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide mb-2 text-muted">
                  Team Leaders
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {users.filter((u) => u.is_team_leader).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--accent-soft)]/40 border border-[var(--border-color)]">
                <Crown className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
          <div className="surface-card rounded-xl p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide mb-2 text-muted">
                  Individual
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {users.filter((u) => !u.team_id).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--accent-soft)]/40 border border-[var(--border-color)]">
                <Users className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="surface-card rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, universitas, atau tim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-neutral pl-10 py-3"
              />
            </div>
            <div className="min-w-48">
              <label htmlFor="teamFilter" className="block text-xs text-muted mb-1">
                Status Tim
              </label>
              <select
                id="teamFilter"
                value={teamFilter}
                onChange={(e) =>
                  setTeamFilter(e.target.value as "all" | "with" | "without")
                }
                className="input-neutral py-3 px-3"
              >
                <option value="all">Semua</option>
                <option value="with">Sudah punya tim</option>
                <option value="without">Belum punya tim</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {usersError && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-red-300">{usersError}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="surface-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-neutral">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  User
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Kontak
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Akademik
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Tim
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Terdaftar
                </th>
                <th className="text-left p-4 font-medium text-muted text-xs uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                // Loading state - show skeleton rows
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="border-b border-gray-700"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
                          <div className="h-3 bg-gray-700 rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-40"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-28"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-36"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-32"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-28"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-20"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 bg-gray-700 rounded-full animate-pulse w-24"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                // Actual user data
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-primary">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-muted">
                            {user.student_id || "No Student ID"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted" />
                          <span className="text-sm text-secondary">
                            {user.email}
                          </span>
                        </div>
                        {user.whatsapp && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted" />
                            <span className="text-sm text-secondary">
                              {user.whatsapp}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {user.university && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted" />
                            <span className="text-sm text-secondary">
                              {user.university}
                            </span>
                          </div>
                        )}
                        {user.major && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-muted" />
                            <span className="text-sm text-secondary">
                              {user.major}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {user.team ? (
                        <div className="space-y-1">
                          <p className="font-medium text-primary">
                            {user.team.name}
                          </p>
                          <p className="text-xs text-muted">
                            #{user.team.code}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">No team</span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(user)}</td>
                    <td className="p-4">
                      <span className="text-xs text-muted">
                        {format(new Date(user.created_at), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs btn-outline"
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // No data state
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-muted mb-3" />
            <h3 className="text-sm font-medium text-secondary mb-2 tracking-wide uppercase">
                        {searchTerm ? "No Users Found" : "No Users Yet"}
                      </h3>
            <p className="text-muted text-xs">
                        {searchTerm
                          ? `No users match your search "${searchTerm}"`
                          : "No users have registered yet."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
              className="mt-3 text-secondary underline text-xs hover:text-primary"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
            <div className="text-xs text-muted">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers}{" "}
              users
            </div>
            <div className="flex items-center gap-2">
              {/* First */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="First page"
                className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {(() => {
                // Build a sliding window of up to 3 pages
                const pages: number[] = [];
                if (totalPages <= 3) {
                  for (let p = 1; p <= totalPages; p++) pages.push(p);
                } else {
                  let start = Math.max(1, currentPage - 1);
                  let end = Math.min(totalPages, start + 2);
                  // Ensure window size 3 when possible
                  start = Math.max(1, end - 2);
                  for (let p = start; p <= end; p++) pages.push(p);
                }
                return pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                      page === currentPage ? "btn-neutral" : "btn-outline"
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Last */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
                className="p-2 text-xs btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UnifiedUserDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={selectedUserId}
        onUserUpdate={handleUserUpdate}
        isEditable={true}
      />
    </div>
  );
}
