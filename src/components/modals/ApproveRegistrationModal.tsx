"use client";

import React, { useState } from 'react';
import { X, CheckCircle, MessageSquare } from 'lucide-react';

interface ApproveRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminNotes?: string | null) => void;
  teamName: string;
  isLoading?: boolean;
}

export default function ApproveRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  teamName,
  isLoading = false
}: ApproveRegistrationModalProps) {
  const [adminNotes, setAdminNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send null if no notes, otherwise send the trimmed notes
    const notes = adminNotes.trim();
    onConfirm(notes || null);
  };

  const handleClose = () => {
    setAdminNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md surface-card rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.35)]">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <h3 className="text-sm tracking-wide font-semibold text-primary uppercase">Approve Registration</h3>
              <p className="text-xs text-muted">Team: {teamName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-[var(--accent-soft)] transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="flex items-center gap-2 text-xs font-medium text-secondary mb-2 uppercase tracking-wide">
              <MessageSquare className="w-4 h-4 text-muted" />
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any notes for this approval (optional)..."
              rows={3}
              disabled={isLoading}
              className="input-neutral px-3 py-2.5 min-h-[96px] resize-none placeholder:text-subtle disabled:opacity-50"
            />
            <p className="mt-2 text-[10px] text-subtle tracking-wide">
              Optional internal note for this approval.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn-outline flex-1 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-neutral flex-1 py-2 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
