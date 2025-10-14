import React from "react";
import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import ApplyForm from "./ApplyForm";

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
  formatFileSize
}) => {
  if (!isOpen || !tender) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-3 border-b border-cyan-400/10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Apply to Tender</h3>
                <p className="text-xs text-cyan-400 font-medium truncate">"{tender.title}"</p>
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
      </motion.div>
    </motion.div>
  );
};

export default ApplyModal;