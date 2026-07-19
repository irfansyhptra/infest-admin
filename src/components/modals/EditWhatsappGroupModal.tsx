"use client";

import React, { useState, useEffect } from "react";
import { X, Link, MessageCircle } from "lucide-react";

interface EditWhatsappGroupModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onConfirmAction: (whatsappGroup: string) => Promise<{ success: boolean; error?: string }>;
  currentWhatsappGroup?: string;
  competitionName: string;
  isLoading: boolean;
}

export default function EditWhatsappGroupModal({
  isOpen,
  onCloseAction,
  onConfirmAction,
  currentWhatsappGroup = "",
  competitionName,
  isLoading,
}: EditWhatsappGroupModalProps) {
  const [whatsappGroup, setWhatsappGroup] = useState(currentWhatsappGroup);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWhatsappGroup(currentWhatsappGroup);
    }
  }, [isOpen, currentWhatsappGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const result = await onConfirmAction(whatsappGroup.trim());
      if (result.success) {
        onCloseAction();
      }
    } catch (error) {
      console.error("Error updating WhatsApp group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWhatsappGroup(currentWhatsappGroup);
      onCloseAction();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="surface-card rounded-lg shadow-xl w-full max-w-md border border-subtle">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-accent flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Edit WhatsApp Group
              </h3>
              <p className="text-sm text-muted">
                {competitionName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted hover:text-primary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="whatsapp-group"
                className="block text-sm font-medium text-secondary mb-2"
              >
                WhatsApp Group Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-4 w-4 text-muted" />
                </div>
                <input
                  id="whatsapp-group"
                  type="url"
                  value={whatsappGroup}
                  onChange={(e) => setWhatsappGroup(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="input-neutral pl-10 pr-4 py-2 w-full"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted mt-1">
                Enter the WhatsApp group invitation link for this competition
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto btn-outline px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto btn-neutral px-4 py-2 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
