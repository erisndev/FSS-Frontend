import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplicationModal from "../../components/UI/ApplicationModal";
import StatusChangeModal from "../../components/UI/StatusChangeModal";
import { tenderApi, applicationApi } from "../../services/api";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const ReviewApplications = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenders();
  }, []);

  useEffect(() => {
    if (selectedTender) {
      fetchApplications(selectedTender._id);
    }
  }, [selectedTender]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const data = await tenderApi.getMyTenders();
      setTenders(data);

      // Try to restore previously selected tender from localStorage
      const savedTenderId = localStorage.getItem("selectedTenderId");
      let tenderToSelect = null;

      if (savedTenderId && data.length > 0) {
        // Find the saved tender in the fetched data
        tenderToSelect = data.find((t) => (t._id || t.id) === savedTenderId);
      }

      // If no saved tender found or saved tender doesn't exist, use first tender
      if (!tenderToSelect && data.length > 0) {
        tenderToSelect = data[0];
      }

      if (tenderToSelect) {
        setSelectedTender(tenderToSelect);
        // Save the selected tender ID to localStorage
        localStorage.setItem(
          "selectedTenderId",
          tenderToSelect._id || tenderToSelect.id
        );
      }
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (tenderId) => {
    try {
      const data = await applicationApi.getTenderApplications(tenderId);
      console.log("Fetched applications:", data);
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const normalizeStatus = (status) => {
    const s = String(status || "").toLowerCase();
    if (["accept", "Accept", "accepted", "approve", "approved"].includes(s))
      return "accepted";
    if (["reject", "Reject", "rejected", "decline", "declined"].includes(s))
      return "rejected";
    if (["pending"].includes(s)) return "pending";
    return s;
  };

  const handleStatusUpdate = async (applicationId, status, comment = "") => {
    try {
      const normalized = normalizeStatus(status);
      console.log(
        "Updating application status to:",
        normalized,
        "with comment:",
        comment
      );
      await applicationApi.updateApplicationStatus(
        applicationId,
        normalized,
        comment
      );
      toast.success(`Application status changed successfully`);
      fetchApplications(selectedTender._id || selectedTender.id);
      setShowStatusModal(false);
      setStatusAction("");
      setSelectedApplication(null);
    } catch (error) {
      toast.error("Failed to update application status");
      console.error("Error updating application status:", error);
    }
  };

  const openStatusModal = (application, action) => {
    setSelectedApplication(application);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const openConfirmModal = (application, action) => {
    setSelectedApplication(application);
    setStatusAction(action);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = () => {
    setShowConfirmModal(false);
    setShowStatusModal(true);
  };

  const canChangeStatus = (application) => {
    // Check if user is admin or tender creator
    return (
      user?.role === "admin" ||
      selectedTender?.createdBy === user?.id ||
      selectedTender?.userId === user?.id
    );
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

  const formatDate = (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return format(d, formatStr);
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Review Applications"
        subtitle="Review and manage tender applications"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Review Applications"
      subtitle="Review and manage tender applications"
    >
      <div className="space-y-6">
        {/* Tender Selection */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Select Tender</h3>
            {selectedTender && (
              <span className="text-cyan-400 text-sm">
                {applications.length} applications
              </span>
            )}
          </div>

          <div className="max-w-md">
            <select
              value={selectedTender?._id || selectedTender?.id || ""}
              onChange={(e) => {
                const tender = tenders.find(
                  (t) => (t._id || t.id) === e.target.value
                );
                setSelectedTender(tender);
                // Save selected tender to localStorage
                if (tender) {
                  localStorage.setItem(
                    "selectedTenderId",
                    tender._id || tender.id
                  );
                }
              }}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
            >
              <option value="" disabled className="bg-slate-800 text-gray-400">
                Choose a tender to review applications...
              </option>
              {tenders.map((tender, index) => (
                <option
                  key={tender.id || tender._id || index}
                  value={tender._id || tender.id}
                  className="bg-slate-800 text-white"
                >
                  {tender.title} ({tender.applications.length || 0}{" "}
                  applications)
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Applications List */}
        {selectedTender && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Applications for "{selectedTender.title}"
              </h3>
              <span className="text-cyan-400">
                {applications.length} applications
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No applications yet
                </h4>
                <p className="text-gray-400">
                  Applications will appear here once bidders apply to this
                  tender.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application, index) => (
                  <motion.div
                    key={application.id || application._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-white font-medium">
                            {application.companyName}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>{application.email}</span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400">
                              R{application.bidAmount?.toLocaleString()}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(
                                application.appliedAt || application.createdAt
                              )}
                            </span>
                          </span>
                          {application.files &&
                            application.files.length > 0 && (
                              <span className="flex items-center space-x-1">
                                <FileText className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">
                                  {application.files.length} docs
                                </span>
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                          }}
                          className="p-2 bg-slate-700/50 border border-cyan-400/20 text-cyan-400 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {application.status === "pending" &&
                          canChangeStatus(application) && (
                            <>
                              <button
                                onClick={() =>
                                  openStatusModal(application, "Reject")
                                }
                                className="p-2 bg-slate-700/50 border border-red-400/20 text-red-400 rounded-lg hover:bg-red-400/10 hover:border-red-400/50 transition-all duration-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  openStatusModal(application, "Accept")
                                }
                                className="p-2 bg-slate-700/50 border border-green-400/20 text-green-400 rounded-lg hover:bg-green-400/10 hover:border-green-400/50 transition-all duration-300"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Modals */}
        {showModal && selectedApplication && (
          <ApplicationModal
            key={selectedApplication._id || selectedApplication.id}
            isOpen={showModal}
            application={selectedApplication}
            tender={selectedTender}
            user={user}
            onStatusUpdate={handleStatusUpdate}
            onClose={() => {
              setShowModal(false);
              setSelectedApplication(null);
            }}
          />
        )}

        {showStatusModal && selectedApplication && (
          <StatusChangeModal
            application={selectedApplication}
            action={statusAction}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedApplication(null);
              setStatusAction("");
            }}
            onSubmit={(comment) =>
              handleStatusUpdate(
                selectedApplication._id || selectedApplication.id,
                statusAction,
                comment
              )
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewApplications;
