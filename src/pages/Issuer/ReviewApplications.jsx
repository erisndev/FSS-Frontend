import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Eye,
  Check,
  X,
  Calendar,
  FileText,
  Mail,
  Phone,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Clock,
  DollarSign,
  Building,
  Inbox,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplicationModal from "../../components/UI/ApplicationModal";
import StatusChangeModal from "../../components/UI/StatusChangeModal";
import { tenderApi, applicationApi } from "../../services/api";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { canPerformApplicationAction } from "../../utils/permissions";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";

const ReviewApplications = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [appsLoading, setAppsLoading] = useState(false);
  const showAppsLoading = useMinLoadingTime(appsLoading);

  // Filters & sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showTenderDropdown, setShowTenderDropdown] = useState(false);

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    if (selectedTender) {
      fetchApplications(selectedTender._id || selectedTender.id);
    }
  }, [selectedTender]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const data = await tenderApi.getMyTenders();
      setTenders(data);

      const savedTenderId = localStorage.getItem("selectedTenderId");
      let tenderToSelect = null;

      if (savedTenderId && data.length > 0) {
        tenderToSelect = data.find((t) => (t._id || t.id) === savedTenderId);
      }
      if (!tenderToSelect && data.length > 0) {
        tenderToSelect = data[0];
      }
      if (tenderToSelect) {
        setSelectedTender(tenderToSelect);
        localStorage.setItem(
          "selectedTenderId",
          tenderToSelect._id || tenderToSelect.id,
        );
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (tenderId) => {
    try {
      setAppsLoading(true);
      const data = await applicationApi.getTenderApplications(tenderId);
      console.log("Fetched applications:", data);
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setAppsLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    const s = String(status || "").toLowerCase();
    if (["accept", "accepted", "approve", "approved"].includes(s))
      return "accepted";
    if (["reject", "rejected", "decline", "declined"].includes(s))
      return "rejected";
    if (["pending"].includes(s)) return "pending";
    if (["withdrawn"].includes(s)) return "withdrawn";
    return s;
  };

  const handleStatusUpdate = async (applicationId, status, comment = "") => {
    try {
      const normalized = normalizeStatus(status);
      await applicationApi.updateApplicationStatus(
        applicationId,
        normalized,
        comment,
      );
      toast.success("Application status changed successfully");
      fetchApplications(selectedTender._id || selectedTender.id);
      setShowStatusModal(false);
      setStatusAction("");
      setSelectedApplication(null);
    } catch (error) {
      toast.error("Failed to update application status");
      console.error("Error updating application status:", error);
    }
  };

  const openStatusModal = (application, action) => {
    setSelectedApplication(application);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  // Permissions
  const userPermissions = user?.permissions;
  const canViewApp = canPerformApplicationAction(
    user,
    userPermissions,
    selectedTender,
    "view",
  );
  const canAcceptRejectApp = canPerformApplicationAction(
    user,
    userPermissions,
    selectedTender,
    "accept",
  );
  const canChangeStatus = () => canAcceptRejectApp;

  // Stats
  const stats = useMemo(() => {
    const all = applications.length;
    const pending = applications.filter(
      (a) => normalizeStatus(a.status) === "pending",
    ).length;
    const accepted = applications.filter(
      (a) => normalizeStatus(a.status) === "accepted",
    ).length;
    const rejected = applications.filter(
      (a) => normalizeStatus(a.status) === "rejected",
    ).length;
    const withdrawn = applications.filter(
      (a) => normalizeStatus(a.status) === "withdrawn",
    ).length;
    return { all, pending, accepted, rejected, withdrawn };
  }, [applications]);

  // Filtered & sorted applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (a) => normalizeStatus(a.status) === statusFilter,
      );
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.companyName || "").toLowerCase().includes(term) ||
          (a.email || "").toLowerCase().includes(term) ||
          (a.contactPerson || "").toLowerCase().includes(term),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || b.appliedAt) -
            new Date(a.createdAt || a.appliedAt)
          );
        case "oldest":
          return (
            new Date(a.createdAt || a.appliedAt) -
            new Date(b.createdAt || b.appliedAt)
          );
        case "amount-high":
          return (b.bidAmount || 0) - (a.bidAmount || 0);
        case "amount-low":
          return (a.bidAmount || 0) - (b.bidAmount || 0);
        case "company":
          return (a.companyName || "").localeCompare(b.companyName || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, statusFilter, searchTerm, sortBy]);

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "accepted":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "rejected":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "withdrawn":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "accepted":
        return <CheckCircle className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const formatDate = (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, formatStr);
  };

  const formatRelative = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  };

  // Status filter chips config
  const statusChips = [
    {
      key: "all",
      label: "All",
      count: stats.all,
      color: "cyan",
    },
    {
      key: "pending",
      label: "Pending",
      count: stats.pending,
      color: "yellow",
    },
    {
      key: "accepted",
      label: "Accepted",
      count: stats.accepted,
      color: "green",
    },
    {
      key: "rejected",
      label: "Rejected",
      count: stats.rejected,
      color: "red",
    },
  ];

  if (stats.withdrawn > 0) {
    statusChips.push({
      key: "withdrawn",
      label: "Withdrawn",
      count: stats.withdrawn,
      color: "gray",
    });
  }

  const chipColors = {
    cyan: {
      active:
        "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-cyan-500/10",
      inactive:
        "bg-slate-800/40 border-slate-600/30 text-gray-400 hover:border-cyan-400/30 hover:text-cyan-400",
    },
    yellow: {
      active:
        "bg-yellow-500/20 border-yellow-400/50 text-yellow-300 shadow-yellow-500/10",
      inactive:
        "bg-slate-800/40 border-slate-600/30 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-400",
    },
    green: {
      active:
        "bg-green-500/20 border-green-400/50 text-green-300 shadow-green-500/10",
      inactive:
        "bg-slate-800/40 border-slate-600/30 text-gray-400 hover:border-green-400/30 hover:text-green-400",
    },
    red: {
      active: "bg-red-500/20 border-red-400/50 text-red-300 shadow-red-500/10",
      inactive:
        "bg-slate-800/40 border-slate-600/30 text-gray-400 hover:border-red-400/30 hover:text-red-400",
    },
    gray: {
      active:
        "bg-gray-400/20 border-gray-400/50 text-gray-300 shadow-gray-400/10",
      inactive:
        "bg-slate-800/40 border-slate-600/30 text-gray-400 hover:border-gray-400/30 hover:text-gray-300",
    },
  };

  // Loading state
  if (showLoading) {
    return (
      <DashboardLayout
        title="Review Applications"
        subtitle="Review and manage tender applications"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  // No tenders state
  if (tenders.length === 0) {
    return (
      <DashboardLayout
        title="Review Applications"
        subtitle="Review and manage tender applications"
      >
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-400/10">
            <Inbox className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No tenders yet
          </h3>
          <p className="text-gray-400 text-center max-w-md">
            Create your first tender to start receiving applications from
            bidders.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Review Applications"
      subtitle="Review and manage tender applications"
    >
      <div className="space-y-5">
        {/* ─── Tender Selector ─── */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-400/10">
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Tender:</span>
            </div>

            <div className="relative flex-1">
              <select
                value={selectedTender?._id || selectedTender?.id || ""}
                onChange={(e) => {
                  const tender = tenders.find(
                    (t) => (t._id || t.id) === e.target.value,
                  );
                  setSelectedTender(tender);
                  setSearchTerm("");
                  setStatusFilter("all");
                  if (tender) {
                    localStorage.setItem(
                      "selectedTenderId",
                      tender._id || tender.id,
                    );
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-cyan-400/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300 appearance-none cursor-pointer pr-10"
              >
                <option
                  value=""
                  disabled
                  className="bg-slate-800 text-gray-400"
                >
                  Choose a tender…
                </option>
                {tenders.map((tender, index) => (
                  <option
                    key={tender._id || tender.id || index}
                    value={tender._id || tender.id}
                    className="bg-slate-800 text-white"
                  >
                    {tender.title} — {tender.applications?.length || 0}{" "}
                    application
                    {(tender.applications?.length || 0) !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        {selectedTender && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total",
                value: stats.all,
                icon: Users,
                gradient: "from-cyan-500/20 to-blue-500/20",
                border: "border-cyan-400/20",
                text: "text-cyan-400",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                gradient: "from-yellow-500/20 to-amber-500/20",
                border: "border-yellow-400/20",
                text: "text-yellow-400",
              },
              {
                label: "Accepted",
                value: stats.accepted,
                icon: CheckCircle,
                gradient: "from-green-500/20 to-emerald-500/20",
                border: "border-green-400/20",
                text: "text-green-400",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                icon: XCircle,
                gradient: "from-red-500/20 to-pink-500/20",
                border: "border-red-400/20",
                text: "text-red-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border ${stat.border} rounded-xl p-3 sm:p-4`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {stat.label}
                  </span>
                  <stat.icon className={`w-4 h-4 ${stat.text}`} />
                </div>
                <p className={`text-xl sm:text-2xl font-bold ${stat.text}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Search, Filter Chips & Sort ─── */}
        {selectedTender && applications.length > 0 && (
          <div className="space-y-3">
            {/* Search + Sort row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search by company, email, or contact…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative sm:w-52">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-800/50 border border-purple-400/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="newest" className="bg-slate-800">
                    Newest first
                  </option>
                  <option value="oldest" className="bg-slate-800">
                    Oldest first
                  </option>
                  <option value="amount-high" className="bg-slate-800">
                    Highest bid
                  </option>
                  <option value="amount-low" className="bg-slate-800">
                    Lowest bid
                  </option>
                  <option value="company" className="bg-slate-800">
                    Company A–Z
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
              </div>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
              {statusChips.map((chip) => {
                const isActive = statusFilter === chip.key;
                const colors = chipColors[chip.color];
                return (
                  <button
                    key={chip.key}
                    onClick={() => setStatusFilter(chip.key)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${
                      isActive ? colors.active + " shadow-lg" : colors.inactive
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/10"
                          : "bg-slate-700/50 text-gray-400"
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Applications List ─── */}
        {selectedTender && (
          <div>
            {/* Loading applications */}
            {showAppsLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : applications.length === 0 ? (
              /* No applications */
              <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-400/10">
                    <Inbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    No applications yet
                  </h4>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Applications will appear here once bidders apply to "
                    <span className="text-cyan-400">
                      {selectedTender.title}
                    </span>
                    ".
                  </p>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              /* No results after filtering */
              <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center mb-4 border border-yellow-400/10">
                    <Search className="w-8 h-8 text-yellow-500/50" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    No matching applications
                  </h4>
                  <p className="text-gray-400 text-sm max-w-sm mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-200 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              /* Application cards */
              <div className="space-y-4">
                {/* Results count */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="text-gray-300 font-medium">
                      {filteredApplications.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-gray-300 font-medium">
                      {applications.length}
                    </span>{" "}
                    application{applications.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredApplications.map((application, index) => (
                    <div
                      key={application._id || application.id || index}
                      layout
                      className="group bg-white/5 backdrop-blur-xl border border-cyan-400/10 rounded-xl overflow-hidden hover:bg-white/[0.07] hover:border-cyan-400/25 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
                    >
                      {/* Card header with status accent */}
                      <div
                        className={`h-1 ${
                          normalizeStatus(application.status) === "pending"
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : normalizeStatus(application.status) === "accepted"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500"
                              : normalizeStatus(application.status) ===
                                  "rejected"
                                ? "bg-gradient-to-r from-red-400 to-pink-500"
                                : "bg-gradient-to-r from-gray-400 to-gray-400"
                        }`}
                      />

                      <div className="p-4 sm:p-5">
                        {/* Company + Status */}
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-400/10 flex-shrink-0">
                              <Building className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm text-white font-semibold truncate">
                                {application.companyName || "Unknown Company"}
                              </h4>
                              <p className="text-xs text-gray-400 truncate">
                                {application.contactPerson || application.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] rounded-full border font-semibold flex-shrink-0 ${getStatusColor(
                              application.status,
                            )}`}
                          >
                            {getStatusIcon(application.status)}
                            <span className="capitalize">
                              {normalizeStatus(application.status)}
                            </span>
                          </span>
                        </div>

                        {/* Bid amount highlight */}
                        <div className="bg-slate-800/40 rounded-lg p-3 mb-4">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                            Bid Amount
                          </p>
                          <p className="text-lg font-bold text-cyan-400">
                            R{(application.bidAmount || 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-xs">
                            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400 truncate">
                              {application.email}
                            </span>
                          </div>
                          {application.phone && (
                            <div className="flex items-center space-x-2 text-xs">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-400">
                                {application.phone}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400">
                              {formatRelative(
                                application.appliedAt || application.createdAt,
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-cyan-400/10">
                          {canViewApp && (
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowModal(true);
                              }}
                              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800/60 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/40 transition-all duration-200 text-xs font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}
                          {normalizeStatus(application.status) === "pending" &&
                            canChangeStatus() && (
                              <>
                                <button
                                  onClick={() =>
                                    openStatusModal(application, "Accept")
                                  }
                                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-green-500/10 border border-green-400/20 text-green-400 rounded-lg hover:bg-green-500/20 hover:border-green-400/40 transition-all duration-200 text-xs font-medium"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() =>
                                    openStatusModal(application, "Reject")
                                  }
                                  className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-500/10 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-200 text-xs font-medium"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modals via Portal ─── */}
      {showModal &&
        selectedApplication &&
        createPortal(
          <ApplicationModal
            key={selectedApplication._id || selectedApplication.id}
            isOpen={showModal}
            application={selectedApplication}
            tender={selectedTender}
            user={user}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => {
              setShowModal(false);
              setSelectedApplication(null);
            }}
          />,
          document.body,
        )}

      {showStatusModal &&
        selectedApplication &&
        createPortal(
          <StatusChangeModal
            application={selectedApplication}
            action={statusAction}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedApplication(null);
              setStatusAction("");
            }}
            onSubmit={(comment) =>
              handleStatusUpdate(
                selectedApplication._id || selectedApplication.id,
                statusAction,
                comment,
              )
            }
          />,
          document.body,
        )}
    </DashboardLayout>
  );
};

export default ReviewApplications;
