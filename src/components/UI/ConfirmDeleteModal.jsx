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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => {
        if (!processing) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-slate-900/95 backdrop-blur-xl border ${getBorderColor()} rounded-2xl p-6 max-w-sm w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">
          {message || getDefaultMessage()}
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={processing}
            aria-disabled={processing}
            className={`px-4 py-2 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 ${
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
            className={`px-4 py-2 text-white rounded-lg transition-all duration-300 ${getActionColor()} ${
              processing ? "opacity-80 cursor-wait" : ""
            }`}
          >
            {processing ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
