"use client";

import React from "react";
import {
  X,
  User,
  Mail,
  GraduationCap,
  Building,
  MapPin,
  Phone,
  Calendar,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface TeamMember {
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
  semester?: number;
  graduation_year?: number;
  province?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  is_team_leader: boolean;
  created_at?: string;
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
}: MemberDetailModalProps) {
  if (!isOpen || !member) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch {
      return "Invalid date";
    }
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      default:
        return "Not specified";
    }
  };

  const formatAddress = () => {
    console.log(member);
    const parts = [];
    if (member.address) parts.push(member.address);
    if (member.city) parts.push(member.city);
    if (member.province) parts.push(member.province);
    if (member.postal_code) parts.push(member.postal_code);

    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 bg-opacity-75">
      <div className="relative w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                {member.full_name}
                {member.is_team_leader && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    Team Leader
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-400">Team Member Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Personal Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Email</p>
                    <p className="text-sm text-white break-all">
                      {member.email}
                    </p>
                  </div>
                </div>

                {member.whatsapp && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        WhatsApp
                      </p>
                      <p className="text-sm text-white">{member.whatsapp}</p>
                    </div>
                  </div>
                )}

                {member.date_of_birth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        Date of Birth
                      </p>
                      <p className="text-sm text-white">
                        {formatDate(member.date_of_birth)}
                      </p>
                    </div>
                  </div>
                )}

                {member.gender && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        Gender
                      </p>
                      <p className="text-sm text-white">
                        {getGenderLabel(member.gender)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Address</p>
                    <p className="text-sm text-white">{formatAddress()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Academic Information
              </h3>

              <div className="space-y-3">
                {member.student_id && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        Student ID
                      </p>
                      <p className="text-sm text-white">{member.student_id}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">
                      University
                    </p>
                    <p className="text-sm text-white">
                      {member.university || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Faculty</p>
                    <p className="text-sm text-white">
                      {member.faculty || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300">Major</p>
                    <p className="text-sm text-white">
                      {member.major || "Not provided"}
                    </p>
                  </div>
                </div>

                {member.semester && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        Semester
                      </p>
                      <p className="text-sm text-white">
                        Semester {member.semester}
                      </p>
                    </div>
                  </div>
                )}

                {member.graduation_year && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-300">
                        Graduation Year
                      </p>
                      <p className="text-sm text-white">
                        {member.graduation_year}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {member.created_at && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Additional Information
              </h3>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-300">
                    Joined Date
                  </p>
                  <p className="text-sm text-white">
                    {formatDate(member.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
