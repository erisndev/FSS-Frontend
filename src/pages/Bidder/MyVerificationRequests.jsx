import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Copy,
  ChevronRight,
  TrendingUp,
  Info,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import EmptyState from "../../components/UI/EmptyState";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import { verificationCodeApi, tenderApi } from "../../services/api";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const MyVerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTender, setSelectedTender] = useState(null);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchRequests();
    // Auto-refresh every 30 seconds for pending requests
    const interval = setInterval(() => {
      const hasPending = requests.some((r) => r.status === "pending");
      if (hasPending) {
        fetchRequests(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await verificationCodeApi.getMyRequests();
      console.log("Fetching verification requests:", data);

      // Sort by date, newest first
      const sortedData = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setRequests(sortedData);

      // Check for newly approved requests
      if (silent) {
        const newlyApproved = sortedData.filter(
          (req) =>
            req.status === "approved" &&
            !requests.find((r) => r._id === req._id && r.status === "approved"),
        );

        if (newlyApproved.length > 0) {
          toast.success(
            `${newlyApproved.length} request(s) approved! Check your email for the code.`,
            {
              duration: 5000,
              icon: "🎉",
            },
          );
        }
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      if (!silent) {
        toast.error("Failed to load verification requests");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
    toast.success("Refreshing requests...", {
      duration: 1000,
      icon: "🔄",
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!", {
      icon: "📋",
    });
  };

  const handleViewTender = async (tender) => {
    if (tender) {
      setSelectedTender(tender);
      setShowTenderModal(true);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || "pending").toLowerCase();
    switch (statusLower) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm rounded-full border border-yellow-400/30">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Pending</span>
            <span className="xs:hidden">...</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/20 text-green-400 text-xs sm:text-sm rounded-full border border-green-400/30">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Approved</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 text-red-400 text-xs sm:text-sm rounded-full border border-red-400/30">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Rejected</span>
          </span>
        );
      case "used":
        return (
          <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/20 text-blue-400 text-xs sm:text-sm rounded-full border border-blue-400/30">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Used</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-400/20 text-gray-400 text-xs sm:text-sm rounded-full border border-gray-400/30">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateMobile = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd");
    } catch {
      return "Invalid";
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tender?.category
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (request.status || "pending").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => (r.status || "pending").toLowerCase() === "pending",
    ).length,
    approved: requests.filter(
      (r) => (r.status || "").toLowerCase() === "approved",
    ).length,
    rejected: requests.filter(
      (r) => (r.status || "").toLowerCase() === "rejected",
    ).length,
  };

  const getStatusMessage = (request) => {
    const status = (request.status || "pending").toLowerCase();
    switch (status) {
      case "pending":
        return "Your request is being reviewed by the tender issuer. You'll be notified once approved.";
      case "approved":
        return request.code
          ? `Use this code to apply for the tender.`
          : "Check your email for the verification code.";
      case "rejected":
        return (
          request.rejectionReason ||
          "Your request was not approved. Please contact the tender issuer for more information."
        );
      case "used":
        return "You have successfully used this code to apply for the tender.";
      default:
        return "Status unknown";
    }
  };

  return (
    <DashboardLayout
      title="My Application Requests"
      subtitle="Track your tender verification code requests"
    >
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400 mt-0.5 sm:mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
          </div>
          {stats.pending > 0 && (
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
              Auto-refresh...
            </p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400 mt-0.5 sm:mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Rejected</p>
              <p className="text-xl sm:text-2xl font-bold text-red-400 mt-0.5 sm:mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white"
        >
          <span className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters & Search</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showMobileFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Filters and Actions - Responsive */}
      <div
        className={`${
          showMobileFilters ? "block" : "hidden"
        } space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 mb-4 sm:mb-6`}
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 sm:p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 disabled:opacity-50"
            aria-label="Refresh requests"
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Requests List - Responsive */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No verification requests found"
          description={
            searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "When you request verification codes for tenders, they will appear here"
          }
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredRequests.map((request, index) => (
            <div
              key={request._id}
              className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
            >
              {/* Main Content - Responsive */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 line-clamp-2">
                          {request.tender?.title || "Unknown Tender"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {request.tender?.category || "No category"}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {formatDate(request.createdAt)}
                            </span>
                            <span className="sm:hidden">
                              {formatDateMobile(request.createdAt)}
                            </span>
                          </span>
                          <span className="hidden xs:inline">•</span>
                          <span className="text-cyan-400 text-xs hidden xs:inline">
                            {getTimeAgo(request.createdAt)}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3 sm:mb-4">
                          {getStatusBadge(request.status)}
                        </div>

                        {/* Status Message - Responsive */}
                        <div
                          className={`p-3 sm:p-4 rounded-lg border ${
                            request.status === "approved"
                              ? "bg-green-500/10 border-green-400/20"
                              : request.status === "rejected"
                                ? "bg-red-500/10 border-red-400/20"
                                : "bg-yellow-500/10 border-yellow-400/20"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <Info
                              className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                                request.status === "approved"
                                  ? "text-green-400"
                                  : request.status === "rejected"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                              }`}
                            />
                            <div className="flex-1">
                              <p
                                className={`text-xs sm:text-sm ${
                                  request.status === "approved"
                                    ? "text-green-300"
                                    : request.status === "rejected"
                                      ? "text-red-300"
                                      : "text-yellow-300"
                                }`}
                              >
                                {getStatusMessage(request)}
                              </p>

                              {/* Show code if approved - Responsive */}
                              {request.status === "approved" &&
                                request.code && (
                                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-900/50 border border-cyan-400/30 rounded-lg">
                                    <p className="text-xs sm:text-sm text-gray-400 mb-2 text-center">
                                      Your Verification Code
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                                      <div className="text-center sm:text-left">
                                        <p className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 tracking-wider">
                                          **{request.code}**
                                        </p>
                                        <div className="w-full h-px bg-cyan-400/30 mt-2"></div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleCopyCode(request.code)
                                        }
                                        className="w-full sm:w-auto px-4 py-2 sm:p-3 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                                        title="Copy code"
                                      >
                                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="sm:hidden text-sm">
                                          Copy Code
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Details - Responsive Grid */}
                        <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-gray-400 mb-0.5 sm:mb-1">
                              Request ID
                            </p>
                            <p className="text-gray-300 font-mono truncate">
                              #{request._id?.slice(-8) || "N/A"}
                            </p>
                          </div>
                          {request.approvedAt && (
                            <div>
                              <p className="text-gray-400 mb-0.5 sm:mb-1">
                                Approved
                              </p>
                              <p className="text-gray-300 truncate">
                                <span className="hidden sm:inline">
                                  {formatDate(request.approvedAt)}
                                </span>
                                <span className="sm:hidden">
                                  {formatDateMobile(request.approvedAt)}
                                </span>
                              </p>
                            </div>
                          )}
                          {request.rejectedAt && (
                            <div>
                              <p className="text-gray-400 mb-0.5 sm:mb-1">
                                Rejected
                              </p>
                              <p className="text-gray-300 truncate">
                                <span className="hidden sm:inline">
                                  {formatDate(request.rejectedAt)}
                                </span>
                                <span className="sm:hidden">
                                  {formatDateMobile(request.rejectedAt)}
                                </span>
                              </p>
                            </div>
                          )}
                          {request.expiresAt && (
                            <div>
                              <p className="text-gray-400 mb-0.5 sm:mb-1">
                                Expires
                              </p>
                              <p className="text-gray-300 truncate">
                                <span className="hidden sm:inline">
                                  {formatDate(request.expiresAt)}
                                </span>
                                <span className="sm:hidden">
                                  {formatDateMobile(request.expiresAt)}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Mobile Responsive */}
                  <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                    <button
                      onClick={() => handleViewTender(request.tender)}
                      className="p-2 sm:p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                      title="View Tender"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Section for Tender Details - Responsive */}
              <button
                onClick={() =>
                  setExpandedRequest(
                    expandedRequest === request._id ? null : request._id,
                  )
                }
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800/30 border-t border-cyan-400/10 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-300"
              >
                <span className="text-xs sm:text-sm text-gray-400">
                  View Tender Details
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    expandedRequest === request._id ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Expanded Content - Responsive */}

              {expandedRequest === request._id && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-cyan-400/10">
                  <div className="pt-3 sm:pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-400 mb-0.5 sm:mb-1">Company</p>
                        <p className="text-gray-300 truncate">
                          {request.tender?.companyName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5 sm:mb-1">
                          Budget Range
                        </p>
                        <p className="text-cyan-400 truncate">
                          R{request.tender?.budgetMin?.toLocaleString() || 0} -
                          R{request.tender?.budgetMax?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5 sm:mb-1">Deadline</p>
                        <p className="text-gray-300">
                          {request.tender?.deadline
                            ? formatDateMobile(request.tender.deadline)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5 sm:mb-1">Status</p>
                        <p className="text-gray-300">
                          {request.tender?.status || "N/A"}
                        </p>
                      </div>
                    </div>
                    {request.tender?.description && (
                      <div>
                        <p className="text-gray-400 mb-0.5 sm:mb-1 text-xs sm:text-sm">
                          Description
                        </p>
                        <p className="text-gray-300 line-clamp-3 text-xs sm:text-sm">
                          {request.tender.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View Tender Modal */}
      <ViewTenderModal
        isOpen={showTenderModal}
        onClose={() => {
          setShowTenderModal(false);
          setSelectedTender(null);
        }}
        tender={selectedTender}
      />

      {/* Help Section - Responsive */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg sm:rounded-xl">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center space-x-2">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          <span>How Verification Works</span>
        </h3>
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-300">
          <p className="flex items-start">
            <span className="text-cyan-400 mr-2">1.</span>
            Request a verification code when you want to apply for a tender
          </p>
          <p className="flex items-start">
            <span className="text-cyan-400 mr-2">2.</span>
            The tender issuer will review and approve/reject your request
          </p>
          <p className="flex items-start">
            <span className="text-cyan-400 mr-2">3.</span>
            Once approved, you'll receive a code via email
          </p>
          <p className="flex items-start">
            <span className="text-cyan-400 mr-2">4.</span>
            Enter the code to unlock the application form for that tender
          </p>
          <p className="flex items-start">
            <span className="text-cyan-400 mr-2">5.</span>
            Track all your requests and their status on this page
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyVerificationRequests;
