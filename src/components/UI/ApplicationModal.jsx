import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Building,
  User,
  Mail,
  Phone,
  Award,
  Clock,
  MessageSquare,
  Check,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";
import StatusChangeModal from "./StatusChangeModal";
import { canPerformApplicationAction } from "../../utils/permissions";

const ApplicationModal = ({
  isOpen,
  onClose,
  application,
  tender,
  user,
  onStatusUpdate,
}) => {
  const [statusAction, setStatusAction] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Use permissions from user object if available
  const userPermissions = user?.permissions;

  // Check if user can view applications
  const canView = canPerformApplicationAction(user, userPermissions, tender, 'view');

  // Check if user can accept/reject applications
  const canAcceptReject = canPerformApplicationAction(user, userPermissions, tender, 'accept');

  const canChangeStatus = () => {
    return canAcceptReject;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return format(d, "PPpp");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const openStatusModal = useCallback((action) => {
    setStatusAction(action);
    setShowStatusModal(true);
  }, []);

  const submitStatusChange = useCallback(
    async (comment) => {
      if (!onStatusUpdate || !application) return;
      const id = application._id || application.id;
      const apiStatus = statusAction === "Accept" ? "ACCEPTED" : "REJECTED";
      await onStatusUpdate(id, apiStatus, comment);
      setShowStatusModal(false);
      setStatusAction("");
      onClose?.();
    },
    [onStatusUpdate, application, statusAction, onClose]
  );

  if (!isOpen || !application) return null;

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
        <div className="flex items-start justify-between mb-4 sm:mb-6 md:mb-8">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 break-words">
              Application Details
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <h4 className="text-sm sm:text-base md:text-lg text-cyan-400 font-semibold break-words">
                {application.tender?.title || "Unknown Tender"}
              </h4>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-full border ${
                  (application.status || "").toUpperCase() === "PENDING"
                    ? "text-yellow-400 bg-yellow-400/20 border-yellow-400/30"
                    : (application.status || "").toUpperCase() === "ACCEPTED"
                    ? "text-green-400 bg-green-400/20 border-green-400/30"
                    : (application.status || "").toUpperCase() === "REJECTED"
                    ? "text-red-400 bg-red-400/20 border-red-400/30"
                    : "text-gray-400 bg-gray-400/20 border-gray-400/30"
                }`}
              >
                {application.status}
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

        {/* Application Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
        >
          <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
            Application Summary
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Proposed Amount</p>
                <p className="text-cyan-400 font-semibold text-sm sm:text-base md:text-lg break-words">
                  R{application.bidAmount?.toLocaleString()}
                </p>
              </div>
            </div>

            {application.timeframe && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">Timeframe</p>
                  <p className="text-white font-medium text-sm sm:text-base break-words">
                    {application.timeframe}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Applied On</p>
                <p className="text-white font-medium text-xs sm:text-sm break-words">
                  {formatDate(application.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Last Updated</p>
                <p className="text-white font-medium text-xs sm:text-sm break-words">
                  {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
        >
          <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
            Company Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-gray-400 text-sm">Company Name</p>
                  <p className="text-white font-medium">{application.companyName}</p>
                </div>
              </div>

              {application.registrationNumber && (
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Registration Number</p>
                    <p className="text-white font-medium">{application.registrationNumber}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {application.bbeeLevel && (
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">B-BBEE Level</p>
                    <p className="text-white font-medium">Level {application.bbeeLevel}</p>
                  </div>
                </div>
              )}

              {application.cidbGrading && (
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">CIDB Grading</p>
                    <p className="text-white font-medium">{application.cidbGrading}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
        >
          <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
            Contact Information
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-gray-400 text-sm">Contact Person</p>
                <p className="text-white font-medium">{application.contactPerson}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-cyan-400">{application.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">{application.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cover Letter */}
        {application.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
          >
            <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Cover Letter
            </h5>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {application.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Supporting Documents */}
        {application.files && application.files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
          >
            <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Supporting Documents ({application.files.length})
            </h5>
            <div className="space-y-3">
              {application.files.map((doc, idx) => (
                <div
                  key={doc._id || idx}
                  className="flex items-center justify-between p-4 bg-slate-800/50 border border-cyan-400/10 rounded-lg hover:bg-slate-800/70 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {doc.originalName || doc.name || `Document ${idx + 1}`}
                      </p>
                      {doc.size && (
                        <p className="text-gray-400 text-xs">{formatFileSize(doc.size)}</p>
                      )}
                    </div>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tender Information */}
        {application.tender && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8"
          >
            <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Tender Information
            </h5>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Title</p>
                <p className="text-white font-medium">{application.tender.title}</p>
              </div>
              {application.tender.description && (
                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-gray-300">{application.tender.description}</p>
                </div>
              )}
              {application.tender.category && (
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white font-medium">{application.tender.category}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {application.status?.toLowerCase() === "pending" && canChangeStatus() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-3 sm:p-4 md:p-6 mb-2 sm:mb-4"
          >
            <h5 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3 sm:mb-4">
              Application Actions
            </h5>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => openStatusModal("Reject")}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300"
              >
                <XIcon className="w-5 h-5" />
                <span>Reject Application</span>
              </button>
              <button
                onClick={() => openStatusModal("Accept")}
                className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300"
              >
                <Check className="w-5 h-5" />
                <span>Accept Application</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Reusable Status Change Modal */}
        {showStatusModal && (
          <StatusChangeModal
            application={application}
            action={statusAction}
            onClose={() => {
              setShowStatusModal(false);
              setStatusAction("");
            }}
            onSubmit={submitStatusChange}
          />
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

export default ApplicationModal;
