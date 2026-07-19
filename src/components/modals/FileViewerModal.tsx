"use client";

import React from "react";
import { X, FileText, Download, ExternalLink } from "lucide-react";

interface FileViewerModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  fileUrl: string;
  fileName: string;
  teamName: string;
  fileType: "proposal" | "orisinalitas";
}

export default function FileViewerModal({
  isOpen,
  onCloseAction,
  fileUrl,
  fileName,
  teamName,
  fileType,
}: FileViewerModalProps) {
  if (!isOpen) return null;

  const getFileTypeLabel = () => {
    return fileType === "proposal" ? "Proposal" : "Surat Orisinalitas";
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const isPdf = (url: string) => {
    const ext = getFileExtension(url);
    return ext === 'pdf';
  };

  const isImage = (url: string) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="surface-card rounded-lg shadow-xl w-full max-w-4xl h-[80vh] border border-subtle flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-accent flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {getFileTypeLabel()}
              </h3>
              <p className="text-sm text-muted">
                {teamName} • {fileName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-2 btn-outline text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-2 px-3 py-2 btn-neutral text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
            <button
              onClick={onCloseAction}
              className="text-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {isPdf(fileUrl) ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border border-subtle rounded-lg"
              title={`${getFileTypeLabel()} - ${teamName}`}
            />
          ) : isImage(fileUrl) ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--secondary-bg)] rounded-lg">
              <img
                src={fileUrl}
                alt={`${getFileTypeLabel()} - ${teamName}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--secondary-bg)] rounded-lg border border-subtle">
              <FileText className="w-16 h-16 text-muted mb-4" />
              <h4 className="text-lg font-medium text-primary mb-2">
                File Preview Not Available
              </h4>
              <p className="text-sm text-muted text-center mb-4">
                This file type cannot be previewed in the browser.
                <br />
                Please download the file to view its contents.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 btn-neutral"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-2 px-4 py-2 btn-outline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
