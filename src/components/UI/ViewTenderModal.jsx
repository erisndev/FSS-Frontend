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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-3">
              {tender.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tender.isUrgent && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-500/20 border border-red-400/30 text-red-400 text-xs rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  <span>Urgent</span>
                </span>
              )}
              <span
                className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                  tender.status
                )} border-opacity-30`}
              >
                {tender.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {tender.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">
              Description
            </h4>
            <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Basic Details */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Tender Details
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Category:</span>
                <span className="text-white font-medium">
                  {tender.category || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Budget:</span>
                <span className="text-cyan-400 font-semibold">
                  {tender.budgetMin || tender.budgetMax
                    ? `$${Number(
                        tender.budgetMin || 0
                      ).toLocaleString()} - $${Number(
                        tender.budgetMax || 0
                      ).toLocaleString()}`
                    : `$${Number(tender.budget || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deadline:</span>
                <span className="text-white font-medium">
                  {formatDate(tender.deadline, "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Days Left:</span>
                <span
                  className={`font-semibold ${
                    getDaysUntilDeadline(tender.deadline) <= 7
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {getDaysUntilDeadline(tender.deadline)} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Applications:</span>
                <span className="text-emerald-400 font-medium">
                  {tender.applicationsCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Company Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Company Name:</span>
                <span className="text-white font-medium">
                  {tender.companyName || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Registration No.:</span>
                <span className="text-white font-medium">
                  {tender.registrationNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">B-BBEE Level:</span>
                <span className="text-white font-medium">
                  {tender.bbeeLevel || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CIDB Grading:</span>
                <span className="text-white font-medium">
                  {tender.cidbGrading || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Verification Code:</span>
                <span className="text-purple-400 font-mono text-sm">
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Contact Information */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Contact Person:</span>
                <span className="text-white font-medium">
                  {tender.contactPerson || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span className="text-cyan-400">
                  {tender.contactEmail || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Phone:</span>
                <span className="text-white font-medium">
                  {tender.contactPhone || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Issuer:</span>
                <span className="text-white font-medium">
                  {tender.companyName || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">
              Metadata
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Posted:</span>
                <span className="text-white text-sm">
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
            className="mb-8"
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">
              Requirements
            </h4>
            <div className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4">
              {Array.isArray(tender.requirements) ? (
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {tender.requirements.map((req, idx) => (
                    <li key={`req-${idx}`} className="leading-relaxed">
                      {req}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
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
            className="mb-8"
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tender.tags.map((tag, idx) => (
                <span
                  key={tag + idx}
                  className="px-3 py-1 text-sm rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors duration-200"
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
            className="mb-4"
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">
              Documents
            </h4>
            <div className="space-y-3">
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
                    className="flex items-center justify-between p-4 bg-slate-800/30 border border-cyan-400/10 rounded-lg hover:bg-slate-800/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{name}</p>
                        {size && (
                          <p className="text-gray-400 text-sm">
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
                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-sm font-medium"
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
      </motion.div>
    </motion.div>
  );
};

export default ViewTenderModal;
