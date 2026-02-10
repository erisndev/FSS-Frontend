import React from "react";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Lock,
  Archive,
  Building,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

const TenderCard = ({ tender, index, onView, onApply, isApplied = false }) => {
  const getStatusConfig = (status) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return { text: "Active", color: "text-emerald-400 bg-emerald-400/15 border-emerald-400/25", bar: "from-emerald-400 to-green-500" };
      case "CLOSED":
        return { text: "Closed", color: "text-red-400 bg-red-400/15 border-red-400/25", bar: "from-red-400 to-pink-500" };
      case "ARCHIVED":
        return { text: "Archived", color: "text-blue-400 bg-blue-400/15 border-blue-400/25", bar: "from-blue-400 to-indigo-500" };
      case "CANCELLED":
        return { text: "Cancelled", color: "text-gray-400 bg-gray-400/15 border-gray-400/25", bar: "from-gray-400 to-gray-500" };
      default:
        return { text: status || "—", color: "text-gray-400 bg-gray-400/15 border-gray-400/25", bar: "from-gray-400 to-gray-500" };
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
    return Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  };

  const isClosedOrArchived = () => {
    const s = (tender.status || "").toLowerCase();
    return s === "closed" || s === "archived";
  };

  const daysLeft = getDaysUntilDeadline(tender.deadline);
  const statusConfig = getStatusConfig(tender.status);

  return (
    <div
      className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-cyan-400/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col"
    >
      {/* Status accent bar */}
      <div className={`h-[3px] bg-gradient-to-r ${statusConfig.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-2 leading-snug group-hover:text-cyan-50 transition-colors">
              {tender.title}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <Building className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{tender.companyName || tender.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {tender.isUrgent && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/15 text-red-400 text-[10px] font-semibold rounded-full border border-red-400/20">
                <AlertCircle className="w-2.5 h-2.5" />
                Urgent
              </span>
            )}
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">
          {tender.description}
        </p>

        {/* Budget highlight */}
        <div className="bg-slate-800/40 border border-white/[0.04] rounded-xl p-3 mb-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Budget</p>
          <p className="text-base font-bold text-cyan-400">
            {tender.budgetMin || tender.budgetMax
              ? `R${Number(tender.budgetMin || 0).toLocaleString()} – R${Number(tender.budgetMax || 0).toLocaleString()}`
              : `R${Number(tender.budget || 0).toLocaleString()}`}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatDate(tender.deadline)}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              daysLeft <= 0
                ? "bg-gray-500/15 text-gray-400"
                : daysLeft <= 7
                ? "bg-red-500/15 text-red-400"
                : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
          </span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tender.documents?.length || 0} docs</span>
          </div>
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
          <button
            onClick={() => onView(tender)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-white/[0.06] text-gray-300 rounded-xl hover:bg-white/[0.06] hover:border-cyan-400/20 hover:text-cyan-400 transition-all duration-200 text-xs font-medium"
            aria-label="View tender details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          <div className="flex-1">
            {isClosedOrArchived() ? (
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/10">
                {(tender.status || "").toLowerCase() === "archived" ? (
                  <Archive className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>{(tender.status || "").toLowerCase() === "archived" ? "Archived" : "Closed"}</span>
              </div>
            ) : isApplied ? (
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-400/15">
                <span>✓ Applied</span>
              </div>
            ) : (
              <button
                onClick={() => onApply(tender)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-xs font-semibold shadow-md shadow-purple-500/15 hover:shadow-lg hover:shadow-purple-500/25 group/btn"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderCard;
