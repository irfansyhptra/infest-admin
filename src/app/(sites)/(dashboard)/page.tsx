"use client";

import React from 'react';
import { useAdminAuth } from '@/libs/contexts/AdminAuthContext';
import { useAdminDashboard } from '@/libs/hooks/useAdminDashboard';
import { 
  Users, 
  Trophy, 
  UserCheck, 
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function MainPage() {
  const { user, isLoading } = useAdminAuth();
  const { stats, isLoadingStats, statsError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Dynamic stats dari database
  const statsData = stats ? [
    { 
      label: 'Total Peserta', 
      value: stats.total_users.toString(), 
      icon: Users, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      loading: isLoadingStats
    },
    { 
      label: 'Kompetisi Aktif', 
      value: stats.total_competitions.toString(), 
      icon: Trophy, 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      loading: isLoadingStats
    },
    { 
      label: 'Registrasi Pending', 
      value: stats.pending_registrations.toString(), 
      icon: FileText, 
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      loading: isLoadingStats
    },
    { 
      label: 'Tim Terdaftar', 
      value: stats.total_teams.toString(), 
      icon: UserCheck, 
      color: 'text-green-600',
      bg: 'bg-green-50',
      loading: isLoadingStats
    },
  ] : [
    { label: 'Total Peserta', value: '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', loading: true },
    { label: 'Kompetisi Aktif', value: '-', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', loading: true },
    { label: 'Registrasi Pending', value: '-', icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-50', loading: true },
    { label: 'Tim Terdaftar', value: '-', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', loading: true },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage registered participants',
      icon: Users,
      href: '/users',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Manage Competitions',
      description: 'View competition registrations',
      icon: Trophy,
      href: '/competitions',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      title: 'Team Management',
      description: 'Manage teams and their members',
      icon: UserCheck,
      href: '/teams',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    }
  ];

  return (
  <div className="surface-page">

      {/* Welcome Header */}
      <div className="mb-6 lg:mb-8">
  <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-2 tracking-tight">Admin Panel</h1>
  <p className="text-xs sm:text-sm text-muted">Signed in as <span className="text-secondary">{user.email}</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statsData.map((stat, index) => (
          <div key={index} className="surface-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-medium text-muted mb-1 sm:mb-2 tracking-wide uppercase truncate">{stat.label}</p>
                {stat.loading ? (
                  <div className="w-12 sm:w-16 h-6 sm:h-8 bg-[var(--tertiary-bg)] animate-pulse rounded"></div>
                ) : (
                  <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary">{stat.value}</p>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--accent-soft)]/40 border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 ml-2">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error State */}
      {statsError && (
        <div className="mb-6 lg:mb-8 p-3 sm:p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm sm:text-base">{statsError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Welcome Section */}
  <div className="surface-card rounded-xl p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-4 lg:mb-6 tracking-tight">Overview</h2>
          <div className="space-y-4">
            <p className="text-muted leading-relaxed text-xs sm:text-sm">Manage participants, teams, competitions and registrations in a focused minimalist workspace.</p>
            
            <div className="surface-card rounded-lg p-4 lg:p-6 border border-[var(--border-color)]">
              <h3 className="font-medium text-secondary mb-3 lg:mb-4 text-xs sm:text-sm tracking-wide uppercase">Features</h3>
              <ul className="space-y-2 lg:space-y-3 text-muted text-[11px] sm:text-xs">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)] mt-2 flex-shrink-0"></div>
                  <div><strong className="text-secondary">Users:</strong> participant data & profiles</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)] mt-2 flex-shrink-0"></div>
                  <div><strong className="text-secondary">Competitions:</strong> events & phases</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)] mt-2 flex-shrink-0"></div>
                  <div><strong className="text-secondary">Registrations:</strong> payment & status review</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)] mt-2 flex-shrink-0"></div>
                  <div><strong className="text-secondary">Teams:</strong> membership & roles</div>
                </li>
              </ul>
            </div>

            <div className="surface-card rounded-lg p-4 lg:p-6 border border-[var(--border-color)]">
              <h3 className="font-medium text-secondary mb-3 lg:mb-4 text-xs sm:text-sm tracking-wide uppercase">Auth</h3>
              <div className="space-y-2 lg:space-y-3 text-[11px] sm:text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-muted">User ID:</span>
                  <code className="px-2 py-1 bg-[var(--tertiary-bg)] rounded text-secondary border border-[var(--border-color)] text-[10px] break-all">{user.id}</code>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-muted">Email:</span>
                  <code className="px-2 py-1 bg-[var(--tertiary-bg)] rounded text-secondary border border-[var(--border-color)] text-[10px] break-all">{user.email}</code>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-muted">Role:</span>
                  <span className="px-2 py-1 bg-[var(--accent-soft)] text-secondary rounded border border-[var(--border-color)] text-[10px]">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-muted">Status:</span>
                  <span className={`px-2 py-1 rounded border text-[10px] ${
                    user.is_active 
                      ? 'bg-green-900/40 text-green-300 border-green-700/50' 
                      : 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="surface-card rounded-xl p-6 lg:p-8">
          <h3 className="text-xl sm:text-2xl font-medium text-secondary mb-4 lg:mb-6 tracking-tight">Quick Actions</h3>
          <div className="space-y-3 lg:space-y-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="block p-4 lg:p-6 rounded-lg border border-[var(--border-color)] transition-all duration-300 hover:bg-[var(--card-hover-bg)] hover:shadow-lg"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-[var(--tertiary-bg)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0">
                    <action.icon className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm lg:text-base mb-1 text-primary">{action.title}</p>
                    <p className="text-xs lg:text-sm text-muted leading-relaxed">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
