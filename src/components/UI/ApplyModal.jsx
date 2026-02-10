import React, { useState } from "react";
import { X, FileText, Sparkles } from "lucide-react";
import ApplyForm from "./ApplyForm";
import toast from "react-hot-toast";

const ApplyModal = ({
  isOpen,
  onClose,
  tender,
  formData,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSubmit,
  loading,
  error,
  formatFileSize,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    // Create a synthetic event to pass to onFileUpload
    const syntheticEvent = {
      target: {
        files: [file],
      },
    };

    onFileUpload(syntheticEvent, documentType);
  };

  if (!isOpen || !tender) return null;

  return (
    
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
        onClick={onClose}
      >
        <div
          className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-3 border-b border-cyan-400/10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">
                    Apply to Tender
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium truncate">
                    {tender.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-white/10 rounded-lg group disabled:opacity-50"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>
          </div>

          <ApplyForm
            formData={formData}
            onInputChange={onInputChange}
            onFileUpload={onFileUpload}
            onFileDrop={handleFileDrop}
            onRemoveFile={onRemoveFile}
            onSubmit={onSubmit}
            onCancel={onClose}
            loading={loading}
            error={error}
            formatFileSize={formatFileSize}
          />

          {/* Custom scrollbar styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #06b6d4, #a855f7);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #0891b2, #9333ea);
            }
          `}</style>
        </div>
      </div>
    
  );
};

export default ApplyModal;
