import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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
        className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Apply to Tender</h3>
            <p className="text-cyan-400 font-medium">"{tender.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
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
      </motion.div>
    </motion.div>
  );
};

export default ApplyModal;