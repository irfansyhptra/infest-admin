"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, GraduationCap, Calendar, MapPin, Crown, UserCheck, Save, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useUserDetail } from '@/libs/hooks/useAdminDashboard';

interface UserProfile {
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
  team_id?: string;
  is_team_leader: boolean;
  created_at: string;
  team?: {
    name: string;
    code: string;
    status: string;
  };
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUserUpdate?: (updatedUser: UserProfile) => void;
}

export default function UserDetailModal({ isOpen, onClose, userId, onUserUpdate }: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const { user, isLoading, error, fetchUserDetail, updateUser } = useUserDetail();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail(userId);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        whatsapp: user.whatsapp || '',
        university: user.university || '',
        faculty: user.faculty || '',
        major: user.major || '',
        student_id: user.student_id || '',
        semester: user.semester || undefined,
        graduation_year: user.graduation_year || undefined,
        province: user.province || '',
        city: user.city || '',
        address: user.address || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="surface-card rounded-xl p-8 border border-subtle shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-primary">Loading user details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="surface-card rounded-xl p-8 max-w-md border border-subtle shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--error-soft)] text-error">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-primary mb-2 tracking-wide uppercase">Error Loading User</h3>
            <p className="text-sm text-muted mb-4">{error || 'User not found'}</p>
            <button onClick={onClose} className="btn-neutral w-full">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch {
      return 'Invalid date';
    }
  };

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      const { success, error } = await updateUser(user.id, formData);
      
      if (success) {
        onUserUpdate?.(user);
        setIsEditing(false);
        toast.success('User updated successfully');
      } else {
        toast.error(error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      whatsapp: user.whatsapp || '',
      university: user.university || '',
      faculty: user.faculty || '',
      major: user.major || '',
      student_id: user.student_id || '',
      semester: user.semester || undefined,
      graduation_year: user.graduation_year || undefined,
      province: user.province || '',
      city: user.city || '',
      address: user.address || '',
      postal_code: user.postal_code || '',
    });
    setIsEditing(false);
  };

  const formatAddress = () => {
    const parts = [];
    if (user.address) parts.push(user.address);
    if (user.city) parts.push(user.city);
    if (user.province) parts.push(user.province);
    if (user.postal_code) parts.push(user.postal_code);
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
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
                {user.full_name}
                {user.is_team_leader && (
                  <span className="badge badge-warn !text-[10px] inline-flex items-center gap-1">Leader</span>
                )}
                {user.team_id && !user.is_team_leader && (
                  <span className="badge badge-outline !text-[10px] inline-flex items-center gap-1">Member</span>
                )}
              </h2>
              <p className="text-xs text-muted tracking-wide">User Profile Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-outline px-4 py-2 inline-flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} className="btn-neutral px-4 py-2 inline-flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button onClick={handleCancel} className="btn-outline px-4 py-2">Cancel</button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-primary hover:bg-[var(--accent-soft)] transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">Personal Information</h3>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.full_name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary break-all">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">WhatsApp</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.whatsapp || ''}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="Enter WhatsApp number"
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.whatsapp || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Address</label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="input-neutral w-full py-3 px-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="input-neutral w-full py-3 px-2"
                        />
                        <input
                          type="text"
                          placeholder="Province"
                          value={formData.province || ''}
                          onChange={(e) => handleInputChange('province', e.target.value)}
                          className="input-neutral w-full py-3 px-2"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={formData.postal_code || ''}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        className="input-neutral w-full py-3 px-2"
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
              <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">Academic Information</h3>
              
              <div className="space-y-4">
                {/* University */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">University</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.university || ''}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      placeholder="Enter university name"
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.university || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Faculty</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.faculty || ''}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                      placeholder="Enter faculty name"
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.faculty || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Major */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.major || ''}
                      onChange={(e) => handleInputChange('major', e.target.value)}
                      placeholder="Enter major/study program"
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.major || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Student ID */}
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Student ID</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.student_id || ''}
                      onChange={(e) => handleInputChange('student_id', e.target.value)}
                      placeholder="Enter student ID"
                      className="input-neutral w-full py-3 px-2"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted flex-shrink-0" />
                      <span className="text-primary">{user.student_id || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Semester and Graduation Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Semester</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={formData.semester || ''}
                        onChange={(e) => handleInputChange('semester', parseInt(e.target.value) || undefined)}
                        placeholder="1-14"
                        className="input-neutral w-full py-3 px-2"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {user.semester ? `Semester ${user.semester}` : 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Graduation Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.graduation_year || ''}
                        onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value) || undefined)}
                        placeholder="e.g., 2025"
                        className="input-neutral w-full py-3 px-2"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                        <span className="text-primary">
                          {user.graduation_year || 'Not provided'}
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
            {(
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">Team Information</h3>
                <div className="rounded-lg p-4 border border-subtle bg-[var(--secondary-bg)]">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-primary tracking-wide">{user.team?.name}</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-muted"><span className="font-medium text-secondary">Team Code:</span> #{user.team?.code}</p>
                    <p className="text-muted"><span className="font-medium text-secondary">Status:</span> {user.team?.status}</p>
                    <p className="text-muted"><span className="font-medium text-secondary">Role:</span> {user.is_team_leader ? 'Leader' : 'Member'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-secondary border-b border-subtle pb-2 tracking-wide uppercase">Additional Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-secondary uppercase tracking-wide">User ID</p>
                  <code className="text-[10px] bg-[var(--secondary-bg)] px-2 py-1 rounded border border-subtle text-primary break-all">{user.id}</code>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-secondary uppercase tracking-wide">Registration Date</p>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
                    <span className="text-primary">{formatDate(user.created_at)}</span>
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
