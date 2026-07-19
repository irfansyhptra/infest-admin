"use client";

import React from "react";
import Link from "next/link";
import { useAdminProtection } from "@/libs/hooks/useAdminAuth";
import { useAdminCompetitions } from "@/libs/hooks/useAdminDashboard";
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
  ArrowRight,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function CompetitionsPage() {
  useAdminProtection();

  const {
    competitions,
    isLoadingCompetitions,
    competitionsError,
    refetchCompetitions,
  } = useAdminCompetitions();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        color: "text-gray-400",
        bg: "bg-gray-800",
        border: "border-gray-600",
        icon: FileText,
        label: "Draft",
      },
      open: {
        color: "text-green-400",
        bg: "bg-green-900",
        border: "border-green-600",
        icon: CheckCircle,
        label: "Open",
      },
      ongoing: {
        color: "text-blue-400",
        bg: "bg-blue-900",
        border: "border-blue-600",
        icon: Clock,
        label: "Ongoing",
      },
      closed: {
        color: "text-red-400",
        bg: "bg-red-900",
        border: "border-red-600",
        icon: XCircle,
        label: "Closed",
      },
      completed: {
        color: "text-purple-400",
        bg: "bg-purple-900",
        border: "border-purple-600",
        icon: Trophy,
        label: "Completed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
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
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
              Competition Management
            </h1>
            <p className="text-sm mt-2 text-muted">
              Manage competitions and participant registrations
            </p>
          </div>
          <button
            onClick={refetchCompetitions}
            className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error State */}
        {competitionsError && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 sm:p-6 mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-red-300 text-sm sm:text-base">
                {competitionsError}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoadingCompetitions ? (
          // Loading state - show skeleton cards
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="surface-card rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                {/* Header skeleton */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="h-6 bg-gray-700 rounded animate-pulse mb-2 w-3/4"></div>
                    <div className="h-6 bg-gray-700 rounded-full animate-pulse w-20"></div>
                  </div>
                </div>

                {/* Description skeleton */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-4/5"></div>
                </div>

                {/* Competition Info skeleton */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-28"></div>
                  </div>
                </div>

                {/* Registration Stats skeleton */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded animate-pulse w-12 mx-auto"></div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="h-6 bg-gray-600 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded animate-pulse w-16 mx-auto"></div>
                  </div>
                </div>

                {/* Action Button skeleton */}
                <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))
        ) : competitions.length > 0 ? (
          // Actual competition data
          competitions.map((competition) => (
            <div
              key={competition.id}
              className="surface-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[var(--border-light)]"
            >
              {/* Competition Card */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-medium text-primary mb-2 truncate">
                      {competition.name}
                    </h3>
                    {getStatusBadge(competition.status)}
                  </div>
                </div>

                {/* Description */}
                {competition.description && (
                  <p className="text-muted text-xs mb-4 line-clamp-2 lg:line-clamp-3 leading-relaxed">
                    {competition.description}
                  </p>
                )}

                {/* Competition Info */}
                <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {format(
                        new Date(competition.registration_start),
                        "dd MMM",
                        { locale: id }
                      )}{" "}
                      -
                      {format(
                        new Date(competition.registration_end),
                        "dd MMM yyyy",
                        { locale: id }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>
                      Rp {competition.registration_fee.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>
                      {competition.total_registrations} teams registered
                    </span>
                  </div>
                </div>

                {/* Registration Stats */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="text-center p-2 lg:p-3 bg-[var(--tertiary-bg)] rounded-lg border border-[var(--border-color)]">
                    <div className="text-base lg:text-lg font-semibold text-secondary">
                      {competition.pending_registrations}
                    </div>
                    <div className="text-[10px] text-muted tracking-wide uppercase">
                      Pending
                    </div>
                  </div>
                  <div className="text-center p-2 lg:p-3 bg-[var(--tertiary-bg)] rounded-lg border border-[var(--border-color)]">
                    <div className="text-base lg:text-lg font-semibold text-secondary">
                      {competition.approved_registrations}
                    </div>
                    <div className="text-[10px] text-muted tracking-wide uppercase">
                      Approved
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/competitions/${competition.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 lg:px-4 lg:py-3 btn-neutral font-medium text-xs lg:text-sm"
                >
                  <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                  <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="col-span-full text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Competitions Found
            </h3>
            <p className="text-gray-500">
              There are no competitions available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
