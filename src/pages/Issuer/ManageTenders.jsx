import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
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
import toast from "react-hot-toast";

const ManageTenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      toast.error("Failed to delete tender");
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

  if (loading) {
    return (
      <DashboardLayout
        title="Manage Tenders"
        subtitle="View and manage all your tenders"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0"
        >
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-800/50 border border-purple-400/20 rounded-lg text-white focus:outline-none focus:border-purple-400/50 focus:bg-slate-800/70 transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Tender</span>
          </button>
        </motion.div>

        {/* Tenders Grid */}
        {filteredTenders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
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
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTenders.map((tender, index) => (
              <motion.div
                key={`${tender.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                        tender.status
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
                    <DollarSign className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-medium">
                      R{tender.budgetMin?.toLocaleString()}
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
                      {tender.documents?.length || 0} documents
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-cyan-400/10">
                  <div className="text-sm text-gray-400">
                    Created {formatDate(tender.createdAt, "MMM dd")}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* View Tender */}
                    <button
                      onClick={() => {
                        setSelectedTender(tender);
                        setShowViewModal(true);
                      }}
                      className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Tender */}
                    <button
                      onClick={() =>
                        navigate(`/issuer/edit-tender/${tender._id}`)
                      }
                      className="p-2 bg-slate-800/50 border border-purple-400/20 text-purple-400 rounded-lg hover:bg-purple-400/10 hover:border-purple-400/50 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Tender */}
                    <button
                      onClick={() => {
                        setSelectedTender(tender);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 bg-slate-800/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
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

      <CreateTenderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchTenders();
          toast.success("Tender created successfully!");
        }}
      />
    </DashboardLayout>
  );
};

export default ManageTenders;
