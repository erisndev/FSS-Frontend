import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Lock,
  Archive,
} from "lucide-react";
import { format } from "date-fns";

const TenderCard = ({ tender, index, onView, onApply }) => {
  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/20";
      case "CLOSED":
        return "text-red-400 bg-red-400/20";
      case "ARCHIVED":
        return "text-gray-400 bg-gray-400/20";
      case "CANCELLED":
        return "text-gray-400 bg-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const formatDate = (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "N/A";
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

  const isClosedOrArchived = () => {
    const s = (tender.status || "").toLowerCase();
    return s === "closed" || s === "archived";
  };

  const applyLabel = isClosedOrArchived() ? (tender.status || "Closed") : "Apply";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {tender.title}
          </h3>
          <p className="text-gray-400 text-sm">{tender.category}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {tender.isUrgent && (
            <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              <AlertCircle className="w-3 h-3" />
              <span>Urgent</span>
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
              tender.status
            )}`}
          >
            {tender.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {tender.description}
      </p>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-medium">
            {tender.budgetMin || tender.budgetMax
              ? `R${Number(tender.budgetMin || 0).toLocaleString()} - R${Number(
                  tender.budgetMax || 0
                ).toLocaleString()}`
              : `R${Number(tender.budget || 0).toLocaleString()}`}
          </span>
          <span className="text-gray-400">budget</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-white">{formatDate(tender.deadline)}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              getDaysUntilDeadline(tender.deadline) <= 7
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {getDaysUntilDeadline(tender.deadline)} days left
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">
            Posted {formatDate(tender.createdAt, "MMM dd")}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">
            {tender.documents?.length || 0} documents
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
        <div className="text-sm text-gray-400">By {tender.companyName}</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(tender)}
            className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isClosedOrArchived() ? (
            <div
              role="status"
              title="This tender is not accepting applications"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border select-none ${
                (tender.status || "").toLowerCase() === "archived"
                  ? "bg-gray-600/30 text-gray-200 border-gray-400/30"
                  : "bg-red-600/20 text-red-200 border-red-400/30"
              }`}
            >
              {(tender.status || "").toLowerCase() === "archived" ? (
                <Archive className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>
                {(tender.status || "").toLowerCase() === "archived"
                  ? "Archived"
                  : "Applications closed"}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onApply(tender)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TenderCard;
