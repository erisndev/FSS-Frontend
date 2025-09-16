import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown } from "lucide-react";

const TenderFilters = ({
  filters,
  showFilters,
  onFilterChange,
  onToggleFilters,
  onClearFilters,
  categories = []
}) => {
  const hasActiveFilters = filters.search || filters.category || filters.urgent || 
    filters.budget.min || filters.budget.max || filters.deadline;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
    >
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Search tenders..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          <ChevronDown
            className={`w-4 h-4 transform transition-transform duration-200 ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-cyan-400/10"
        >
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range</label>
            <div className="flex space-x-2">
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
                className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
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
                className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
            <input
              type="date"
              value={filters.deadline}
              onChange={(e) => onFilterChange("deadline", e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Urgent Only */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.urgent}
                onChange={(e) => onFilterChange("urgent", e.target.checked)}
                className="w-4 h-4 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
              />
              <span className="text-gray-300">Urgent only</span>
            </label>
          </div>
        </motion.div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-cyan-400/10">
          <button
            onClick={onClearFilters}
            className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
          >
            Clear all filters
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TenderFilters;