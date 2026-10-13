import React, { useState, useEffect, useMemo } from "react";
import { FileText, Search, Filter, RefreshCw, ChevronDown } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplicationCard from "../../components/UI/ApplicationCard";
import ApplicationModal from "../../components/UI/ApplicationModal";
import ConfirmDeleteModal from "../../components/UI/ConfirmDeleteModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import { applicationApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);

  // UI filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await applicationApi.getMyApplications();
      console.log("Fetched applications:", data);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    try {
      await applicationApi.withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully");
      fetchApplications(true);
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleWithdrawClick = (application) => {
    setAppToWithdraw(application);
    setShowWithdrawModal(true);
  };

  const filteredApplications = useMemo(() => {
    return (applications || []).filter((app) => {
      const tenderTitle = app?.tender?.title || "";
      const tenderCategory = app?.tender?.category || "";
      const status = (app?.status || "").toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        tenderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenderCategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const list = applications || [];
    const countBy = (s) =>
      list.filter((a) => (a?.status || "").toLowerCase() === s).length;

    return {
      total: list.length,
      pending: countBy("pending"),
      underReview: countBy("under_review"),
      accepted: countBy("accepted"),
      rejected: countBy("rejected"),
    };
  }, [applications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications(true);
  };

  if (showLoading) {
    return (
      <DashboardLayout
        title="My Applications"
        subtitle="Track your tender applications"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Applications"
      subtitle="Track your tender applications"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400 mt-1">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm">Under Review</p>
            <p className="text-xl sm:text-2xl font-bold text-cyan-400 mt-1">
              {stats.underReview}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm">Accepted</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">
              {stats.accepted}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm">Rejected</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
              {stats.rejected}
            </p>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
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

        {/* Filters */}
        <div
          className={`${
            showMobileFilters ? "block" : "hidden"
          } sm:block space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4`}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-cyan-400/50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 sm:p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 disabled:opacity-50"
              aria-label="Refresh applications"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to tenders to see them here."
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application._id || application.id || index}
                application={application}
                index={index}
                onView={handleViewApplication}
                onWithdraw={handleWithdrawClick}
              />
            ))}
          </div>
        )}

        <ApplicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          tender={selectedApplication?.tender}
          user={user}
        />

        <ConfirmDeleteModal
          isOpen={showWithdrawModal}
          onClose={() => {
            setShowWithdrawModal(false);
            setAppToWithdraw(null);
          }}
          onConfirm={() => {
            if (appToWithdraw)
              handleWithdrawApplication(appToWithdraw._id || appToWithdraw.id);
            setShowWithdrawModal(false);
            setAppToWithdraw(null);
          }}
          itemName={`your application for "${
            appToWithdraw?.tender?.title || "this tender"
          }"`}
          title="Withdraw Application"
          actionText="Withdraw"
          actionType="withdraw"
        />
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
