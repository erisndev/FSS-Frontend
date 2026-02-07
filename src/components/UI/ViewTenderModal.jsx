import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  File,
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full max-h-[95vh] sm:max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl"
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
                  Company Address:
                </span>
                <span className="text-xs sm:text-sm text-white font-medium text-right break-words whitespace-pre-line">
                  {tender.companyAddress || "—"}
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

            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white mb-2">
                  Technical Contact
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Contact Person:
                    </span>
                    <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                      {tender.technicalContactPerson || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Email:
                    </span>
                    <span className="text-xs sm:text-sm text-cyan-400 text-right break-all">
                      {tender.technicalContactEmail || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Phone:
                    </span>
                    <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                      {tender.technicalContactPhone || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-400/10">
                <p className="text-xs sm:text-sm font-semibold text-white mb-2">
                  General / Bid Queries Contact
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Contact Person:
                    </span>
                    <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                      {tender.generalContactPerson || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Email:
                    </span>
                    <span className="text-xs sm:text-sm text-cyan-400 text-right break-all">
                      {tender.generalContactEmail || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 flex-shrink-0">
                      Phone:
                    </span>
                    <span className="text-xs sm:text-sm text-white font-medium text-right break-words">
                      {tender.generalContactPhone || "—"}
                    </span>
                  </div>
                </div>
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
        {(tender.documents?.length > 0 || 
          tender.documents?.bidFileDocuments || 
          tender.documents?.compiledDocuments || 
          tender.documents?.financialDocuments || 
          tender.documents?.technicalProposal || 
          tender.documents?.proofOfExperience) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-2 sm:mb-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white">
                  Required Documents
                </h4>
                <p className="text-xs text-gray-400">
                  Download tender documentation
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {/* Check if documents is an array with labels */}
              {Array.isArray(tender.documents) && tender.documents.length > 0 && tender.documents[0]?.label ? (
                // New format: Array with label property
                <>
                  {/* Always show these 5 required document labels */}
                  {['Bid File Documents', 'Compiled Documents', 'Financial Documents', 'Technical Proposal', 'Proof of Experience (Reference Letter)'].map((requiredLabel, index) => {
                    const doc = tender.documents.find(d => d.label === requiredLabel);
                    const getFileExtension = (filename) => {
                      if (!filename) return 'file';
                      const ext = filename.split('.').pop().toLowerCase();
                      return ext;
                    };
                    const getFileTypeColor = (filename) => {
                      const ext = getFileExtension(filename);
                      if (['pdf'].includes(ext)) return 'from-red-500/20 to-red-600/20 border-red-400/30';
                      if (['doc', 'docx'].includes(ext)) return 'from-blue-500/20 to-blue-600/20 border-blue-400/30';
                      if (['xls', 'xlsx'].includes(ext)) return 'from-green-500/20 to-green-600/20 border-green-400/30';
                      if (['jpg', 'jpeg', 'png'].includes(ext)) return 'from-purple-500/20 to-purple-600/20 border-purple-400/30';
                      return 'from-cyan-500/20 to-cyan-600/20 border-cyan-400/30';
                    };
                    const getFileTypeIcon = (filename) => {
                      const ext = getFileExtension(filename);
                      if (['pdf'].includes(ext)) return '📄';
                      if (['doc', 'docx'].includes(ext)) return '📝';
                      if (['xls', 'xlsx'].includes(ext)) return '📊';
                      if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
                      return '📎';
                    };
                    
                    return (
                      <motion.div 
                        key={requiredLabel}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="group"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-200">
                            {requiredLabel}
                          </label>
                          {doc ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        {doc ? (
                          <div className={`relative flex items-center justify-between gap-3 p-4 bg-gradient-to-r ${getFileTypeColor(doc.name || doc.originalName)} border rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group-hover:scale-[1.02]`}>
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-cyan-400/20 shadow-lg">
                                  <span className="text-2xl">{getFileTypeIcon(doc.name || doc.originalName)}</span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate mb-0.5">
                                  {doc.name || doc.originalName || 'Document'}
                                </p>
                                <div className="flex items-center space-x-2">
                                  {doc.size && (
                                    <span className="text-xs text-gray-400 font-medium">
                                      {formatFileSize(doc.size)}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-cyan-400 uppercase font-bold">
                                    {getFileExtension(doc.name || doc.originalName)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                download={true}
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/40 text-cyan-300 rounded-lg hover:from-cyan-500/40 hover:to-purple-500/40 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-sm font-semibold flex-shrink-0 group/btn"
                              >
                                <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-red-400/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-400/30">
                                <XCircle className="w-6 h-6 text-red-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-red-400">Not Uploaded</p>
                                <p className="text-xs text-gray-500">This document is required</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </>
              ) : tender.documents && typeof tender.documents === 'object' && !Array.isArray(tender.documents) ? (
                <>
                  {/* Bid File Documents */}
                  {tender.documents.bidFileDocuments && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Bid File Documents
                      </label>
                      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {typeof tender.documents.bidFileDocuments === 'string' 
                                ? tender.documents.bidFileDocuments.split('/').pop() 
                                : tender.documents.bidFileDocuments.name || 'Bid File Documents'}
                            </p>
                            {tender.documents.bidFileDocuments.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(tender.documents.bidFileDocuments.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={typeof tender.documents.bidFileDocuments === 'string' 
                            ? tender.documents.bidFileDocuments 
                            : tender.documents.bidFileDocuments.url}
                          target="_blank"
                          download={true}
                          rel="noopener noreferrer"
                          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Compiled Documents */}
                  {tender.documents.compiledDocuments && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Compiled Documents
                      </label>
                      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {typeof tender.documents.compiledDocuments === 'string' 
                                ? tender.documents.compiledDocuments.split('/').pop() 
                                : tender.documents.compiledDocuments.name || 'Compiled Documents'}
                            </p>
                            {tender.documents.compiledDocuments.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(tender.documents.compiledDocuments.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={typeof tender.documents.compiledDocuments === 'string' 
                            ? tender.documents.compiledDocuments 
                            : tender.documents.compiledDocuments.url}
                          target="_blank"
                          download={true}
                          rel="noopener noreferrer"
                          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Financial Documents */}
                  {tender.documents.financialDocuments && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Financial Documents
                      </label>
                      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {typeof tender.documents.financialDocuments === 'string' 
                                ? tender.documents.financialDocuments.split('/').pop() 
                                : tender.documents.financialDocuments.name || 'Financial Documents'}
                            </p>
                            {tender.documents.financialDocuments.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(tender.documents.financialDocuments.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={typeof tender.documents.financialDocuments === 'string' 
                            ? tender.documents.financialDocuments 
                            : tender.documents.financialDocuments.url}
                          target="_blank"
                          download={true}
                          rel="noopener noreferrer"
                          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Technical Proposal */}
                  {tender.documents.technicalProposal && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Technical Proposal
                      </label>
                      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {typeof tender.documents.technicalProposal === 'string' 
                                ? tender.documents.technicalProposal.split('/').pop() 
                                : tender.documents.technicalProposal.name || 'Technical Proposal'}
                            </p>
                            {tender.documents.technicalProposal.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(tender.documents.technicalProposal.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={typeof tender.documents.technicalProposal === 'string' 
                            ? tender.documents.technicalProposal 
                            : tender.documents.technicalProposal.url}
                          target="_blank"
                          download={true}
                          rel="noopener noreferrer"
                          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Proof of Experience */}
                  {tender.documents.proofOfExperience && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Proof of Experience (Reference Letter)
                      </label>
                      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {typeof tender.documents.proofOfExperience === 'string' 
                                ? tender.documents.proofOfExperience.split('/').pop() 
                                : tender.documents.proofOfExperience.name || 'Proof of Experience'}
                            </p>
                            {tender.documents.proofOfExperience.size && (
                              <p className="text-xs text-gray-400">
                                {formatFileSize(tender.documents.proofOfExperience.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <a
                          href={typeof tender.documents.proofOfExperience === 'string' 
                            ? tender.documents.proofOfExperience 
                            : tender.documents.proofOfExperience.url}
                          target="_blank"
                          download={true}
                          rel="noopener noreferrer"
                          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-xs sm:text-sm font-medium flex-shrink-0"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback for old array format */
                Array.isArray(tender.documents) && tender.documents.map((doc, idx) => {
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
                })
              )}
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
    </AnimatePresence>
  );
};

export default ViewTenderModal;
