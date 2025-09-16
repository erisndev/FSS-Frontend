import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  DollarSign,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import ApplicationModal from "../../components/UI/ApplicationModal";
import { tenderApi, applicationApi } from "../../services/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const IssuerDashboard = () => {
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentTenders, setRecentTenders] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      console.log("Fetching dashboard data...");

      // Fetch issuer's tenders
      const tenders = await tenderApi.getMyTenders();
      console.log("Fetched tenders:", tenders);
      setRecentTenders(tenders.slice(0, 5));

      // Calculate tender stats
      const tenderStats = {
        totalTenders: tenders.length,
        activeTenders: tenders.filter((tender) => tender.status === "active")
          .length,
      };
      console.log("Tender Stats:", tenderStats);

      // Fetch applications for all tenders
      let allApplications = [];
      for (const tender of tenders) {
        try {
          const applications = await applicationApi.getTenderApplications(
            tender._id
          );

          console.log("Fetched applications ", applications);
          allApplications = [...allApplications, ...applications];
          console.log("All Applications so far:", allApplications);
        } catch (error) {
          console.error(
            `Error fetching applications for tender ${tender.id}:`,
            error
          );
        }
      }

      setRecentApplications(allApplications.slice(0, 5));

      const applicationStats = {
        totalApplications: allApplications.length,
        pendingApplications: allApplications.filter(
          (app) => app.status === "pending"
        ).length,
      };

      setStats({ ...tenderStats, ...applicationStats });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/20";
      case "closed":
        return "text-red-400 bg-red-400/20";
      case "cancelled":
        return "text-gray-400 bg-gray-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "accepted":
        return "text-green-400 bg-green-400/20";
      case "rejected":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, "MMM dd");
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

  const statCards = [
    {
      title: "Total Tenders",
      value: stats.totalTenders,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Tenders",
      value: stats.activeTenders,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingApplications,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Issuer Dashboard"
        subtitle="Manage your tenders and applications"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Issuer Dashboard"
      subtitle="Manage your tenders and applications"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={`${stat.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
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
                My Recent Tenders
              </h3>
              <button
                onClick={() => navigate("/issuer/tenders")}
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
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        tender.status
                      )}`}
                    >
                      {tender.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {tender.applicationsCount || 0} applications
                      </span>
                      <button
                        onClick={() => handleViewTender(tender)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-400/10 transition-all duration-200"
                        title="View Tender Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
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
                Recent Applications
              </h3>
              <button
                onClick={() => navigate("/issuer/applications")}
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
                        {application.companyName}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {application.tenderTitle}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-cyan-400 text-sm">
                          <DollarSign className="w-4 h-4 inline mr-1" />R
                          {application.bidAmount?.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {formatDate(
                            application.appliedAt || application.createdAt
                          )}
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
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-cyan-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-400/10 transition-all duration-200"
                        title="View Application Details"
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
              onClick={() => navigate("/issuer/create-tender")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
            >
              <Plus className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Create New Tender</span>
            </button>
            <button
              onClick={() => navigate("/issuer/tenders")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Manage Tenders</span>
            </button>
            <button
              onClick={() => navigate("/issuer/applications")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-lg hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">
                Review Applications
              </span>
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
      />
    </DashboardLayout>
  );
};

export default IssuerDashboard;
