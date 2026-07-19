"use client";

import React, { useState } from 'react';
import { X, ExternalLink, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  teamName: string;
  registrationDate: string;
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  imageUrl,
  teamName,
  registrationDate
}: PaymentProofModalProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-proof-${teamName}-${new Date(registrationDate).toISOString().split('T')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl surface-card rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-subtle">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-primary">Payment Proof</h2>
            <p className="text-xs text-muted mt-1">Team: {teamName} • Uploaded: {new Date(registrationDate).toLocaleDateString('id-ID')}</p>
          </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted hover:text-primary hover:bg-[var(--accent-soft)] transition"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Image Container */}
        <div className="relative bg-[var(--tertiary-bg)]">
          <div className="flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
            {!isImageLoaded && !imageError && (
              <div className="text-center p-10">
                <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted text-xs tracking-wide">Loading image…</p>
              </div>
            )}

            {imageError && (
              <div className="text-center p-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.35)]">
                  <X className="w-8 h-8 text-[var(--error)]" />
                </div>
                <p className="text-[var(--error)] mb-2 text-sm">Failed to load image</p>
                <p className="text-subtle text-[11px]">Check if the image URL is valid</p>
                <button
                  onClick={handleOpenInNewTab}
                  className="btn-neutral mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            )}

            {!imageError && (
              <img
                src={imageUrl}
                alt={`Payment proof for ${teamName}`}
                className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setIsImageLoaded(false);
                }}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            )}
          </div>

          {/* Action Buttons */}
          {isImageLoaded && !imageError && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 bg-[var(--accent-soft)]/80 hover:bg-[var(--accent-soft)] text-primary rounded-lg transition backdrop-blur-sm"
                title={isZoomed ? 'Zoom Out' : 'Zoom In'}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-subtle bg-[var(--secondary-bg)]">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleDownload}
              className="btn-outline px-3 py-1.5 text-xs inline-flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="btn-neutral px-3 py-1.5 text-xs inline-flex items-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              Open Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
