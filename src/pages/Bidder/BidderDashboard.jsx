import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  ArrowRight,
  DollarSign,
  Calendar,
  Building,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import ApplicationModal from "../../components/UI/ApplicationModal";
import { tenderApi, applicationApi } from "../../services/api";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

const BidderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [recentTenders, setRecentTenders] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);

  // Modal states
  const [selectedTender, setSelectedTender] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch applications to calculate stats
      const applications = await applicationApi.getMyApplications();
      console.log("Fetched applications for dashboard:", applications);
      setRecentApplications(applications.slice(0, 5));

      // Calculate stats
      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(
          (app) => app.status === "pending",
        ).length,
        acceptedApplications: applications.filter(
          (app) => app.status === "accepted",
        ).length,
        rejectedApplications: applications.filter(
          (app) => app.status === "rejected",
        ).length,
      };
      setStats(stats);

      // Fetch recent tenders
      const response = await tenderApi.getTenders({ limit: 6 });
      setRecentTenders(response?.tenders || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/20";
      case "ACCEPTED":
        return "text-green-400 bg-green-400/20";
      case "REJECTED":
        return "text-red-400 bg-red-400/20";
      case "WITHDRAWN":
        return "text-gray-400 bg-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };
  const getTenderStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "closed":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "cancelled":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };
  const formatDate = (date) => {
    if (!date) return "-"; // fallback if null/undefined
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-"; // fallback if invalid date
    return format(d, "MMM dd, yyyy");
  };

  // Handler functions
  const handleViewTender = (tender) => {
    setSelectedTender(tender);
    setShowTenderModal(true);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleViewAllTenders = () => {
    navigate("/bidder/tenders");
  };

  const handleViewAllApplications = () => {
    navigate("/bidder/applications");
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "browse":
        navigate("/bidder/tenders");
        break;
      case "applications":
        navigate("/bidder/applications");
        break;
      case "analytics":
        // Navigate to analytics page when available
        break;
      default:
        break;
    }
  };

  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      iconBg: "bg-yellow-500/20",
    },
    {
      title: "Accepted Applications",
      value: stats.acceptedApplications,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Rejected Applications",
      value: stats.rejectedApplications,
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10",
      iconBg: "bg-red-500/20",
    },
  ];

  if (showLoading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your tender activities."
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Bidder Dashboard"
      subtitle="Welcome back! Here's an overview of your tender activities."
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.07] hover:border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tenders */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">
                Recent Tenders
              </h3>
              <button
                onClick={handleViewAllTenders}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentTenders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tenders available</p>
                </div>
              ) : (
                recentTenders.map((tender) => (
                  <div
                    key={tender._id}
                    className="group bg-slate-800/50 border border-cyan-400/10 rounded-xl overflow-hidden hover:bg-slate-800/70 hover:border-cyan-400/20 transition-all duration-300"
                  >
                    {/* Status accent bar */}
                    <div
                      className={`h-0.5 ${
                        tender.status?.toLowerCase() === "active"
                          ? "bg-gradient-to-r from-green-400 to-emerald-500"
                          : tender.status?.toLowerCase() === "closed"
                            ? "bg-gradient-to-r from-red-400 to-pink-500"
                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm truncate">
                            {tender.title}
                          </h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {tender.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {tender.isUrgent && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full font-medium">
                              Urgent
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded-full border font-medium ${getTenderStatusColor(
                              tender.status,
                            )}`}
                          >
                            {tender.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-cyan-400 text-sm font-semibold">
                          R{(tender.budgetMin || 0).toLocaleString()}
                          {tender.budgetMax
                            ? ` – R${tender.budgetMax.toLocaleString()}`
                            : ""}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tender.deadline)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-cyan-400/5">
                        <button
                          onClick={() => handleViewTender(tender)}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-700/50 border border-cyan-400/15 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/30 transition-all duration-200 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => navigate("/bidder/tenders")}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/20 text-white rounded-lg hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-200 text-xs font-medium"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Go to Tender</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">
                My Applications
              </h3>
              <button
                onClick={handleViewAllApplications}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No applications yet</p>
                </div>
              ) : (
                recentApplications.map((application) => (
                  <div
                    key={application._id}
                    className="group bg-slate-800/50 border border-cyan-400/10 rounded-xl overflow-hidden hover:bg-slate-800/70 hover:border-cyan-400/20 transition-all duration-300"
                  >
                    {/* Status accent bar */}
                    <div
                      className={`h-0.5 ${
                        (application.status || "").toLowerCase() === "pending"
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                          : (application.status || "").toLowerCase() ===
                              "accepted"
                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                            : (application.status || "").toLowerCase() ===
                                "rejected"
                              ? "bg-gradient-to-r from-red-400 to-pink-500"
                              : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm truncate">
                            {application.tender?.title || "Untitled Tender"}
                          </h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Applied {formatDate(application.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-full font-semibold flex-shrink-0 ${getStatusColor(
                            application.status,
                          )}`}
                        >
                          {application.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-cyan-400 text-sm font-semibold">
                          R{(application.bidAmount || 0).toLocaleString()}
                        </span>
                        {application.companyName && (
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {application.companyName}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-cyan-400/5">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-700/50 border border-cyan-400/15 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/30 transition-all duration-200 text-xs font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Application</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-5">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickAction("browse")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Browse Tenders</span>
            </button>
            <button
              onClick={() => handleQuickAction("applications")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">My Applications</span>
            </button>
            <button
              onClick={() => handleQuickAction("analytics")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-lg hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewTenderModal
        isOpen={showTenderModal}
        onClose={() => {
          setShowTenderModal(false);
          setSelectedTender(null);
        }}
        tender={selectedTender}
      />

      <ApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        user={user}
      />
    </DashboardLayout>
  );
};

export default BidderDashboard;
