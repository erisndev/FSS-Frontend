import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import CreateTenderModal from "../../components/UI/CreateTenderModal";
import { tenderApi } from "../../services/api";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../../components/UI/ConfirmDeleteModal";
import EditTenderModal from "../../components/UI/EditTenderModal";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { canPerformTenderAction } from "../../utils/permissions";

const ManageTenders = () => {
  const { user, permissions } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTenderId, setEditTenderId] = useState(null);

  // Use permissions from user object if available, otherwise fallback to context permissions
  const userPermissions = user?.permissions || permissions;

  // Check if user can create tenders
  const canCreate =
    user?.role === "admin" ||
    !user?.organizationId ||
    userPermissions?.canCreateTenders;

  console.log("=== IssuerDashboard Permissions Debug ===");
  console.log("User:", user);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      console.log("Fetching tenders...");
      setLoading(true);
      const data = await tenderApi.getMyTenders();
      console.log("Fetched tenders:", data);
      setTenders(data);
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    try {
      await tenderApi.deleteTender(tenderId);
      toast.success("Tender deleted successfully");
      await fetchTenders();
    } catch (error) {
      if (error.response?.status !== 403) {
        toast.error("Failed to delete tender");
      }
      console.error("Error deleting tender:", error);
      throw error;
    }
  };

  // Fixed status color function: case-insensitive
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "closed":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "archived":
        return "text-blue-400 bg-blue-400/20 border-blue-400/30";
      case "cancelled":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const formatDate = (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, formatStr);
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 0;
    const diffTime = deadlineDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" ||
      tender.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (showLoading) {
    return (
      <DashboardLayout
        title="Manage Tenders"
        subtitle="View and manage all your tenders"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Manage Tenders"
      subtitle="View and manage all your tenders"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="space-y-4">
          {/* Search Bar - Full Width on Mobile */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
            />
          </div>

          {/* Filter and Create Button Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="relative flex-1 sm:max-w-xs">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-slate-800/50 border border-purple-400/20 rounded-lg text-white focus:outline-none focus:border-purple-400/50 focus:bg-slate-800/70 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Create Button - Only show if user has permission */}
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/20 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span>Create Tender</span>
              </button>
            )}
          </div>
        </div>

        {/* Tenders Grid */}
        {filteredTenders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || statusFilter
                ? "No tenders match your filters"
                : "No tenders created yet"}
            </h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter
                ? "Try adjusting your search criteria."
                : "Create your first tender to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenders.map((tender, index) => (
              <div
                key={`${tender.id}-${index}`}
                className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6 hover:bg-white/10 hover:border-cyan-400/40 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {tender.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{tender.category}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {tender.isUrgent && (
                      <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Urgent</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                        tender.status,
                      )}`}
                    >
                      {tender.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {tender.description}
                </p>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-cyan-400 font-medium">
                      {tender.budgetMin || tender.budgetMax
                        ? `R${Number(
                            tender.budgetMin || 0,
                          ).toLocaleString()} - R${Number(
                            tender.budgetMax || 0,
                          ).toLocaleString()}`
                        : `R${Number(tender.budget || 0).toLocaleString()}`}
                    </span>
                    <span className="text-gray-400">budget</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-white">
                      {formatDate(tender.deadline)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        getDaysUntilDeadline(tender.deadline) <= 7
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {getDaysUntilDeadline(tender.deadline)} days left
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">
                      {tender.applications.length || 0} applications
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">
                      {(() => {
                        // Count documents based on structure
                        if (Array.isArray(tender.documents)) {
                          return tender.documents.length;
                        } else if (
                          tender.documents &&
                          typeof tender.documents === "object"
                        ) {
                          // Count individual document fields
                          let count = 0;
                          if (tender.documents.bidFileDocuments) count++;
                          if (tender.documents.compiledDocuments) count++;
                          if (tender.documents.financialDocuments) count++;
                          if (tender.documents.technicalProposal) count++;
                          if (tender.documents.proofOfExperience) count++;
                          return count;
                        }
                        return 0;
                      })()}{" "}
                      documents
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
                  <div className="text-sm text-gray-400">
                    Created {formatDate(tender.createdAt, "MMM dd")}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* View Tender - Only show if user has permission */}
                    {canPerformTenderAction(
                      user,
                      userPermissions,
                      tender,
                      "view",
                    ) && (
                      <button
                        onClick={() => {
                          setSelectedTender(tender);
                          setShowViewModal(true);
                        }}
                        className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit Tender - Only show if user has permission */}
                    {canPerformTenderAction(
                      user,
                      userPermissions,
                      tender,
                      "edit",
                    ) && (
                      <button
                        onClick={() => {
                          setEditTenderId(tender._id);
                          setShowEditModal(true);
                        }}
                        className="p-2 bg-slate-800/50 border border-purple-400/20 text-purple-400 rounded-lg hover:bg-purple-400/10 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Tender - Only show if user has permission */}
                    {canPerformTenderAction(
                      user,
                      userPermissions,
                      tender,
                      "delete",
                    ) && (
                      <button
                        onClick={() => {
                          setSelectedTender(tender);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 bg-slate-800/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (selectedTender) {
            await handleDeleteTender(selectedTender._id);
          }
          setSelectedTender(null);
        }}
        itemName={selectedTender?.title}
      />

      <ViewTenderModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        tender={selectedTender}
      />

      <EditTenderModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditTenderId(null);
        }}
        tenderId={editTenderId}
        onSuccess={() => {
          fetchTenders();
        }}
      />

      {canCreate && (
        <CreateTenderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchTenders();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageTenders;
