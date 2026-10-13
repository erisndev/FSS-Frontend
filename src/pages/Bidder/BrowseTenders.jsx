import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import TenderFilters from "../../components/UI/TenderFilters";
import TenderCard from "../../components/UI/TenderCard";
import VerificationModal from "../../components/UI/VerificationModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import { tenderApi, applicationApi } from "../../services/api";
import toast from "react-hot-toast";
const BrowseTenders = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    urgent: false,
    budget: { min: "", max: "" },
    deadline: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [selectedTender, setSelectedTender] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [appliedTenderIds, setAppliedTenderIds] = useState(new Set());

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
  }, [filters]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const data = await tenderApi.getTenders(filters);
      setTenders(Array.isArray(data.tenders) ? data.tenders : []);
    } catch (error) {
      console.error("Error fetching tenders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const apps = await applicationApi.getMyApplications();
      const ids = (apps || [])
        .map((a) => a?.tender?._id || a?.tender?.id || a?.tenderId)
        .filter(Boolean);
      setAppliedTenderIds(new Set(ids));
    } catch (error) {
      console.error("Error fetching my applications:", error);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      urgent: false,
      budget: { min: "", max: "" },
      deadline: "",
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/20";
      case "CLOSED":
        return "text-red-400 bg-red-400/20";
      case "ARCHIVED":
        return "text-blue-400 bg-blue-400/20";
      case "CANCELLED":
        return "text-gray-400 bg-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const openViewModal = (tender) => {
    setSelectedTender(tender);
    setShowViewModal(true);
  };

  const openApplyModal = (tender) => {
    // Block apply if closed/archived
    const s = (tender?.status || "").toLowerCase();
    if (s === "closed" || s === "archived") {
      toast.error("This tender is not accepting applications.");
      return;
    }

    const tenderId = tender?._id || tender?.id;
    if (!tenderId) {
      toast.error("Invalid tender.");
      return;
    }

    // Prevent re-applying if already applied
    if (appliedTenderIds.has(tenderId)) {
      toast.success("You have already applied to this tender.");
      return;
    }

    setSelectedTender(tender);

    // Show verification modal first
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);

    const tenderId = selectedTender?._id || selectedTender?.id;
    if (!tenderId) {
      toast.error("Invalid tender.");
      return;
    }

    navigate(`/bidder/tenders/apply/${tenderId}`, { state: { tender: selectedTender } });
  };

  return (
    <DashboardLayout
      title="Browse Tenders"
      subtitle="Discover and apply to active tenders"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <TenderFilters
          filters={filters}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={clearFilters}
          categories={categories}
        />

        {/* Tenders Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tenders.map((tender, index) => (
              <TenderCard
                key={tender._id || tender.id || index}
                tender={tender}
                index={index}
                onView={openViewModal}
                onApply={openApplyModal}
                isApplied={appliedTenderIds.has(tender._id || tender.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && tenders.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No tenders found"
            description="Try adjusting your search criteria or filters."
          />
        )}
      </div>

      <ViewTenderModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        tender={selectedTender}
      />

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        tender={selectedTender}
        onVerified={handleVerificationSuccess}
      />

    </DashboardLayout>
  );
};

export default BrowseTenders;
