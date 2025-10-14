import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const StatusChangeModal = ({ application, action, onClose, onSubmit }) => {
  const [localComment, setLocalComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[10050]"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur-xl border border-cyan-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">{action} Application</h3>
          <button
            onClick={() => {
              if (!submitting) onClose();
            }}
            disabled={submitting}
            aria-disabled={submitting}
            className={`text-gray-400 transition-colors duration-200 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg group ${
              submitting ? "opacity-60 cursor-not-allowed" : "hover:text-white"
            }`}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg border border-cyan-400/10">
            <p className="text-sm sm:text-base text-white font-medium break-words">{application?.companyName}</p>
            <p className="text-xs sm:text-sm text-gray-400 break-all">{application?.email}</p>
            <p className="text-xs sm:text-sm text-cyan-400">
              Bid Amount: R{application?.bidAmount?.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={localComment}
              onChange={(e) => setLocalComment(e.target.value)}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
              placeholder="Add a comment about this decision..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-4">
            <button
              onClick={onClose}
              disabled={submitting}
              aria-disabled={submitting}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 ${
                submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800/70"
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
              aria-busy={submitting}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg transition-all duration-300 flex items-center justify-center ${
                action === "Accept"
                  ? "bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
                  : "bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
              } ${submitting ? "opacity-80 cursor-wait" : ""}`}
            >
              {submitting ? (
                <span className="flex items-center space-x-2">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>{action === "Accept" ? "Accepting..." : "Rejecting..."}</span>
                </span>
              ) : (
                <span>{action} Application</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default StatusChangeModal;
