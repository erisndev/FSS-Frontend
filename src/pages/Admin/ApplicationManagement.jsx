import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import {
  Users,
  Eye,
  Check,
  X,
  MessageCircle,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Mail,
  Search,
  Filter,
  Building,
  User,
  Phone,
  Award,
  Clock,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplicationModal from "../../components/UI/ApplicationModal";
import { tenderApi, applicationApi } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const ApplicationManagement = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tenderFilter, setTenderFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all tenders
      const tendersData = await tenderApi.getTenders();
      console.log("Fetched tenders:", tendersData);

      const tendersList = tendersData.tenders || [];
      setTenders(tendersList);

      // Fetch applications for each tender
      let allApplications = [];
      for (const tender of tendersList) {
        try {
          const tenderApplications = await applicationApi.getTenderApplications(
            tender._id || tender.id,
          );
          console.log(
            `Fetched applications for tender ${tender._id || tender.id}:`,
            tenderApplications,
          );

          const applicationsWithTenderInfo = tenderApplications.map((app) => ({
            ...app,
            tenderTitle: tender.title,
            tenderCategory: tender.category,
            issuerName: tender.companyName,
          }));

          allApplications.push(...applicationsWithTenderInfo);
        } catch (error) {
          console.error(
            `Error fetching applications for tender ${
              tender._id || tender.id
            }:`,
            error,
          );
        }
      }

      setApplications(allApplications);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status, comment = "") => {
    console.log("ApplicationManagement handleStatusUpdate called with:", {
      applicationId,
      status,
      comment,
    });
    try {
      const normalizedStatus = status
        .toLowerCase()
        .replace("accept", "accepted")
        .replace("reject", "rejected");
      console.log("Normalized status:", normalizedStatus);
      await applicationApi.updateApplicationStatus(
        applicationId,
        normalizedStatus,
        comment,
      );
      toast.success(`Application ${normalizedStatus} successfully`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update application status");
      console.error("Error updating application status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "accepted":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      case "rejected":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "withdrawn":
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, "MMM dd, yyyy");
  };

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.tenderTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || application.status === statusFilter;
    const matchesTender =
      tenderFilter === "" || application.tenderId === tenderFilter;
    return matchesSearch && matchesStatus && matchesTender;
  });

  if (showLoading) {
    return (
      <DashboardLayout
        title="Application Management"
        subtitle="Manage all system applications"
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Application Management"
      subtitle="Manage all system applications"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                placeholder="Search applications..."
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
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Tender Filter */}
            <div className="relative">
              <select
                value={tenderFilter}
                onChange={(e) => setTenderFilter(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-emerald-400/20 rounded-lg text-white focus:outline-none focus:border-emerald-400/50 focus:bg-slate-800/70 transition-all duration-300"
              >
                <option value="">All Tenders</option>
                {tenders.map((tender) => (
                  <option
                    key={tender._id || tender.id || index}
                    value={tender.id}
                  >
                    {tender.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-cyan-400/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Bidder
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Tender
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Proposed Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Applied
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-400/10">
                {filteredApplications.map((application, index) => (
                  <tr
                    key={application._id || application.id || index}
                    className="hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {application.companyName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {application.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {application.tenderTitle}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {application.tenderCategory}
                        </p>
                        <p className="text-gray-500 text-xs">
                          by {application.issuerName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">
                      R{application.bidAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                          application.status,
                        )}`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                          }}
                          className="p-2 bg-slate-800/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                          title="View Application Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No applications found
              </h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter || tenderFilter
                  ? "Try adjusting your search criteria."
                  : "No applications have been submitted yet."}
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        <ApplicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          user={user}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </DashboardLayout>
  );
};

export default ApplicationManagement;
