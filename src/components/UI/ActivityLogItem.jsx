import React, { useState } from "react";
import {
  FileText,
  Users,
  Settings,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
} from "lucide-react";

const ActivityLogItem = ({ activity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get icon based on action type
  const getActionIcon = () => {
    const action = activity.action?.toLowerCase() || "";
    if (action.includes("create") || action.includes("add")) {
      return <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    if (action.includes("update") || action.includes("edit")) {
      return <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    if (action.includes("delete") || action.includes("remove")) {
      return <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    if (action.includes("member") || action.includes("team")) {
      return <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    if (action.includes("tender")) {
      return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
    return <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
  };

  // Get color based on action type
  const getActionColor = () => {
    const action = activity.action?.toLowerCase() || "";
    if (action.includes("create") || action.includes("add")) {
      return "from-green-400 to-emerald-500";
    }
    if (action.includes("update") || action.includes("edit")) {
      return "from-blue-400 to-cyan-500";
    }
    if (action.includes("delete") || action.includes("remove")) {
      return "from-red-400 to-rose-500";
    }
    return "from-purple-400 to-pink-500";
  };

  // Get badge color based on target type
  const getBadgeColor = () => {
    switch (activity.targetType?.toLowerCase()) {
      case "tender":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "application":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "team_member":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "organization":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
    }
  };

  // Format action text
  const formatAction = (action) => {
    return (
      action?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown Action"
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const hasDetails =
    activity.details && Object.keys(activity.details).length > 0;

  return (
    <div className="bg-slate-800/50 border border-cyan-400/20 rounded-lg p-3 sm:p-4 hover:border-cyan-400/40 transition-all duration-200">
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Icon */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${getActionColor()} rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-lg`}
        >
          {getActionIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm sm:text-base font-medium break-words">
                {formatAction(activity.action)}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-none">
                    {activity.user?.name || "Unknown User"}
                  </span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Badge */}
            <span
              className={`px-2.5 py-1 ${getBadgeColor()} text-xs rounded-md border capitalize whitespace-nowrap self-start font-medium`}
            >
              {activity.targetType?.replace(/_/g, " ") || "Unknown"}
            </span>
          </div>

          {/* Details Toggle */}
          {hasDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 mt-2 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show Details</span>
                </>
              )}
            </button>
          )}

          {/* Expanded Details */}

          {isExpanded && hasDetails && (
            <div className="mt-3 overflow-hidden">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-cyan-400/10">
                <p className="text-gray-400 text-xs font-medium mb-2">
                  Activity Details
                </p>
                <div className="space-y-2">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2"
                    >
                      <span className="text-cyan-400 text-xs font-medium min-w-[100px] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="text-gray-300 text-xs break-words flex-1">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;
