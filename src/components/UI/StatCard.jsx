import React from "react";

const StatCard = ({ label, value, icon: Icon, color, index = 0 }) => {
  return (
    <div
      className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.07] hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
            {label}
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
