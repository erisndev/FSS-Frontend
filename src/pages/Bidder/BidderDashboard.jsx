import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  DollarSign,
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
          (app) => app.status === "pending"
        ).length,
        acceptedApplications: applications.filter(
          (app) => app.status === "accepted"
        ).length,
        rejectedApplications: applications.filter(
          (app) => app.status === "rejected"
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

  if (loading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your tender activities."
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
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
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tenders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Recent Tenders
              </h3>
              <button 
                onClick={handleViewAllTenders}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentTenders.map((tender) => (
                <div
                  key={tender._id}
                  className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{tender.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {tender.category}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-cyan-400 text-sm">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          R{tender.budgetMin?.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          Due: {formatDate(tender.deadline)}
                        </span>
                      </div>
                    </div>
                    {tender.isUrgent && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTenderStatusColor(
                        tender.status
                      )}`}
                    >
                      {tender.status}
                    </span>
                    <button 
                      onClick={() => handleViewTender(tender)}
                      className="text-cyan-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-400/10 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                My Applications
              </h3>
              <button 
                onClick={handleViewAllApplications}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application._id}
                  className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">
                        {application.tender?.title || "Untitled Tender"}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Applied on {formatDate(application.createdAt)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-cyan-400 text-sm">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          R{application.bidAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      {application.comment && (
                        <span className="text-xs text-gray-400">
                          {application.comment}
                        </span>
                      )}
                      <button 
                        onClick={() => handleViewApplication(application)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-400/10 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
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
        </motion.div>
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