import React from "react";
import { Appear } from "./Motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

const NotificationCard = ({ notification, index, onView, onMarkAsRead, onDelete }) => {
  const getCategory = () => {
    const t = (notification.category || notification.type || '').toString().toLowerCase();
    if (["system", "user", "tender", "application"].includes(t)) return t;
    return t || "general";
  };

  const getNotificationIcon = () => {
    const cat = getCategory();
    const status = (notification.newStatus || notification.status || '').toLowerCase();
    if (cat === "application") {
      switch (status) {
        case "approved":
          return <CheckCircle className="w-5 h-5 text-green-400" />;
        case "rejected":
          return <XCircle className="w-5 h-5 text-red-400" />;
        case "pending":
          return <Clock className="w-5 h-5 text-yellow-400" />;
        default:
          return <AlertCircle className="w-5 h-5 text-cyan-400" />;
      }
    }
    if (cat === "tender") return <FileText className="w-5 h-5 text-cyan-400" />;
    return <AlertCircle className="w-5 h-5 text-cyan-400" />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "rejected":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      default:
        return "text-cyan-400 bg-cyan-400/20 border-cyan-400/30";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return format(d, "MMM dd, yyyy 'at' HH:mm");
  };

  const getHeaderTitle = () => {
    if (notification.title) return notification.title;
    const cat = getCategory();
    const status = (notification.newStatus || notification.status || '').toLowerCase();
    if (cat === "application") {
      if (status === "approved") return "Application approved";
      if (status === "rejected") return "Application rejected";
      if (status === "pending") return "Application under review";
      return "Application Update";
    }
    if (cat === "tender") return "Tender Update";
    if (cat === "user" || cat === "system") return "Account Update";
    return "Notification";
  };

  const getFallbackMessage = () => {
    const cat = getCategory();
    if (notification.message) return notification.message;
    if (cat === "application") {
      const tenderTitle = notification.tender?.title || notification.tenderTitle || "the tender";
      const status = notification.newStatus || notification.status || "updated";
      return `Your application for "${tenderTitle}" status has been updated to ${status}.`;
    }
    return "";
  };

  return (
    <Appear
      className={`bg-white/5 backdrop-blur-xl border rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${
        notification.isRead 
          ? "border-gray-400/20 hover:border-gray-400/40" 
          : "border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-400/5"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">
            {getNotificationIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {getHeaderTitle()}
              </h3>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              )}
            </div>
            {!notification.message && getFallbackMessage() && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {getFallbackMessage()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {(notification.newStatus || notification.status) && (
            <span
              className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                notification.newStatus || notification.status
              )}`}
            >
              {notification.newStatus || notification.status}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {(notification.tender?.title || notification.tenderTitle) && getCategory() !== 'system' && getCategory() !== 'user' && (
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">
              {notification.tender?.title || notification.tenderTitle}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">
            {formatDate(notification.createdAt)}
          </span>
        </div>

        {notification.message && (
          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
            <p className="text-gray-300 text-sm">{notification.message}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
        <div className="text-sm text-gray-400">
          {getCategory() === 'application' && (notification.applicationId || notification.application?._id) ? (
            <>Application ID: {notification.applicationId || notification.application?._id}</>
          ) : null}
        </div>
        <div className="flex items-center space-x-2">
          {notification.application && (
            <button
              onClick={() => onView(notification)}
              className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
              title="View Application"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification)}
              className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-xs font-medium transition-all duration-300"
            >
              Mark as Read
            </button>
          )}
          
          <button
            onClick={() => onDelete(notification)}
            className="p-2 bg-slate-800/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
            title="Delete Notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Appear>
  );
};

export default NotificationCard;