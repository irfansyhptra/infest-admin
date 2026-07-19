"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminProtection } from "@/libs/hooks/useAdminAuth";
import {
  useCompetitionRegistrations,
  useCompetitionDetail,
} from "@/libs/hooks/useAdminDashboard";
import { useAdminAuth } from "@/libs/contexts/AdminAuthContext";
import Breadcrumbs, {
  createBreadcrumbs,
} from "@/components/breadcrumbs/Breadcrumbs";
import PaymentProofModal from "@/components/modals/PaymentProofModal";
import RejectRegistrationModal from "@/components/modals/RejectRegistrationModal";
import ApproveRegistrationModal from "@/components/modals/ApproveRegistrationModal";
import EditWhatsappGroupModal from "@/components/modals/EditWhatsappGroupModal";
import FileViewerModal from "@/components/modals/FileViewerModal";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  User,
  Edit,
  Eye,
  Search,
  Crown,
  MessageCircle,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import toast from "react-hot-toast";
import UnifiedUserDetailModal from "@/components/modals/UnifiedUserDetailModal";
import { sendRegistrationStatusEmail } from "@/libs/services/emailService";
import Link from "next/link";

export default function CompetitionDetailPage() {
  useAdminProtection();

  const params = useParams();
  const router = useRouter();
  const { user } = useAdminAuth();
  const competitionId = params.id as string;

  const {
    registrations,
    isLoadingRegistrations,
    registrationsError,
    updateRegistrationStatus,
    refetchRegistrations,
  } = useCompetitionRegistrations(competitionId);

  const { competition, isLoadingCompetition, competitionError, updateWhatsappGroup } =
    useCompetitionDetail(competitionId);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<{
    url: string;
    teamName: string;
    registrationDate: string;
  } | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRegistrationForReject, setSelectedRegistrationForReject] =
    useState<{
      id: string;
      teamName: string;
    } | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRegistrationForApprove, setSelectedRegistrationForApprove] =
    useState<{
      id: string;
      teamName: string;
    } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditWhatsappModalOpen, setIsEditWhatsappModalOpen] = useState(false);
  const [isUpdatingWhatsapp, setIsUpdatingWhatsapp] = useState(false);
  const [isFileViewerModalOpen, setIsFileViewerModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    fileName: string;
    teamName: string;
    fileType: "proposal" | "orisinalitas";
  } | null>(null);

  // Update the handler
  const handleViewMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
    setSelectedMemberId(null);
  };

  const handleViewPaymentProof = (
    url: string,
    teamName: string,
    registrationDate: string
  ) => {
    setSelectedPaymentProof({ url, teamName, registrationDate });
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentProof(null);
  };

  const handleViewFile = (
    url: string,
    teamName: string,
    fileType: "proposal" | "orisinalitas"
  ) => {
    const fileName = url.split('/').pop() || `${fileType}_${teamName}`;
    setSelectedFile({ url, fileName, teamName, fileType });
    setIsFileViewerModalOpen(true);
  };

  const handleCloseFileModal = () => {
    setIsFileViewerModalOpen(false);
    setSelectedFile(null);
  };

  // Export CSV: team name, leader name, leader email, leader university, submission link
  const handleExportCSV = () => {
    try {
      // Build rows from currently filtered registrations (respects search and status filters)
      const header = [
        "Nama Tim",
        "Nama Ketua Tim",
        "Email Ketua Tim",
        "Universitas Ketua",
        "Link Submission",
      ];

      const toCsvValue = (v: any) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;

      const rows: string[] = [];
      rows.push(header.map(toCsvValue).join(","));

      const dataSource = filteredRegistrations || [];
      if (!dataSource.length) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      dataSource.forEach((reg) => {
        const leader = reg.team_members.find((m) => m.is_team_leader);
        const submissionLink = reg.proposal_url || reg.orisinalitas_url || "";

        const row = [
          reg.team.name,
          leader?.full_name || "",
          leader?.email || "",
          leader?.university || "",
          submissionLink,
        ];
        rows.push(row.map(toCsvValue).join(","));
      });

      const csvContent = "\ufeff" + rows.join("\n"); // Add BOM for Excel compatibility
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const datePart = format(new Date(), "yyyyMMdd_HHmmss");
      const slugSafe = (competition?.slug || competition?.name || "competition")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
      const filename = `${slugSafe}_registrations_infest2025.csv`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export CSV berhasil");
    } catch (e) {
      console.error("Export CSV error:", e);
      toast.error("Gagal melakukan export CSV");
    }
  };

  const getRegistrationStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string; Icon: any }> =
      {
        pending: {
          label: "Pending",
          className: "badge badge-warn",
          Icon: Clock,
        },
        approved: {
          label: "Approved",
          className: "badge badge-success",
          Icon: CheckCircle,
        },
        rejected: {
          label: "Rejected",
          className: "badge badge-error",
          Icon: XCircle,
        },
        withdrawn: {
          label: "Withdrawn",
          className: "badge badge-outline",
          Icon: AlertCircle,
        },
      };
    const { label, className, Icon } = map[status] || map.pending;
    return (
      <span
        className={`${className} inline-flex items-center gap-1 !text-[10px] tracking-wide`}
      >
        <Icon className="w-3 h-3" /> {label}
      </span>
    );
  };

  // console.log(registrations)
  const handleStatusUpdate = async (
    registrationId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    if (!user) return;

    setIsUpdatingStatus(true);

    try {
      const result = await updateRegistrationStatus(
        registrationId,
        status,
        user.id,
        adminNotes
      );

      if (result.success) {
        toast.success(`Registration ${status} successfully`);
        
        // Send email notification
        const registration = registrations.find(r => r.id === registrationId);
        if (registration && competition) {
          const teamLeader = registration.team_members.find(m => m.is_team_leader);
          
          if (teamLeader?.email) {
            const emailResult = await sendRegistrationStatusEmail({
              teamName: registration.team.name,
              teamLeaderName: teamLeader.full_name,
              teamLeaderEmail: teamLeader.email,
              competitionName: competition.name,
              status,
              adminNotes,
              whatsappGroupLink: status === 'approved' ? competition.whatsapp_group || undefined : undefined,
            });

            if (emailResult.success) {
              toast.success('Email notification sent to team leader');
            } else {
              toast.error('Registration updated but email notification failed');
              console.error('Email notification error:', emailResult.error);
            }
          } else {
            toast.error('Registration updated but team leader email not found');
          }
        }
        
        refetchRegistrations();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
      console.error('Status update error:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleApproveRegistration = (
    registrationId: string,
    teamName: string
  ) => {
    setSelectedRegistrationForApprove({ id: registrationId, teamName });
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = (adminNotes?: string | null) => {
    if (selectedRegistrationForApprove) {
      handleStatusUpdate(
        selectedRegistrationForApprove.id,
        "approved",
        adminNotes || undefined
      );
      setIsApproveModalOpen(false);
      setSelectedRegistrationForApprove(null);
    }
  };

  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedRegistrationForApprove(null);
  };

  const handleRejectRegistration = (
    registrationId: string,
    teamName: string
  ) => {
    setSelectedRegistrationForReject({ id: registrationId, teamName });
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = (adminNotes: string) => {
    if (selectedRegistrationForReject) {
      handleStatusUpdate(
        selectedRegistrationForReject.id,
        "rejected",
        adminNotes
      );
      setIsRejectModalOpen(false);
      setSelectedRegistrationForReject(null);
    }
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedRegistrationForReject(null);
  };

  const handleUpdateWhatsappGroup = async (whatsappGroup: string) => {
    setIsUpdatingWhatsapp(true);
    try {
      const result = await updateWhatsappGroup(whatsappGroup);
      
      if (result.success) {
        toast.success("WhatsApp group link updated successfully");
        setIsEditWhatsappModalOpen(false);
      } else {
        toast.error(result.error || "Failed to update WhatsApp group link");
      }
      
      return { 
        success: result.success, 
        error: result.error || undefined 
      };
    } catch (error) {
      const errorMessage = "An error occurred while updating WhatsApp group link";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdatingWhatsapp(false);
    }
  };

  const filteredRegistrations = registrations
    .filter((reg) =>
      selectedStatus === "all" ? true : reg.status === selectedStatus
    )
    .filter((reg) =>
      searchTerm.trim() === ""
        ? true
        : reg.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.team.created_by_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: searchTerm ? filteredRegistrations.length : registrations.length,
    pending: (searchTerm ? filteredRegistrations : registrations).filter(
      (r) => r.status === "pending"
    ).length,
    approved: (searchTerm ? filteredRegistrations : registrations).filter(
      (r) => r.status === "approved"
    ).length,
    rejected: (searchTerm ? filteredRegistrations : registrations).filter(
      (r) => r.status === "rejected"
    ).length,
  };

  console.log("Current User Role:", user?.role);
  if (user?.role === "ADMIN" && competitionId !== user?.competition_id) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center p-6">
        <div className="surface-card border border-subtle rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--error-soft)] text-error flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide uppercase text-primary">Akses Ditolak</h1>
            <p className="text-sm text-muted">Anda tidak diizinkan melihat kompetisi ini.</p>
          </div>
            <button onClick={() => router.back()} className="btn-outline flex-1 py-2 px-4">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => router.back()}
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 btn-outline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Breadcrumbs
            items={createBreadcrumbs.competition(
              competition?.name || "Competition Detail",
              competitionId
            )}
          />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
              {isLoadingCompetition ? (
                <div className="h-8 bg-gray-700 rounded animate-pulse w-64"></div>
              ) : (
                competition?.name || "Competition Detail"
              )}
            </h1>
            <p className="text-sm mt-2 text-muted">
              Manage teams and registrations for this competition
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetchRegistrations}
              className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {(registrationsError || competitionError) && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 sm:p-6 mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <p className="text-red-300 text-sm sm:text-base">
                {registrationsError || competitionError}
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Group Section */}
        {!isLoadingCompetition && competition && (
          <div className="surface-card rounded-lg p-4 mb-6 border border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-accent flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary">WhatsApp Group</h3>
                  <p className="text-xs text-muted">
                    {competition.whatsapp_group 
                      ? "Share this group link with approved teams"
                      : "No WhatsApp group link set"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {competition.whatsapp_group && (
                  <a
                    href={competition.whatsapp_group}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 btn-outline text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>
                )}
                <button
                  onClick={() => setIsEditWhatsappModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 btn-neutral text-xs"
                >
                  <Edit className="w-3 h-3" />
                  {competition.whatsapp_group ? "Edit" : "Add"}
                </button>
              </div>
            </div>
            {competition.whatsapp_group && (
              <div className="mt-3 p-3 bg-[var(--secondary-bg)] rounded-lg border border-subtle">
                <p className="text-xs text-muted font-mono break-all">
                  {competition.whatsapp_group}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: searchTerm ? "Found Teams" : "Total Teams",
              value: stats.total,
            },
            { label: "Pending", value: stats.pending },
            { label: "Approved", value: stats.approved },
            { label: "Rejected", value: stats.rejected },
          ].map((s) => (
            <div
              key={s.label}
              className="surface-card rounded-lg p-4 text-center"
            >
              <div className="text-xl font-semibold text-primary">
                {s.value}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col md:flex-row w-full justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams by name, code, or leader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-neutral pl-10 pr-4 py-2"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              Filter by status:
            </span>
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedStatus === filter.value
                    ? "btn-neutral"
                    : "btn-outline"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {isLoadingRegistrations ? (
          // Loading state - show skeleton cards
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="surface-card rounded-lg p-6 border border-subtle"
            >
              {/* Team Header skeleton */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 bg-[var(--secondary-bg)] rounded animate-pulse w-48"></div>
                    <div className="h-6 bg-[var(--secondary-bg)] rounded-full animate-pulse w-20"></div>
                  </div>
                  <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-64 mb-1"></div>
                  <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-40"></div>
                </div>
              </div>

              {/* Team Members skeleton */}
              <div className="mb-4">
                <div className="h-4 bg-[var(--secondary-bg)] rounded animate-pulse w-24 mb-2"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, memberIndex) => (
                    <div
                      key={`member-skeleton-${memberIndex}`}
                      className="p-3 bg-[var(--secondary-bg)] rounded-lg border border-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[var(--tertiary-bg)] rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-[var(--tertiary-bg)] rounded animate-pulse mb-1"></div>
                          <div className="h-3 bg-[var(--tertiary-bg)] rounded animate-pulse w-20"></div>
                        </div>
                        <div className="w-6 h-6 bg-[var(--tertiary-bg)] rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions skeleton */}
              <div className="flex flex-wrap gap-2">
                <div className="h-8 bg-gray-700 rounded animate-pulse w-24"></div>
                <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
                <div className="h-8 bg-gray-700 rounded animate-pulse w-28"></div>
              </div>
            </div>
          ))
        ) : filteredRegistrations.length > 0 ? (
          // Actual registration data
          filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="surface-card border border-subtle rounded-lg p-6 transition-colors"
            >
              {/* Team Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-primary truncate">
                      {registration.team.name}
                    </h3>
                    {getRegistrationStatusBadge(registration.status)}
                  </div>
                  <p className="text-xs text-muted">
                    #{registration.team.code} •{" "}
                    {registration.team.current_members} members • Leader:{" "}
                    {registration.team.created_by_name}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    Registered:{" "}
                    {format(
                      new Date(registration.registration_date),
                      "dd MMM yyyy HH:mm",
                      { locale: id }
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Removed View Team button */}
                </div>
              </div>

              {/* Team Members Preview */}
              <div className="mb-4">
                <h4 className="text-[11px] font-semibold text-secondary mb-2 tracking-wide uppercase">
                  Team Members
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {registration.team_members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-[var(--secondary-bg)] rounded-lg border border-subtle hover:bg-[var(--tertiary-bg)] transition-colors text-left w-full"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-primary text-sm truncate flex items-center gap-1">
                            {member.full_name}
                            {member.is_team_leader && (
                              // <span className="ml-2 text-[0.6rem] px-2 py-0.5 bg-yellow-600 text-yellow-100 rounded">
                              //   Leader
                              // </span>
                              <Crown className="w-3 h-3 text-yellow-400" />
                            )}
                          </p>
                          <p className="text-[10px] text-muted truncate">
                            {member.university}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewMember(member.id)}
                          className="flex rounded-md text-[10px] items-center gap-1 btn-outline px-2 py-1"
                        >
                          <Eye className="w-3 h-3" />
                          DETAIL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              {registration.payment_proof_url && (
                <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--secondary-bg)]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-medium text-secondary tracking-wide uppercase">
                      Payment Proof
                    </p>
                    <button
                      onClick={() =>
                        handleViewPaymentProof(
                          registration.payment_proof_url!,
                          registration.team.name,
                          registration.registration_date
                        )
                      }
                      className="btn-outline px-3 py-1 text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> VIEW
                    </button>
                  </div>
                </div>
              )}

              {registration.twibbon_proof_url && (
                <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--secondary-bg)]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-medium text-secondary tracking-wide uppercase">
                      Twibbon Proof
                    </p>
                    <Link
                      target="_blank"
                      href={registration.twibbon_proof_url}
                      className="btn-outline px-3 py-1 text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> VIEW
                    </Link>
                  </div>
                </div>
              )}

              {/* Proposal and Orisinalitas Files */}
              {(registration.proposal_url || registration.orisinalitas_url) && (
                <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--secondary-bg)]">
                  <p className="text-[11px] font-medium text-secondary tracking-wide uppercase mb-3">
                    Uploaded Files
                  </p>
                  <div className="space-y-2">
                    {registration.proposal_url && (
                      <div className="flex items-center justify-between gap-4 p-2 bg-[var(--tertiary-bg)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted" />
                          <span className="text-xs text-primary font-medium">
                            {(competition?.name || "").toLowerCase().includes("data science")
                              ? "Notebook (.ipynb)"
                              : "Proposal"}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleViewFile(
                              registration.proposal_url!,
                              registration.team.name,
                              "proposal"
                            )
                          }
                          className="btn-outline px-2 py-1 text-[10px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> VIEW
                        </button>
                      </div>
                    )}
                    {registration.orisinalitas_url && (
                      <div className="flex items-center justify-between gap-4 p-2 bg-[var(--tertiary-bg)] rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted" />
                          <span className="text-xs text-primary font-medium">Surat Orisinalitas</span>
                        </div>
                        <button
                          onClick={() =>
                            handleViewFile(
                              registration.orisinalitas_url!,
                              registration.team.name,
                              "orisinalitas"
                            )
                          }
                          className="btn-outline px-2 py-1 text-[10px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> VIEW
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes for Rejected Registrations */}
              {registration.status === "rejected" &&
                registration.admin_notes && (
                  <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--error-soft)]/40">
                    <p className="text-[11px] font-semibold text-error tracking-wide mb-1 uppercase">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-muted">
                      {registration.admin_notes}
                    </p>
                  </div>
                )}

              {/* Admin Notes for Approved Registrations (if any) */}
              {registration.status === "approved" &&
                registration.admin_notes && (
                  <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--accent-soft)]/40">
                    <p className="text-[11px] font-semibold text-secondary tracking-wide mb-1 uppercase">
                      Admin Notes
                    </p>
                    <p className="text-sm text-muted">
                      {registration.admin_notes}
                    </p>
                  </div>
                )}

              {/* Team Notes */}
              {registration.notes && (
                <div className="mb-4 p-3 rounded-lg border border-subtle bg-[var(--secondary-bg)]">
                  <p className="text-[11px] font-semibold text-secondary tracking-wide mb-1 uppercase">
                    Team Notes
                  </p>
                  <p className="text-sm text-muted">{registration.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              {registration.status === "pending" && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4">
                  <button
                    onClick={() =>
                      handleApproveRegistration(
                        registration.id,
                        registration.team.name
                      )
                    }
                    disabled={isUpdatingStatus}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 btn-neutral disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isUpdatingStatus ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() =>
                      handleRejectRegistration(
                        registration.id,
                        registration.team.name
                      )
                    }
                    disabled={isUpdatingStatus}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 btn-outline text-error disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {isUpdatingStatus ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          // Empty State
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchTerm
                ? `No Teams Found`
                : selectedStatus === "all"
                ? "No Teams Registered"
                : `No ${
                    selectedStatus.charAt(0).toUpperCase() +
                    selectedStatus.slice(1)
                  } Teams`}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? (
                <>
                  No teams match your search "{searchTerm}".{" "}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Clear search
                  </button>{" "}
                  to see all teams.
                </>
              ) : selectedStatus === "all" ? (
                "There are no teams registered for this competition yet."
              ) : (
                `There are no ${selectedStatus} registrations at the moment.`
              )}
            </p>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMemberId && (
        <UnifiedUserDetailModal
          isOpen={isMemberModalOpen}
          onClose={handleCloseMemberModal}
          userId={selectedMemberId}
          onUserUpdate={() => {
            refetchRegistrations();
          }}
        />
      )}

      {/* Payment Proof Modal */}
      {selectedPaymentProof && (
        <PaymentProofModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          imageUrl={selectedPaymentProof.url}
          teamName={selectedPaymentProof.teamName}
          registrationDate={selectedPaymentProof.registrationDate}
        />
      )}

      {/* Approve Registration Modal */}
      <ApproveRegistrationModal
        isOpen={isApproveModalOpen}
        onClose={handleCloseApproveModal}
        onConfirm={handleConfirmApprove}
        teamName={selectedRegistrationForApprove?.teamName || ""}
        isLoading={isUpdatingStatus}
      />

      {/* Reject Registration Modal */}
      <RejectRegistrationModal
        isOpen={isRejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        teamName={selectedRegistrationForReject?.teamName || ""}
        isLoading={isUpdatingStatus}
      />

      {/* Edit WhatsApp Group Modal */}
      <EditWhatsappGroupModal
        isOpen={isEditWhatsappModalOpen}
        onCloseAction={() => setIsEditWhatsappModalOpen(false)}
        onConfirmAction={handleUpdateWhatsappGroup}
        currentWhatsappGroup={competition?.whatsapp_group || ""}
        competitionName={competition?.name || ""}
        isLoading={isUpdatingWhatsapp}
      />

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewerModal
          isOpen={isFileViewerModalOpen}
          onCloseAction={handleCloseFileModal}
          fileUrl={selectedFile.url}
          fileName={selectedFile.fileName}
          teamName={selectedFile.teamName}
          fileType={selectedFile.fileType}
        />
      )}
    </div>
  );
}
