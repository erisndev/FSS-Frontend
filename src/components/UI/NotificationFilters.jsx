import React from "react";
import { motion } from "framer-motion";
import { Filter, AlertCircle, User, FileText, ClipboardList } from "lucide-react";

const NotificationFilters = ({
  filters,
  onFilterChange,
  notificationCounts,
}) => {
  const categoryOptions = [
    { value: "all", label: "All", icon: AlertCircle, color: "text-gray-400" },
    { value: "unread", label: "Unread", icon: AlertCircle, color: "text-cyan-400" },
    { value: "application", label: "Applications", icon: ClipboardList, color: "text-purple-400" },
    { value: "tender", label: "Tenders", icon: FileText, color: "text-emerald-400" },
    { value: "account", label: "Account", icon: User, color: "text-blue-400" },
  ];

  const renderOption = (option, isActive, count, onClick) => {
    const Icon = option.icon;
    return (
      <button
        key={option.value}
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
          isActive
            ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-400"
            : "bg-slate-800/30 border-gray-400/20 text-gray-300 hover:bg-slate-800/50 hover:border-gray-400/40"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : option.color}`} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{option.label}</span>
          {count > 0 && <span className="text-xs opacity-75">({count})</span>}
        </div>
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Filter Notifications</h3>
      </div>

      {/* Categories */}
      <div className="mb-3 text-sm text-gray-400">Category</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
        {categoryOptions.map((option) =>
          renderOption(
            option,
            (filters.category || "all") === option.value,
            notificationCounts?.[option.value] || 0,
            () => onFilterChange("category", option.value)
          )
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-cyan-400/10">
        <div className="text-sm text-gray-400">
          {notificationCounts?.unread > 0 && (
            <span>
              {notificationCounts.unread} unread notification
              {notificationCounts.unread !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {notificationCounts?.unread > 0 && (
          <button
            onClick={() => onFilterChange("markAllAsRead", true)}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm font-medium transition-all duration-300"
          >
            Mark All as Read
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationFilters;
