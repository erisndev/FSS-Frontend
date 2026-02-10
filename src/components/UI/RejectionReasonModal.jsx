import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { X, AlertCircle, MessageSquare, XOctagon } from "lucide-react";

const RejectionReasonModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onSubmit(reason);
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-slate-900 to-slate-950 border border-red-400/20 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
              {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-red-400/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                  <XOctagon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Rejection Reason
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Provide feedback for rejection
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="p-4 rounded-lg border border-red-400/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Please provide a reason for rejecting this request. This will help the applicant understand why their request was not approved.
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Reason for Rejection <span className="text-red-400">*</span></span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter a clear and constructive reason for rejection..."
                  rows={5}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {reason.length}/500 characters
                  </p>
                  {error && (
                    <p
                      className="text-sm text-red-400 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 bg-slate-800/30 border-t border-red-400/10">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 hover:border-gray-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !reason.trim()}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner variant="inline" size="sm" color="white" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XOctagon className="w-4 h-4" />
                    <span>Reject Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RejectionReasonModal;
