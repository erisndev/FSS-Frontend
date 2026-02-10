import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { createPortal } from "react-dom";
import { X, CheckCircle, XCircle, MessageSquare, Building, Mail, DollarSign } from "lucide-react";

const StatusChangeModal = ({ application, action, onClose, onSubmit }) => {
  const [localComment, setLocalComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const isAccept = action === "Accept";

  return createPortal(
    
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[10050]"
        onClick={() => {
          if (!submitting) onClose();
        }}
      >
        <div
          className="bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur-xl border border-cyan-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
          <div className="flex items-start justify-between mb-6 border-b border-cyan-400/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isAccept ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-orange-500/20'} flex items-center justify-center`}>
                {isAccept ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{action} Application</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAccept ? 'Approve this application' : 'Reject this application'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!submitting) onClose();
              }}
              disabled={submitting}
              className={`text-gray-400 transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg group ${
                submitting ? "opacity-60 cursor-not-allowed" : "hover:text-white"
              }`}
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Application Info */}
            <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl border border-cyan-400/10">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Building className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Company</p>
                    <p className="text-sm font-semibold text-white truncate">{application?.companyName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-white truncate">{application?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">Bid Amount</p>
                    <p className="text-sm font-semibold text-green-400">
                      R{application?.bidAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-200 mb-3">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Comment (Optional)</span>
              </label>
              <textarea
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                rows={4}
                disabled={submitting}
                className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 resize-none disabled:opacity-50"
                placeholder="Add a comment about this decision..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {localComment.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={submitting}
                className={`px-4 py-2.5 text-sm bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 font-medium ${
                  submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800/70 hover:border-gray-400/40"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (submitting) return;
                  try {
                    setSubmitting(true);
                    await onSubmit(localComment);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className={`px-4 py-2.5 text-sm rounded-lg transition-all duration-300 flex items-center justify-center font-semibold shadow-lg ${
                  isAccept
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl"
                    : "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white hover:shadow-xl"
                } ${submitting ? "opacity-80 cursor-wait" : ""}`}
              >
                {submitting ? (
                  <span className="flex items-center space-x-2">
                    <LoadingSpinner variant="inline" size="sm" color="white" />
                    <span>{isAccept ? "Accepting..." : "Rejecting..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    {isAccept ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{action} Application</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    ,
    document.body
  );
};

export default StatusChangeModal;
