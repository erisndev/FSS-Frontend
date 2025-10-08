import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ViewTenderModal from "../../components/UI/ViewTenderModal";
import TenderFilters from "../../components/UI/TenderFilters";
import TenderCard from "../../components/UI/TenderCard";
import ApplyModal from "../../components/UI/ApplyModal";
import VerificationModal from "../../components/UI/VerificationModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { tenderApi, applicationApi } from "../../services/api";
import toast from "react-hot-toast";

const BrowseTenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [applyForm, setApplyForm] = useState({
    companyName: "", // bidder's name or company name
    registrationNumber: "", // optional
    bbeeLevel: "", // optional
    cidbGrading: "", // optional
    contactPerson: "", // required
    email: "", // required
    phone: "", // required
    bidAmount: "", // required, was proposedAmount
    timeframe: "", // optional
    message: "", // required, was coverLetter
    files: [], // [{id, name, size, file}]
  });

  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
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
    setIsVerified(false);

    // Show verification modal first
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowVerificationModal(false);

    // Now open the apply modal
    const tenderId = selectedTender?._id || selectedTender?.id;

    // Try to restore draft
    const draftKey = `applyDraft:${tenderId}`;
    let restored = null;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) restored = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved apply draft", e);
    }

    if (restored) {
      setApplyForm({ ...restored, files: [] });
      toast.success("Draft restored from your last session.");
    } else {
      setApplyForm({
        companyName: "",
        registrationNumber: "",
        bbeeLevel: "",
        cidbGrading: "",
        contactPerson: "",
        email: "",
        phone: "",
        bidAmount: "",
        timeframe: "",
        message: "",
        files: [],
      });
    }

    setApplyError("");
    setShowApplyModal(true);
  };

  const handleApplyInputChange = (e) => {
    const { name, value } = e.target;
    setApplyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file,
    }));
    setApplyForm((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleRemoveApplyDocument = (id) => {
    setApplyForm((prev) => ({
      ...prev,
      files: prev.files.filter((doc) => doc.id !== id),
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedTender) return;

    try {
      setApplyLoading(true);
      setApplyError("");
      console.log("Applying to tender:", selectedTender);
      console.log("Application form data:", applyForm);

      const payload = {
        companyName: applyForm.companyName,
        registrationNumber: applyForm.registrationNumber || undefined,
        bbeeLevel: applyForm.bbeeLevel || undefined,
        cidbGrading: applyForm.cidbGrading || undefined,
        contactPerson: applyForm.contactPerson,
        email: applyForm.email,
        phone: applyForm.phone,
        bidAmount: Number(applyForm.bidAmount) || 0,
        timeframe: applyForm.timeframe || undefined,
        message: applyForm.message,
        files: applyForm.files.map((d) => d.file), // uploaded files
      };

      const tenderId = selectedTender._id || selectedTender.id;

      // Extra guard on submission
      const status = (selectedTender.status || "").toLowerCase();
      if (status === "closed" || status === "archived") {
        throw new Error("This tender is not accepting applications.");
      }

      await applicationApi.applyToTender(tenderId, payload);

      toast.success("Application submitted successfully!");
      setShowApplyModal(false);

      // Clear saved draft and mark as applied
      try {
        const draftKey = `applyDraft:${tenderId}`;
        localStorage.removeItem(draftKey);
      } catch {}
      setAppliedTenderIds((prev) => {
        const next = new Set(prev);
        next.add(tenderId);
        return next;
      });

      // Reset form
      setApplyForm({
        companyName: "",
        registrationNumber: "",
        bbeeLevel: "",
        cidbGrading: "",
        contactPerson: "",
        email: "",
        phone: "",
        bidAmount: "",
        timeframe: "",
        message: "",
        files: [],
      });
    } catch (err) {
      console.error("Error applying to tender:", err);
      setApplyError(
        err?.response?.data?.message || "Failed to submit application"
      );
      toast.error("Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  // Persist apply form draft per tender while modal is open (exclude files)
  useEffect(() => {
    if (!showApplyModal || !selectedTender) return;
    const tenderId = selectedTender._id || selectedTender.id;
    const draftKey = `applyDraft:${tenderId}`;
    const { files, ...rest } = applyForm || {};
    try {
      localStorage.setItem(draftKey, JSON.stringify(rest));
    } catch (e) {
      console.error("Failed to save apply draft", e);
    }
  }, [applyForm, showApplyModal, selectedTender]);

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
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        tender={selectedTender}
        formData={applyForm}
        onInputChange={handleApplyInputChange}
        onFileUpload={handleApplyFileUpload}
        onRemoveFile={handleRemoveApplyDocument}
        onSubmit={handleSubmitApplication}
        loading={applyLoading}
        error={applyError}
        formatFileSize={formatFileSize}
      />
    </DashboardLayout>
  );
};

export default BrowseTenders;
