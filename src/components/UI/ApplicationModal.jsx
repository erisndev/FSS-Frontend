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

const ApplicationModal = ({
  isOpen,
  onClose,
  application,
  tender,
  user,
  onStatusUpdate,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [statusComment, setStatusComment] = useState("");

  const canChangeStatus = () => {
    // Check if user is admin or tender creator
    return (
      user?.role === "admin" ||
      tender?.createdBy === user?.id ||
      tender?.userId === user?.id
    );
  };

  const openConfirmModal = useCallback((action) => {
    setStatusAction(action);
    setShowConfirmModal(true);
  }, []);

  const confirmStatusChange = useCallback(() => {
    setShowConfirmModal(false);
    setShowStatusModal(true);
  }, []);

  const handleStatusUpdate = useCallback(
    (comment) => {
      if (onStatusUpdate) {
        onStatusUpdate(
          application._id || application.id,
          statusAction === "ACCEPT" ? "ACCEPTED" : "REJECTED",
          comment
        );
      }
      setShowStatusModal(false);
      setStatusComment("");
      setStatusAction("");
      onClose();
    },
    [onStatusUpdate, application, statusAction, onClose]
  );

  const handleCommentChange = useCallback(
    (e) => {
      setStatusComment(e.target.value);
    },
    [setStatusComment]
  );

  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "ACCEPTED":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "REJECTED":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "WITHDRAWN":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
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

  if (!isOpen || !application) return null;

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
              Application Details
            </h3>
            <div className="flex items-center space-x-3">
              <h4 className="text-lg text-cyan-400 font-semibold">
                {application.tender?.title || "Unknown Tender"}
              </h4>
              <span
                className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status}
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

        <div className="space-y-8">
          {/* Application Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
          >
            <h5 className="text-lg font-semibold text-cyan-400 mb-4">
              Application Summary
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-gray-400 text-sm">Proposed Amount</p>
                  <p className="text-cyan-400 font-semibold text-lg">
                    ${application.bidAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {application.timeframe && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Timeframe</p>
                    <p className="text-white font-medium">
                      {application.timeframe}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-gray-400 text-sm">Applied On</p>
                  <p className="text-white font-medium">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Last Updated</p>
                  <p className="text-white font-medium">
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
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
          >
            <h5 className="text-lg font-semibold text-cyan-400 mb-4">
              Company Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Company Name</p>
                    <p className="text-white font-medium">
                      {application.companyName}
                    </p>
                  </div>
                </div>

                {application.registrationNumber && (
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">
                        Registration Number
                      </p>
                      <p className="text-white font-medium">
                        {application.registrationNumber}
                      </p>
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
                      <p className="text-white font-medium">
                        Level {application.bbeeLevel}
                      </p>
                    </div>
                  </div>
                )}

                {application.cidbGrading && (
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">CIDB Grading</p>
                      <p className="text-white font-medium">
                        {application.cidbGrading}
                      </p>
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
            className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
          >
            <h5 className="text-lg font-semibold text-cyan-400 mb-4">
              Contact Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-gray-400 text-sm">Contact Person</p>
                  <p className="text-white font-medium">
                    {application.contactPerson}
                  </p>
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
              className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
            >
              <h5 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
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
              className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
            >
              <h5 className="text-lg font-semibold text-cyan-400 mb-4">
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
                          {doc.originalName ||
                            doc.name ||
                            `Document ${idx + 1}`}
                        </p>
                        {doc.size && (
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(doc.size)}
                          </p>
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
              className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
            >
              <h5 className="text-lg font-semibold text-cyan-400 mb-4">
                Tender Information
              </h5>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Title</p>
                  <p className="text-white font-medium">
                    {application.tender.title}
                  </p>
                </div>
                {application.tender.description && (
                  <div>
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-gray-300">
                      {application.tender.description}
                    </p>
                  </div>
                )}
                {application.tender.category && (
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-white font-medium">
                      {application.tender.category}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons - Only show for pending applications and authorized users */}
          {application.status?.toUpperCase() === "PENDING" &&
            canChangeStatus() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
              >
                <h5 className="text-lg font-semibold text-cyan-400 mb-4">
                  Application Actions
                </h5>
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => openConfirmModal("REJECT")}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300"
                  >
                    <XIcon className="w-5 h-5" />
                    <span>Reject Application</span>
                  </button>
                  <button
                    onClick={() => openConfirmModal("ACCEPT")}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300"
                  >
                    <Check className="w-5 h-5" />
                    <span>Accept Application</span>
                  </button>
                </div>
              </motion.div>
            )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[10001]"
            onClick={() => setShowConfirmModal(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Confirm {statusAction}
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-400/10">
                  <p className="text-white font-medium">
                    {application.companyName}
                  </p>
                  <p className="text-gray-400 text-sm">{application.email}</p>
                  <p className="text-cyan-400 text-sm">
                    Bid Amount: ${application.bidAmount?.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Are you sure you want to {statusAction.toLowerCase()} this
                    application? This action cannot be undone.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                      statusAction === "ACCEPT"
                        ? "bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    Yes, {statusAction}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[10002]"
            onClick={() => setShowStatusModal(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {statusAction} Application
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-800/30 rounded-lg border border-cyan-400/10">
                  <p className="text-white font-medium">
                    {application.companyName}
                  </p>
                  <p className="text-gray-400 text-sm">{application.email}</p>
                  <p className="text-cyan-400 text-sm">
                    Bid Amount: ${application.bidAmount?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={statusComment}
                    onChange={handleCommentChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                    placeholder="Add a comment about this decision..."
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(statusComment)}
                    className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                      statusAction === "ACCEPT"
                        ? "bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {statusAction} Application
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ApplicationModal;
