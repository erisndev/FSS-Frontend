import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ApplyForm from "../../components/UI/ApplyForm";
import { applicationApi } from "../../services/api";
import { BIDDER_REQUIRED_DOCUMENTS } from "../../constants/documents";

const getInitialApplyForm = () => ({
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
  bidFileDocuments: null,
  compiledDocuments: null,
  financialDocuments: null,
  technicalProposal: null,
  proofOfExperience: null,
  supportingDocuments: null,
});

const ApplyTenderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const tenderFromState = location.state?.tender;
  const [selectedTender, setSelectedTender] = useState(
    tenderFromState || { _id: id, id, title: "Tender Application" },
  );
  const [applyForm, setApplyForm] = useState(getInitialApplyForm());
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    if (tenderFromState) {
      setSelectedTender(tenderFromState);
    }
  }, [tenderFromState]);

  const handleApplyInputChange = (e) => {
    const { name, value } = e.target;
    setApplyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFileUpload = (e, documentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    setApplyForm((prev) => ({ ...prev, [documentType]: file }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleRemoveApplyDocument = (documentType) => {
    setApplyForm((prev) => ({ ...prev, [documentType]: null }));
    toast.success("File removed");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  useEffect(() => {
    const tenderId = selectedTender?._id || selectedTender?.id || id;
    if (!tenderId) return;

    const draftKey = `applyDraft:${tenderId}`;
    let restored = null;

    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) restored = JSON.parse(saved);
    } catch (error) {
      console.error("Failed to parse saved apply draft", error);
    }

    if (restored) {
      setApplyForm({
        ...restored,
        bidFileDocuments: null,
        compiledDocuments: null,
        financialDocuments: null,
        technicalProposal: null,
        proofOfExperience: null,
        supportingDocuments: null,
      });
      toast.success("Draft restored from your last session.");
      return;
    }

    setApplyForm(getInitialApplyForm());
  }, [id, selectedTender]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    const tenderId = selectedTender?._id || selectedTender?.id || id;
    if (!tenderId) return;

    try {
      setApplyLoading(true);
      setApplyError("");

      const complianceKeys = BIDDER_REQUIRED_DOCUMENTS.map((d) => d.key);
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
        ...Object.fromEntries(complianceKeys.map((k) => [k, applyForm?.[k]])),
        supportingDocuments: applyForm.supportingDocuments,
      };

      await applicationApi.applyToTender(tenderId, payload);

      toast.success("Application submitted successfully!");
      try {
        localStorage.removeItem(`applyDraft:${tenderId}`);
      } catch {}

      navigate("/bidder/tenders");
    } catch (err) {
      console.error("Error applying to tender:", err);
      setApplyError(
        err?.response?.data?.message || "Failed to submit application",
      );
      toast.error("Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const handleFileDrop = (e, documentType) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    const syntheticEvent = {
      target: {
        files: [file],
      },
    };

    handleApplyFileUpload(syntheticEvent, documentType);
  };

  useEffect(() => {
    const tenderId = selectedTender?._id || selectedTender?.id || id;
    if (!tenderId) return;

    const draftKey = `applyDraft:${tenderId}`;
    const { files, ...rest } = applyForm || {};
    try {
      localStorage.setItem(draftKey, JSON.stringify(rest));
    } catch (error) {
      console.error("Failed to save apply draft", error);
    }
  }, [applyForm, id, selectedTender]);

  return (
    <DashboardLayout
      title="Apply to Tender"
      subtitle={selectedTender?.title || "Submit your tender application"}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/bidder/tenders")}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-slate-900/60 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tenders
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div className="relative border-b border-cyan-400/10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-4">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Apply to Tender</h3>
                  <p className="truncate text-xs font-medium text-cyan-400">
                    {selectedTender?.title || "Tender application"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                <FileText className="h-3.5 w-3.5" />
                Submission form
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitApplication} className="flex flex-col">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-6 custom-scrollbar">
              {applyError && (
                <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/20 p-4 text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{applyError}</span>
                  </div>
                </div>
              )}

              <ApplyForm
                formData={applyForm}
                onInputChange={handleApplyInputChange}
                onFileUpload={handleApplyFileUpload}
                onFileDrop={handleFileDrop}
                onRemoveFile={handleRemoveApplyDocument}
                onSubmit={handleSubmitApplication}
                onCancel={() => navigate("/bidder/tenders")}
                loading={applyLoading}
                error={applyError}
                formatFileSize={formatFileSize}
              />
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplyTenderPage;
