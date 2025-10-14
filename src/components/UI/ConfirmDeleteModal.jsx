import React from "react";
import { motion } from "framer-motion";

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
        return "bg-yellow-500 hover:bg-yellow-600";
      case "delete":
      default:
        return "bg-red-500 hover:bg-red-600";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={() => {
        if (!processing) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur-xl border ${getBorderColor()} rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
        <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 break-words">
          {message || getDefaultMessage()}
        </p>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-4">
          <button
            onClick={onClose}
            disabled={processing}
            aria-disabled={processing}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 ${
              processing ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-800/70"
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
            aria-busy={processing}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-all duration-300 ${getActionColor()} ${
              processing ? "opacity-80 cursor-wait" : ""
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{actionType === "withdraw" ? "Withdrawing..." : "Deleting..."}</span>
              </span>
            ) : (
              actionText
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDeleteModal;
