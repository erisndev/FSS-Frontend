 import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  FileText,
  MessageCircle,
  Eye,
  Trash2,
  Calendar,
  Building,
} from "lucide-react";
import { format } from "date-fns";

const ApplicationCard = ({ application, index, onView, onWithdraw }) => {
  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "ACCEPTED":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "REJECTED":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "WITHDRAWN":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return format(d, "MMM dd, yyyy");
  };

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
            {application.tender?.title || "Unknown Tender"}
          </h3>
          <p className="text-gray-400 text-sm">
            Applied on {formatDate(application.createdAt)}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
            application.status
          )}`}
        >
          {application.status}
        </span>
      </div>

      {/* Application Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-medium">
            R{application.bidAmount?.toLocaleString()}
          </span>
          <span className="text-gray-400">proposed</span>
        </div>

        {application.timeframe && (
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-white">{application.timeframe}</span>
            <span className="text-gray-400">timeframe</span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm">
          <Building className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400">{application.companyName}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">
            Updated {formatDate(application.updatedAt)}
          </span>
        </div>

        {application.files && application.files.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400">
              {application.files.length} document
              {application.files.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
        <div className="text-sm text-gray-400">
          {application.bbeeLevel && `B-BBEE Level ${application.bbeeLevel}`}
          {application.cidbGrading && ` • CIDB ${application.cidbGrading}`}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(application)}
            className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
          </button>
          {application.status === "pending" && (
            <button
              onClick={() => onWithdraw(application)}
              className="p-2 bg-slate-800/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
