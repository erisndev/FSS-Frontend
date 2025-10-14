import React from "react";
import { motion } from "framer-motion";
import {
  X,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const ViewTenderModal = ({ isOpen, onClose, tender }) => {
  if (!isOpen || !tender) return null;

  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/20";
      case "CLOSED":
        return "text-red-400 bg-red-400/20";
      case "CANCELLED":
        return "text-gray-400 bg-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const formatDate = (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, formatStr);
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 0;
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full max-h-[95vh] sm:max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 break-words">
              {tender.title}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tender.isUrgent && (
                <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500/20 border border-red-400/30 text-red-400 text-xs rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  <span>Urgent</span>
                </span>
              )}
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-full border ${getStatusColor(
                  tender.status
                )} border-opacity-30`}
              >
                {tender.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0 group"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        {/* Description */}
        {tender.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-2 sm:mb-3">
              Description
            </h4>
            <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">
                {tender.description}
              </p>
            </div>
          </motion.div>
        )}

        {/* Core Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
        >
          {/* Basic Details */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Tender Details
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Category:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.category || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Budget:
                </span>
                <span className="text-xs sm:text-sm text-cyan-400 font-semibold text-right">
                  {tender.budgetMin || tender.budgetMax
                    ? `R${Number(
                        tender.budgetMin || 0
                      ).toLocaleString()} - R${Number(
                        tender.budgetMax || 0
                      ).toLocaleString()}`
                    : `R${Number(tender.budget || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Deadline:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right">
                  {formatDate(tender.deadline, "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Days Left:
                </span>
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    getDaysUntilDeadline(tender.deadline) <= 7
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {getDaysUntilDeadline(tender.deadline)} days
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Applications:
                </span>
                <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                  {tender.applications.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Company Information
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Company Name:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.companyName || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Registration No.:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.registrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  B-BBEE Level:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right">
                  {tender.bbeeLevel || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  CIDB Grading:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right">
                  {tender.cidbGrading || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Verification Code:
                </span>
                <span className="text-xs sm:text-sm text-purple-400 font-mono text-right break-all">
                  {tender.verificationCode || "—"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact & Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
        >
          {/* Contact Information */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Contact Information
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Contact Person:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.contactPerson || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Email:
                </span>
                <span className="text-xs sm:text-sm text-cyan-400 text-right break-all">
                  {tender.contactEmail || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Phone:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.contactPhone || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Issuer:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                  {tender.companyName || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6">
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Metadata
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                  Posted:
                </span>
                <span className="text-xs sm:text-sm text-white text-right">
                  {formatDate(tender.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        {tender.requirements && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-2 sm:mb-3">
              Requirements
            </h4>
            <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4">
              {Array.isArray(tender.requirements) ? (
                <ul className="list-disc list-inside text-xs sm:text-sm text-gray-300 space-y-1.5 sm:space-y-2">
                  {tender.requirements.map((req, idx) => (
                    <li
                      key={`req-${idx}`}
                      className="leading-relaxed break-words"
                    >
                      {req}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed break-words overflow-wrap-anywhere">
                  {tender.requirements}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {tender.tags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 sm:mb-6 md:mb-8"
          >
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-2 sm:mb-3">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tender.tags.map((tag, idx) => (
                <span
                  key={tag + idx}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Documents */}
        {tender.documents?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-2 sm:mb-4"
          >
            <h4 className="text-base sm:text-lg font-semibold text-cyan-400 mb-2 sm:mb-3">
              Documents
            </h4>
            <div className="space-y-2 sm:space-y-3">
              {tender.documents.map((doc, idx) => {
                const name =
                  doc?.name ||
                  doc?.originalName ||
                  (typeof doc === "string"
                    ? doc.split("/").pop()
                    : `Document ${idx + 1}`);
                const size = doc?.size;
                const url =
                  doc?.url || (typeof doc === "string" ? doc : undefined);
                return (
                  <div
                    key={`doc-${idx}`}
                    className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-white font-medium truncate">
                          {name}
                        </p>
                        {size && (
                          <p className="text-xs text-gray-400">
                            {formatFileSize(size)}
                          </p>
                        )}
                      </div>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        download={true}
                        rel="noopener noreferrer"
                        className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                      >
                        Download
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
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

export default ViewTenderModal;
