import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ConfirmDeleteModal from "../../components/UI/ConfirmDeleteModal";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import { tenderApi } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

const TenderManagement = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedTender, setSelectedTender] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState(null);

  const categories = [
    "Construction",
    "IT & Software",
    "Consulting",
    "Marketing",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Transportation",
    "Legal Services",
    "Financial Services",
    "Engineering",
    "Design",
  ];

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const { tenders = [] } = await tenderApi.getTenders();
      console.log("Fetched tenders:", tenders);
      setTenders(tenders);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      setTenders([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    try {
      await tenderApi.deleteTender(tenderId);
      toast.success("Tender deleted successfully");
      fetchTenders();
    } catch (error) {
      toast.error("Failed to delete tender");
      console.error("Error deleting tender:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  const getDaysUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      (tender.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (tender.companyName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || tender.status === statusFilter;
    const matchesCategory =
      categoryFilter === "" || tender.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout
        title="Tender Management"
        subtitle="Manage all system tenders"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Tender Management"
      subtitle="Manage all system tenders"
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

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-emerald-400/20 rounded-lg text-white focus:outline-none focus:border-emerald-400/50 focus:bg-slate-800/70 transition-all duration-300"
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={category + index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tenders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-cyan-400/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Tender
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Issuer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Applications
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400/10">
                {filteredTenders.map((tender, index) => (
                  <motion.tr
                    key={tender._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{tender.title}</p>
                        <p className="text-gray-400 text-sm">
                          {tender.category}
                        </p>
                        {tender.isUrgent && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full mt-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Urgent</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {tender.companyName}
                    </td>
                    <td className="px-6 py-4 text-cyan-400">
                      R{tender.budgetMin?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                          tender.status
                        )}`}
                      >
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">
                          {format(new Date(tender.deadline), "MMM dd, yyyy")}
                        </p>
                        <p
                          className={`text-xs ${
                            getDaysUntilDeadline(tender.deadline) <= 7
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {getDaysUntilDeadline(tender.deadline)} days left
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-400">
                      {tender.applications?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTender(tender);
                            setShowModal(true);
                          }}
                          className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-800/50 border border-purple-400/20 text-purple-400 rounded-lg hover:bg-purple-400/10 hover:border-purple-400/50 transition-all duration-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setTenderToDelete(tender);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 bg-slate-800/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenders.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tenders found
              </h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter || categoryFilter
                  ? "Try adjusting your search criteria."
                  : "No tenders have been created yet."}
              </p>
            </div>
          )}
        </motion.div>

        <ViewTenderModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTender(null);
          }}
          tender={selectedTender}
        />

        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setTenderToDelete(null);
          }}
          onConfirm={() => {
            if (tenderToDelete)
              handleDeleteTender(tenderToDelete._id || tenderToDelete.id);
            setTenderToDelete(null);
          }}
          itemName={tenderToDelete?.title}
        />
      </div>
    </DashboardLayout>
  );
};

export default TenderManagement;
