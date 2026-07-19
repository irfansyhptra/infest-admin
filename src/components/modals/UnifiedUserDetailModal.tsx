"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  MapPin,
  Crown,
  UserCheck,
  Save,
  Edit,
  Download,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";
import { useUserDetail } from "@/libs/hooks/useAdminDashboard";
import { UserProfile } from "@/libs/services/adminDashboardService";
import Link from "next/link";

interface UnifiedUserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  userData?: UserProfile | null;
  isEditable?: boolean;
  onUserUpdate?: (updatedUser: UserProfile) => void;
}

export default function UnifiedUserDetailModal({
  isOpen,
  onClose,
  userId = null,
  userData = null,
  isEditable = false,
  onUserUpdate,
}: UnifiedUserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Use hook only if userId is provided (for admin functionality)
  const { user, isLoading, error, fetchUserDetail, updateUser } =
    useUserDetail();

  // Determine which user data to use
  const currentUser = userId ? user : userData;

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail(userId);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const userToUse = currentUser;
    if (userToUse) {
      setFormData({
        full_name: userToUse.full_name,
        email: userToUse.email,
        whatsapp: userToUse.whatsapp || "",
        university: userToUse.university || "",
        faculty: userToUse.faculty || "",
        major: userToUse.major || "",
        student_id: userToUse.student_id || "",
        semester: userToUse.semester || undefined,
        graduation_year: userToUse.graduation_year || undefined,
        province: userToUse.province || "",
        city: userToUse.city || "",
        address: userToUse.address || "",
        postal_code: userToUse.postal_code || "",
      });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Show loading only for admin fetched data
  if (userId && isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl surface-card rounded-xl shadow-xl max-h-[90vh] overflow-hidden border border-subtle">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-6 border-b border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--secondary-bg)] rounded-full animate-pulse border border-subtle"></div>
              <div>
                <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-48 mb-2"></div>
                <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-32"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 bg-[var(--secondary-bg)] rounded animate-pulse w-20"></div>
              <div className="w-10 h-10 bg-[var(--secondary-bg)] rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Skeleton */}
              <div className="space-y-6">
                <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-40 border-b border-subtle pb-2"></div>

                <div className="space-y-4">
                  {/* Full Name Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-36"></div>
                    </div>
                  </div>

                  {/* Email Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-48"></div>
                    </div>
                  </div>

                  {/* WhatsApp Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-32"></div>
                    </div>
                  </div>

                  {/* Date & Gender Skeleton */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-24 mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-28"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Address Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mb-2"></div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse mt-1"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-full"></div>
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information Skeleton */}
              <div className="space-y-6">
                <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-44 border-b border-subtle pb-2"></div>

                <div className="space-y-4">
                  {/* University Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-40"></div>
                    </div>
                  </div>

                  {/* Faculty Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-16 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-36"></div>
                    </div>
                  </div>

                  {/* Major Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-14 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-44"></div>
                    </div>
                  </div>

                  {/* Student ID Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-24 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-700 rounded animate-pulse w-28"></div>
                    </div>
                  </div>

                  {/* Student ID Image Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-32 mb-2"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 bg-gray-700 rounded animate-pulse w-20"></div>
                        <div className="h-6 bg-gray-700 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  </div>

                  {/* Semester and Graduation Year Skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-20 mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-28 mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-5 bg-gray-700 rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Information & Additional Info Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Team Information Skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-36 border-b border-subtle pb-2"></div>
                <div className="bg-[var(--secondary-bg)] border border-subtle rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-5 bg-[var(--tertiary-bg)] rounded animate-pulse"></div>
                    <div className="h-5 bg-[var(--tertiary-bg)] rounded animate-pulse w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-[var(--tertiary-bg)] rounded animate-pulse w-28"></div>
                    <div className="h-4 bg-[var(--tertiary-bg)] rounded animate-pulse w-24"></div>
                    <div className="h-4 bg-[var(--tertiary-bg)] rounded animate-pulse w-32"></div>
                  </div>
                </div>
              </div>

              {/* Additional Information Skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-44 border-b border-subtle pb-2"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-16 mb-1"></div>
                    <div className="h-5 bg-[var(--secondary-bg)] rounded animate-pulse w-64"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-32 mb-1"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-[var(--secondary-bg)] rounded animate-pulse"></div>
                      <div className="h-5 bg-[var(--secondary-bg)] rounded animate-pulse w-36"></div>
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

  // Show error only for admin fetched data
  if (userId && error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="surface-card rounded-xl p-8 max-w-md border border-subtle shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--error-soft)] text-error">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-primary mb-2 tracking-wide uppercase">
              Error Loading User
            </h3>
            <p className="text-sm text-muted mb-4">
              {error || "User not found"}
            </p>
            <button onClick={onClose} className="btn-neutral w-full">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

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

  const handleInputChange = (
    field: string,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentUser?.id || !isEditable) return;

    try {
      const { success, error } = await updateUser(currentUser.id, formData);

      if (success) {
        onUserUpdate?.(currentUser);
        setIsEditing(false);
        toast.success("User updated successfully");
      } else {
        toast.error(error || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: currentUser.full_name,
      email: currentUser.email,
      whatsapp: currentUser.whatsapp || "",
      university: currentUser.university || "",
      faculty: currentUser.faculty || "",
      major: currentUser.major || "",
      student_id: currentUser.student_id || "",
      semester: currentUser.semester || undefined,
      graduation_year: currentUser.graduation_year || undefined,
      province: currentUser.province || "",
      city: currentUser.city || "",
      address: currentUser.address || "",
      postal_code: currentUser.postal_code || "",
    });
    setIsEditing(false);
  };

  const formatAddress = () => {
    const parts = [];
    if (currentUser.address) parts.push(currentUser.address);
    if (currentUser.city) parts.push(currentUser.city);
    if (currentUser.province) parts.push(currentUser.province);
    if (currentUser.postal_code) parts.push(currentUser.postal_code);

    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const downloadStudentIdImage = async () => {
    if (!currentUser?.student_id_image_url) return;

    try {
      // Fetch the image
      const response = await fetch(currentUser.student_id_image_url);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const fileName = `student-id-${
        currentUser.full_name?.replace(/\s+/g, "-") || "student-id"
      }.${blob.type.split("/")[1] || "jpg"}`;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl surface-card rounded-xl shadow-xl max-h-[90vh] overflow-hidden border border-subtle">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-subtle">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--accent-soft)] border border-subtle">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary flex items-center gap-2 tracking-wide uppercase">
                  {currentUser.full_name}
                  {currentUser.is_team_leader && (
                    <span className="badge badge-warn !text-[10px] inline-flex items-center gap-1">
                      Leader
                    </span>
                  )}
                  {currentUser.team_id && !currentUser.is_team_leader && (
                    <span className="badge badge-outline !text-[10px] inline-flex items-center gap-1">
                      Member
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted tracking-wide">
                  {userId ? "User Profile Details" : "Team Member Details"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditable && !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline px-4 py-2 inline-flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : isEditable && isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="btn-neutral px-4 py-2 inline-flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-outline px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-[var(--accent-soft)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-secondary pb-2 tracking-wide uppercase">
                  Personal Information
                </h3>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.full_name || ""}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.full_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary break-all">
                          {currentUser.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      WhatsApp
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.whatsapp || ""}
                        onChange={(e) =>
                          handleInputChange("whatsapp", e.target.value)
                        }
                        placeholder="Enter WhatsApp number"
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.whatsapp || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth & Gender */}
                  {(currentUser.date_of_birth || currentUser.gender) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentUser.date_of_birth && (
                        <div>
                          <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                            Date of Birth
                          </label>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                            <span className="text-primary">
                              {formatDate(currentUser.date_of_birth)}
                            </span>
                          </div>
                        </div>
                      )}
                      {currentUser.gender && (
                        <div>
                          <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                            Gender
                          </label>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted flex-shrink-0" />
                            <span className="text-primary">
                              {getGenderLabel(currentUser.gender)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={formData.address || ""}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="input-neutral w-full py-2.5 px-3"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={formData.city || ""}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="input-neutral w-full py-2.5 px-3"
                          />
                          <input
                            type="text"
                            placeholder="Province"
                            value={formData.province || ""}
                            onChange={(e) =>
                              handleInputChange("province", e.target.value)
                            }
                            className="input-neutral w-full py-2.5 px-3"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={formData.postal_code || ""}
                          onChange={(e) =>
                            handleInputChange("postal_code", e.target.value)
                          }
                          className="input-neutral w-full py-2.5 px-3"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted mt-1 flex-shrink-0" />
                        <span className="text-primary">{formatAddress()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-secondary pb-2 tracking-wide uppercase">
                  Academic Information
                </h3>

                <div className="space-y-4">
                  {/* University */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      University
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.university || ""}
                        onChange={(e) =>
                          handleInputChange("university", e.target.value)
                        }
                        placeholder="Enter university name"
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.university || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Faculty
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.faculty || ""}
                        onChange={(e) =>
                          handleInputChange("faculty", e.target.value)
                        }
                        placeholder="Enter faculty name"
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.faculty || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Major */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Major
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.major || ""}
                        onChange={(e) =>
                          handleInputChange("major", e.target.value)
                        }
                        placeholder="Enter major/study program"
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.major || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Student ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.student_id || ""}
                        onChange={(e) =>
                          handleInputChange("student_id", e.target.value)
                        }
                        placeholder="Enter student ID"
                        className="input-neutral w-full py-2.5 px-3"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {currentUser.student_id || "Not provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Student ID Image */}
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                      Student ID Image
                    </label>
                    {currentUser.student_id_image_url ? (
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-4 h-4 text-muted flex-shrink-0" />
                        <div className="flex items-center gap-2">
                          <Link
                            href={currentUser.student_id_image_url}
                            target="_blank"
                            className="btn-outline px-3 py-1 text-xs inline-flex items-center gap-2"
                          >
                            <Eye className="w-3 h-3" />
                            View Image
                          </Link>
                          <button
                            onClick={downloadStudentIdImage}
                            className="btn-neutral px-3 py-1 text-xs inline-flex items-center gap-2"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-sm text-muted">
                          Gambar tidak tersedia/belum diupload
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Semester and Graduation Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                        Semester
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={formData.semester || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "semester",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          placeholder="1-14"
                          className="input-neutral w-full py-2.5 px-3"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                          <span className="text-primary">
                            {currentUser.semester
                              ? `Semester ${currentUser.semester}`
                              : "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">
                        Graduation Year
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="2020"
                          max="2030"
                          value={formData.graduation_year || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "graduation_year",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          placeholder="e.g., 2025"
                          className="input-neutral w-full py-2.5 px-3"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                          <span className="text-primary">
                            {currentUser.graduation_year || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Information & Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Team Information */}
              {currentUser.team && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">
                    Team Information
                  </h3>
                  <div className="rounded-lg p-4 border border-subtle bg-[var(--secondary-bg)]">
                    <div className="flex items-center gap-3 mb-3">
                      <UserCheck className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-primary tracking-wide">
                        {currentUser.team?.name}
                      </h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="text-muted">
                        <span className="font-medium text-secondary">
                          Team Code:
                        </span>{" "}
                        #{currentUser.team?.code}
                      </p>
                      <p className="text-muted">
                        <span className="font-medium text-secondary">
                          Status:
                        </span>{" "}
                        {currentUser.team?.status}
                      </p>
                      <p className="text-muted">
                        <span className="font-medium text-secondary">
                          Role:
                        </span>{" "}
                        {currentUser.is_team_leader ? "Leader" : "Member"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">
                  Additional Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-secondary uppercase tracking-wide">
                      User ID
                    </p>
                    <code className="text-[10px] bg-[var(--secondary-bg)] px-2 py-1 rounded border border-subtle text-primary break-all">
                      {currentUser.id}
                    </code>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-secondary uppercase tracking-wide">
                      Registration Date
                    </p>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">
                        {formatDate(currentUser.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
