import React, { useState, useEffect } from "react";
import {
  Shield,
  Check,
  X,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import EmptyState from "../../components/UI/EmptyState";
import ConfirmActionModal from "../../components/UI/ConfirmActionModal";
import RejectionReasonModal from "../../components/UI/RejectionReasonModal";
import { verificationCodeApi } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await verificationCodeApi.getAllRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessingId(selectedRequest._id);
      await verificationCodeApi.approveRequest(selectedRequest._id);
      toast.success("Request approved successfully");

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: "approved", approvedAt: new Date() }
            : req
        )
      );
      
      setShowApproveModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmReject = async (reason) => {
    if (!selectedRequest) return;
    
    try {
      setProcessingId(selectedRequest._id);
      await verificationCodeApi.rejectRequest(selectedRequest._id, reason);
      toast.success("Request rejected");

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, status: "rejected", rejectedAt: new Date() }
            : req
        )
      );
      
      setShowRejectModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || "pending").toLowerCase();
    switch (statusLower) {
      case "pending":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
            <AlertCircle className="w-3 h-3" />
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

  // Filter requests based on search and status
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.bidder?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.bidder?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.bidder?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedBy?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (request.status || "pending").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => (r.status || "pending").toLowerCase() === "pending"
    ).length,
    approved: requests.filter(
      (r) => (r.status || "").toLowerCase() === "approved"
    ).length,
    rejected: requests.filter(
      (r) => (r.status || "").toLowerCase() === "rejected"
    ).length,
  };

  return (
    <DashboardLayout
      title="Application Requests"
      subtitle="Manage tender verification code requests"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {stats.rejected}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bidder name, email, or tender title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No verification requests found"
          description={
            searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Verification requests will appear here when bidders request access to tenders"
          }
        />
      ) : (
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-400/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Bidder
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400/10">
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {request.bidder?.name || "Unknown"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {request.bidder?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-white">
                            {request.tender?.title || "Unknown Tender"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {request.tender?.category || "No category"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {formatDate(request.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      {(request.status || "pending").toLowerCase() ===
                      "pending" ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveClick(request)}
                            disabled={processingId === request._id}
                            className="p-2 bg-green-500/20 border border-green-400/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            disabled={processingId === request._id}
                            className="p-2 bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {(request.status || "").toLowerCase() === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmActionModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={confirmApprove}
        title="Approve Verification Request"
        message={`Are you sure you want to approve the verification request from ${selectedRequest?.bidder?.name || "this bidder"} for "${selectedRequest?.tender?.title || "this tender"}"? This will grant them access to apply for the tender.`}
        actionType="approve"
        isLoading={processingId === selectedRequest?._id}
      />

      <RejectionReasonModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={confirmReject}
        isLoading={processingId === selectedRequest?._id}
      />
    </DashboardLayout>
  );
};

export default VerificationRequests;
