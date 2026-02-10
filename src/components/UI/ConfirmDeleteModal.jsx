import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { AlertTriangle, Trash2, X } from "lucide-react";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  title = "Confirm Delete",
  message = null,
  actionText = "Delete",
  actionType = "delete", // "delete" or "withdraw"
}) => {
  if (!isOpen) return null;
  const [processing, setProcessing] = React.useState(false);

  const getActionColor = () => {
    switch (actionType) {
      case "withdraw":
        return "from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700";
      case "delete":
      default:
        return "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
    }
  };

  const getBorderColor = () => {
    switch (actionType) {
      case "withdraw":
        return "border-yellow-400/30";
      case "delete":
      default:
        return "border-red-400/30";
    }
  };

  const getIconColor = () => {
    switch (actionType) {
      case "withdraw":
        return "text-yellow-400";
      case "delete":
      default:
        return "text-red-400";
    }
  };

  const getDefaultMessage = () => {
    switch (actionType) {
      case "withdraw":
        return `Are you sure you want to withdraw ${itemName}? This action cannot be undone.`;
      case "delete":
      default:
        return `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
    }
  };

  return (
    
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]"
        onClick={() => {
          if (!processing) onClose();
        }}
      >
        <div
          className={`bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur-xl border ${getBorderColor()} rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${actionType === 'withdraw' ? 'from-yellow-500/20 to-orange-500/20' : 'from-red-500/20 to-red-600/20'} flex items-center justify-center`}>
                <AlertTriangle className={`w-6 h-6 ${getIconColor()}`} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
                <p className="text-xs text-gray-400">This action is permanent</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <div className={`p-4 rounded-lg border ${getBorderColor()} bg-gradient-to-r ${actionType === 'withdraw' ? 'from-yellow-500/10 to-orange-500/10' : 'from-red-500/10 to-red-600/10'} mb-6`}>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed break-words">
              {message || getDefaultMessage()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={processing}
              className={`px-4 py-2.5 text-sm sm:text-base bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 font-medium ${
                processing ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800/70 hover:border-gray-400/40"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  setProcessing(true);
                  await onConfirm();
                  onClose();
                } finally {
                  setProcessing(false);
                }
              }}
              disabled={processing}
              className={`px-4 py-2.5 text-sm sm:text-base text-white rounded-lg transition-all duration-300 font-semibold bg-gradient-to-r ${getActionColor()} shadow-lg ${
                processing ? "opacity-80 cursor-wait" : "hover:shadow-xl"
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center space-x-2">
                  <LoadingSpinner variant="inline" size="sm" color="white" />
                  <span>{actionType === "withdraw" ? "Withdrawing..." : "Deleting..."}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>{actionText}</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    
  );
};

export default ConfirmDeleteModal;
