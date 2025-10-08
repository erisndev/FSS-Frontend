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

const TenderCard = ({ tender, index, onView, onApply, isApplied = false }) => {
  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/20";
      case "CLOSED":
        return "text-red-400 bg-red-400/20";
      case "ARCHIVED":
        return "text-blue-400 bg-blue-400/20";
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

  const applyLabel = isClosedOrArchived() ? tender.status || "Closed" : "Apply";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-5 md:p-6 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300"
    >
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2 line-clamp-2">
            {tender.title}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">{tender.category}</p>
        </div>
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
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

      {/* Description - Responsive text */}
      <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 sm:line-clamp-3">
        {tender.description}
      </p>

      {/* Details - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-cyan-400 font-medium truncate">
            {tender.budgetMin || tender.budgetMax
              ? `R${Number(tender.budgetMin || 0).toLocaleString()} - R${Number(
                  tender.budgetMax || 0
                ).toLocaleString()}`
              : `R${Number(tender.budget || 0).toLocaleString()}`}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
          <span className="text-white truncate">{formatDate(tender.deadline)}</span>
          <span
            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
              getDaysUntilDeadline(tender.deadline) <= 7
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {getDaysUntilDeadline(tender.deadline)}d left
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-400 truncate">
            Posted {formatDate(tender.createdAt, "MMM dd")}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-400">
            {tender.documents?.length || 0} documents
          </span>
        </div>
      </div>

      {/* Footer - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-cyan-400/10">
        <div className="text-xs sm:text-sm text-gray-400 truncate max-w-[200px]">
          By {tender.companyName}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onView(tender)}
            className="p-1.5 sm:p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
            aria-label="View tender details"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {isClosedOrArchived() ? (
            <div
              role="status"
              title="This tender is not accepting applications"
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border select-none text-xs sm:text-sm ${
                (tender.status || "").toLowerCase() === "archived"
                  ? "bg-gray-600/30 text-gray-200 border-gray-400/30"
                  : "bg-red-600/20 text-red-200 border-red-400/30"
              }`}
            >
              {(tender.status || "").toLowerCase() === "archived" ? (
                <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">
                {(tender.status || "").toLowerCase() === "archived"
                  ? "Archived"
                  : "Closed"}
              </span>
            </div>
          ) : isApplied ? (
            <div
              role="status"
              title="You have already applied"
              className="flex-1 sm:flex-initial text-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300 select-none text-xs sm:text-sm"
            >
              Applied
            </div>
          ) : (
            <button
              onClick={() => onApply(tender)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-xs sm:text-sm font-medium"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TenderCard;