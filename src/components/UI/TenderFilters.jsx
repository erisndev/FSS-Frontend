import React from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

const TenderFilters = ({
  filters,
  showFilters,
  onFilterChange,
  onToggleFilters,
  onClearFilters,
  categories = [],
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.urgent ||
    filters.budget.min ||
    filters.budget.max ||
    filters.deadline;

  const activeCount = [
    filters.category,
    filters.urgent,
    filters.budget.min || filters.budget.max,
    filters.deadline,
  ].filter(Boolean).length;

  return (
    <div
      className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5"
    >
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tenders by title, category, or company…"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 focus:bg-slate-800/70 transition-all duration-200"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={onToggleFilters}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 ${
            showFilters || activeCount > 0
              ? "bg-cyan-500/15 border border-cyan-400/25 text-cyan-400"
              : "bg-slate-800/50 border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/10"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-cyan-500 text-white rounded-full">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Advanced Filters */}
      
        {showFilters && (
          <div
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/[0.04]">
              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={category + index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Budget Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budget.min}
                    onChange={(e) =>
                      onFilterChange("budget", {
                        ...filters.budget,
                        min: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budget.max}
                    onChange={(e) =>
                      onFilterChange("budget", {
                        ...filters.budget,
                        max: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Deadline Before
                </label>
                <input
                  type="date"
                  value={filters.deadline}
                  onChange={(e) => onFilterChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-200"
                />
              </div>

              {/* Urgent Only */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Options
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer px-3 py-2 bg-slate-800/50 border border-white/[0.06] rounded-xl hover:bg-slate-800/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.urgent}
                    onChange={(e) => onFilterChange("urgent", e.target.checked)}
                    className="w-4 h-4 text-cyan-400 bg-slate-800 border-white/10 rounded focus:ring-cyan-400/30 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Urgent only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
          <p className="text-xs text-gray-500">
            {activeCount > 0 && `${activeCount} filter${activeCount > 1 ? "s" : ""} active`}
          </p>
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors duration-200"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default TenderFilters;
