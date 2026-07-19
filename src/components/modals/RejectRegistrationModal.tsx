"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare } from 'lucide-react';

interface RejectRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminNotes: string) => void;
  teamName: string;
  isLoading?: boolean;
}

export default function RejectRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  teamName,
  isLoading = false
}: RejectRegistrationModalProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminNotes.trim()) {
      setError('Admin notes are required when rejecting a registration');
      return;
    }

    onConfirm(adminNotes.trim());
  };

  const handleClose = () => {
    setAdminNotes('');
    setError('');
    onClose();
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdminNotes(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md surface-card rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.35)]">
              <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
            </div>
            <div>
              <h3 className="text-sm tracking-wide font-semibold text-primary uppercase">Reject Registration</h3>
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
              Reason for Rejection *
            </label>
            <textarea
              value={adminNotes}
              onChange={handleNotesChange}
              placeholder="Provide a clear reason for rejection..."
              rows={4}
              disabled={isLoading}
              className={`input-neutral px-3 py-2.5 min-h-[120px] resize-none placeholder:text-subtle disabled:opacity-50 ${error ? 'border-[rgba(239,68,68,0.5)]' : ''}`}
            />
            {error && (
              <p className="mt-2 text-xs text-[var(--error)]">{error}</p>
            )}
            <p className="mt-2 text-[10px] text-subtle tracking-wide">
              This note is shared with the team to help them understand the decision.
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
              disabled={isLoading || !adminNotes.trim()}
              className="btn-neutral flex-1 py-2 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
