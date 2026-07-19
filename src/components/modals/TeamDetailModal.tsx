"use client";

import React from 'react';
import {
  Users,
  User,
  Calendar,
  Mail,
  GraduationCap,
  Building,
  Trophy,
  Crown,
  Phone,
  MapPin,
  X,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface TeamMember {
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

interface TeamRegistration {
  id: string;
  status: string;
  registration_date: string;
  notes?: string;
  competition_name: string;
  competition_id: string;
}

interface TeamDetail {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  current_members: number;
  max_members?: number;
  created_at: string;
  created_by: string;
  members: TeamMember[];
  registrations?: TeamRegistration[];
}

interface TeamDetailModalProps {
  team: TeamDetail;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "text-yellow-400",
        bg: "bg-yellow-900",
        border: "border-yellow-600",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        color: "text-green-400",
        bg: "bg-green-900",
        border: "border-green-600",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        color: "text-red-400",
        bg: "bg-red-900",
        border: "border-red-600",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                {team.name}
              </h2>
              <p className="text-gray-400 mt-1">Team Code: #{team.code}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Team Info */}
              <div className="xl:col-span-1">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-500" />
                    Team Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Team Name</label>
                      <p className="text-lg font-semibold text-white">{team.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">Team Code</label>
                      <p className="text-white font-mono">#{team.code}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">Members</label>
                      <p className="text-white">
                        {team.current_members}{team.max_members ? ` / ${team.max_members}` : ''}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">Created</label>
                      <p className="text-white">
                        {format(new Date(team.created_at), "dd MMM yyyy HH:mm", { locale: id })}
                      </p>
                    </div>

                    {team.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <p className="text-white leading-relaxed">{team.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Competition Registrations */}
              {team.registrations && team.registrations.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-500" />
                    Competition Registrations
                  </h3>

                  <div className="space-y-4">
                    {team.registrations.map((registration) => (
                      <div key={registration.id} className="bg-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{registration.competition_name}</h4>
                            <p className="text-sm text-gray-400">
                              Registered: {format(new Date(registration.registration_date), "dd MMM yyyy", { locale: id })}
                            </p>
                          </div>
                          {getStatusBadge(registration.status)}
                        </div>

                        {registration.notes && (
                          <div className="mt-3 p-3 bg-gray-500 rounded-lg">
                            <p className="text-sm text-gray-300">{registration.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              <div className="xl:col-span-2">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Team Members ({team.current_members})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map((member) => (
                      <div key={member.id} className="bg-gray-600 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <span className="truncate">{member.full_name}</span>
                              {member.is_team_leader && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs">
                                  <Crown className="w-3 h-3" />
                                  Leader
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-400">ID: {member.student_id}</p>
                          </div>
                        </div>

                        {/* Member Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{member.email}</span>
                          </div>

                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300">{member.phone}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{member.university}</span>
                          </div>

                          {member.major && (
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300 truncate">{member.major}</span>
                            </div>
                          )}

                          {member.year && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300">Year {member.year}</span>
                            </div>
                          )}

                          {member.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300 truncate">{member.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
