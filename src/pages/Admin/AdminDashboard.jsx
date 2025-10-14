import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  UserPlus,
  Eye,
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { userApi, tenderApi, applicationApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTenders: 0,
    activeTenders: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTenders, setRecentTenders] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const users = await userApi.getUsers();
      console.log("Users from API:", users);
      setRecentUsers(users.slice(0, 5));

      // Fetch all tenders
      const tenders = await tenderApi.getTenders();
      console.log("Tenders from API:", tenders);
      // Check if it's an array
      const tendersArray = Array.isArray(tenders)
        ? tenders
        : tenders.tenders || tenders.data || [];
      console.log("Processed tenders array:", tendersArray);

      setRecentTenders(tendersArray.slice(0, 5));

      // Fetch all applications
      const applications = await applicationApi.getAllApplications();
      console.log("Applications from API:", applications);
      const applicationsArray = Array.isArray(applications)
        ? applications
        : applications.data || [];
      setRecentApplications(applicationsArray.slice(0, 5));

      // Calculate stats
      const calculatedStats = {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.isActive).length,
        totalTenders: tendersArray.length,
        activeTenders: tendersArray.filter(
          (tender) => tender.status === "active"
        ).length,
        totalApplications: applicationsArray.length,
        pendingApplications: applicationsArray.filter(
          (app) => app.status === "PENDING" || app.status === "pending"
        ).length,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/20";
      case "issuer":
        return "text-purple-400 bg-purple-400/20";
      case "bidder":
        return "text-blue-400 bg-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
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
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Total Tenders",
      value: stats.totalTenders,
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconBg: "bg-purple-500/20",
    },
    {
      title: "Active Tenders",
      value: stats.activeTenders,
      icon: TrendingUp,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      iconBg: "bg-yellow-500/20",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: BarChart3,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      iconBg: "bg-indigo-500/20",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingApplications,
      icon: Clock,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10",
      iconBg: "bg-red-500/20",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        subtitle="System overview and management"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="System overview and management"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-gray-400 text-sm font-medium mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Users</h3>
              <button
                onClick={() => navigate("/admin/users")}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentUsers.map((user, index) => (
                <div
                  key={user.id || user._id || index}
                  className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.isActive ? "bg-green-400" : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Tenders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Recent Tenders
              </h3>
              <button
                onClick={() => navigate("/admin/tenders")}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentTenders.length > 0 ? (
                recentTenders.map((tender, index) => (
                  <div
                    key={tender.id || tender._id || index}
                    className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">
                          {tender.title || "Untitled Tender"}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {tender.category || "No Category"}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By {tender.companyName || "N/A"}</span>
                          <span>
                            R{tender.budgetMin?.toLocaleString() || "0"}
                          </span>
                          <span>
                            {tender.applications.length || 0} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            tender.status
                          )}`}
                        >
                          {tender.status || "UNKNOWN"}
                        </span>
                        {tender.isUrgent && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No tenders found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium">API Status</h4>
              <p className="text-green-400 text-sm">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium">Server Load</h4>
              <p className="text-cyan-400 text-sm">Normal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium">Security</h4>
              <p className="text-purple-400 text-sm">Secure</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium">Performance</h4>
              <p className="text-yellow-400 text-sm">Excellent</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
            >
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">Add User</span>
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
            >
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Manage Users</span>
            </button>
            <button
              onClick={() => navigate("/admin/tenders")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-lg hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300"
            >
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">View Tenders</span>
            </button>
            <button
              onClick={() => navigate("/admin/applications")}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5 text-orange-400" />
              <span className="text-white font-medium">View Applications</span>
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
