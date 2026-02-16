import React from "react";
import { Appear } from "./Motion";
import {
  Clock,
  FileText,
  Eye,
  Trash2,
  Calendar,
  Building,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

const ApplicationCard = ({ application, index, onView, onWithdraw }) => {
  const getStatusConfig = (status) => {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return {
          text: "Pending",
          color: "text-amber-400 bg-amber-400/15 border-amber-400/20",
          bar: "from-amber-400 to-yellow-500",
        };
      case "ACCEPTED":
        return {
          text: "Accepted",
          color: "text-emerald-400 bg-emerald-400/15 border-emerald-400/20",
          bar: "from-emerald-400 to-green-500",
        };
      case "REJECTED":
        return {
          text: "Rejected",
          color: "text-red-400 bg-red-400/15 border-red-400/20",
          bar: "from-red-400 to-pink-500",
        };
      case "WITHDRAWN":
        return {
          text: "Withdrawn",
          color: "text-gray-400 bg-gray-400/15 border-gray-400/20",
          bar: "from-gray-400 to-gray-400",
        };
      default:
        return {
          text: status || "—",
          color: "text-gray-400 bg-gray-400/15 border-gray-400/20",
          bar: "from-gray-400 to-gray-400",
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return format(d, "MMM dd, yyyy");
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <Appear className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.07] hover:border-cyan-400/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col">
      {/* Status accent bar */}
      <div className={`h-[3px] bg-gradient-to-r ${statusConfig.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-white mb-1 line-clamp-2 leading-snug">
              {application.tender?.title || "Unknown Tender"}
            </h3>
            <p className="text-gray-400 text-xs">
              Applied {formatDate(application.createdAt)}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border flex-shrink-0 ${statusConfig.color}`}
          >
            {statusConfig.text}
          </span>
        </div>

        {/* Bid amount highlight */}
        <div className="bg-slate-800/40 border border-white/[0.04] rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                Bid Amount
              </p>
              <p className="text-base font-bold text-cyan-400">
                R{(application.bidAmount || 0).toLocaleString()}
              </p>
            </div>
            {application.timeframe && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                  Timeframe
                </p>
                <p className="text-sm font-medium text-white">
                  {application.timeframe}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <Building className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{application.companyName || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Updated {formatDate(application.updatedAt)}</span>
          </div>
          {(application.files?.length > 0 ||
            application.complianceDocuments?.length > 0) && (
            <div className="flex items-center gap-2 text-gray-400">
              <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>
                {application.files?.length ||
                  application.complianceDocuments?.length ||
                  0}{" "}
                document
                {(application.files?.length ||
                  application.complianceDocuments?.length ||
                  0) !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          )}
        </div>

        {/* Certifications */}
        {(application.bbeeLevel || application.cidbGrading) && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {application.bbeeLevel && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-400/15">
                B-BBEE Level {application.bbeeLevel}
              </span>
            )}
            {application.cidbGrading && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/15">
                CIDB {application.cidbGrading}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
          <button
            onClick={() => onView(application)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-white/[0.06] text-gray-300 rounded-xl hover:bg-white/[0.06] hover:border-cyan-400/20 hover:text-cyan-400 transition-all duration-200 text-xs font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
          {application.status === "pending" && onWithdraw && (
            <button
              onClick={() => onWithdraw(application)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-400/15 text-red-400 rounded-xl hover:bg-red-500/15 hover:border-red-400/25 transition-all duration-200 text-xs font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          )}
        </div>
      </div>
    </Appear>
  );
};

export default ApplicationCard;
