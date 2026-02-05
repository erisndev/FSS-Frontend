import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
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

  const daysLeft = getDaysUntilDeadline(tender.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-5 hover:bg-slate-800/70 hover:border-cyan-400/40 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {tender.title}
          </h3>
          <p className="text-cyan-400 text-sm">{tender.category}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tender.isUrgent && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-400/30">
              <AlertCircle className="w-3 h-3" />
              <span>Urgent</span>
            </span>
          )}
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
              tender.status
            )}`}
          >
            {tender.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {tender.description}
      </p>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Budget */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">Budget</p>
            <p className="text-sm font-semibold text-cyan-400">
              {tender.budgetMin || tender.budgetMax
                ? `R${Number(tender.budgetMin || 0).toLocaleString()} - R${Number(
                    tender.budgetMax || 0
                  ).toLocaleString()}`
                : `R${Number(tender.budget || 0).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-0.5">Deadline</p>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">
                {formatDate(tender.deadline)}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  daysLeft <= 7
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {daysLeft}d left
              </span>
            </div>
          </div>
        </div>

        {/* Posted & Documents */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">
              Posted {formatDate(tender.createdAt, "MMM dd")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">
              {tender.documents?.length || 0} document{tender.documents?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-cyan-400/20">
        <div className="text-sm text-gray-400">
          By <span className="text-white font-medium">{tender.companyName}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onView(tender)}
            className="p-2 bg-slate-700/50 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all"
            aria-label="View tender details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {isClosedOrArchived() ? (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                (tender.status || "").toLowerCase() === "archived"
                  ? "bg-gray-600/30 text-gray-300"
                  : "bg-red-600/20 text-red-300"
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
                  : "Closed"}
              </span>
            </div>
          ) : isApplied ? (
            <div
              className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm font-medium"
            >
              ✓ Applied
            </div>
          ) : (
            <button
              onClick={() => onApply(tender)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all text-sm font-medium"
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
