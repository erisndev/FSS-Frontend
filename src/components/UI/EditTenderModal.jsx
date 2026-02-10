import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  X,
  Calendar,
  AlertCircle,
  Save,
  Edit,
  Sparkles,
} from "lucide-react";
import { tenderApi } from "../../services/api";
import toast from "react-hot-toast";
import { ISSUER_ISSUED_DOCUMENTS } from "../../constants/documents";
import LoadingSpinner from "./LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";

const EditTenderModal = ({ isOpen, onClose, tenderId, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const showFetching = useMinLoadingTime(isFetching);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    requirements: "",
    isUrgent: false,
    tags: "",
    companyName: "",
    companyAddress: "",
    technicalContactPerson: "",
    technicalContactEmail: "",
    technicalContactPhone: "",
    generalContactPerson: "",
    generalContactEmail: "",
    generalContactPhone: "",
    status: "active",
    documents: [],
    ...Object.fromEntries(ISSUER_ISSUED_DOCUMENTS.map((d) => [d.key, null])),
  });

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
    if (!isOpen || !tenderId) return;
    const fetchTender = async () => {
      setIsFetching(true);
      setError("");
      try {
        const res = await tenderApi.getTender(tenderId);

        const existingDocs = Object.fromEntries(
          ISSUER_ISSUED_DOCUMENTS.map((d) => [d.key, null])
        );

        if (Array.isArray(res.documents) && res.documents.length > 0) {
          res.documents.forEach((doc) => {
            const mapped = {
              name: doc.name || doc.originalName,
              url: doc.url,
              size: doc.size,
              isExisting: true,
              label: doc.label,
            };
            const match = ISSUER_ISSUED_DOCUMENTS.find(
              (d) => d.label === doc.label
            );
            if (match) existingDocs[match.key] = mapped;
          });
        }

        const tagsString = Array.isArray(res.tags)
          ? res.tags.join(", ")
          : res.tags || "";

        const normalizedDocumentsArray = Array.isArray(res.documents)
          ? res.documents
          : res.documents && typeof res.documents === "object"
            ? ISSUER_ISSUED_DOCUMENTS.map((def) => ({
                ...(res.documents?.[def.key] || {}),
                label: def.label,
              })).filter((d) => d && d.url)
            : [];

        setFormData((prev) => ({
          ...prev,
          ...res,
          tags: tagsString,
          deadline: res.deadline ? res.deadline.slice(0, 16) : "",
          documents: normalizedDocumentsArray,
          ...existingDocs,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch tender data");
        setError("Failed to load tender data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchTender();
  }, [isOpen, tenderId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReplaceClick = (documentType) => {
    document.getElementById(`edit-replace-${documentType}`)?.click();
  };

  const handleFileUpload = (e, documentType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }
    setFormData((prev) => ({ ...prev, [documentType]: file }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleRemoveDocument = (documentType) => {
    setFormData((prev) => ({ ...prev, [documentType]: null }));
    toast.success("File removed");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        tags:
          typeof formData.tags === "string"
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : Array.isArray(formData.tags)
              ? formData.tags
              : [],
      };

      ISSUER_ISSUED_DOCUMENTS.forEach(({ key }) => {
        if (submitData[key]?.isExisting) submitData[key] = null;
      });

      await tenderApi.updateTender(tenderId, submitData);
      toast.success("Tender updated successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update tender";
      setError(msg);
      if (err.response?.status !== 403) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]"
        onClick={onClose}
      >
        <div
          className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-4 border-b border-cyan-400/10 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Tender</h3>
                  <p className="text-xs text-cyan-400 font-medium truncate max-w-[200px] sm:max-w-none">
                    {formData.title || "Loading…"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-white/10 rounded-lg group disabled:opacity-50"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {showFetching ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <LoadingSpinner variant="section" />
                </div>
                <p className="text-gray-400 text-sm animate-pulse">
                  Loading tender details…
                </p>
              </div>
            ) : (
              <form
                id="edit-tender-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {error && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-300 text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Title & Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 text-sm"
                      placeholder="Enter tender title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none text-sm"
                    placeholder="Provide detailed description…"
                  />
                </div>

                {/* Budget & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Budget Min *
                    </label>
                    <input
                      type="number"
                      name="budgetMin"
                      value={formData.budgetMin}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Budget Max *
                    </label>
                    <input
                      type="number"
                      name="budgetMax"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Deadline *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                      <input
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Urgent + Status */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
                    />
                    <span className="text-gray-300 text-sm">
                      Mark as urgent
                    </span>
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  </label>

                  <div className="flex-1 sm:max-w-xs">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                    placeholder="e.g. construction, urgent, government"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none text-sm"
                    placeholder="List tender requirements"
                  />
                </div>

                {/* Company Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Company Address
                    </label>
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 resize-none text-sm"
                      placeholder="Street, suburb, city, province"
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-slate-800/20 border border-cyan-400/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-2">
                      Technical Contact
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="technicalContactPerson"
                        value={formData.technicalContactPerson}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="Full name"
                      />
                      <input
                        type="email"
                        name="technicalContactEmail"
                        value={formData.technicalContactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="technical@example.com"
                      />
                      <input
                        type="tel"
                        name="technicalContactPhone"
                        value={formData.technicalContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="+27 ..."
                      />
                    </div>
                  </div>
                  <div className="bg-slate-800/20 border border-cyan-400/10 rounded-lg p-3">
                    <p className="text-xs font-semibold text-cyan-300 mb-2">
                      General / Bid Queries Contact
                    </p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="generalContactPerson"
                        value={formData.generalContactPerson}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="Full name"
                      />
                      <input
                        type="email"
                        name="generalContactEmail"
                        value={formData.generalContactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="bids@example.com"
                      />
                      <input
                        type="tel"
                        name="generalContactPhone"
                        value={formData.generalContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 text-sm"
                        placeholder="+27 ..."
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Issuer Issued Documents
                  </label>
                  <div className="space-y-3">
                    {ISSUER_ISSUED_DOCUMENTS.map((required) => {
                      const findDocInArray = () => {
                        if (!Array.isArray(formData.documents)) return null;
                        return formData.documents.find(
                          (d) =>
                            (d?.label || "").toLowerCase() ===
                            required.label.toLowerCase()
                        );
                      };
                      const doc = findDocInArray();
                      const current =
                        formData[required.key] ||
                        (doc
                          ? {
                              name: doc.name || doc.originalName,
                              url: doc.url,
                              size: doc.size,
                              isExisting: true,
                              label: doc.label,
                            }
                          : null);

                      return (
                        <div key={required.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-1 h-3.5 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
                              <span className="text-xs font-semibold text-gray-200">
                                {required.label}
                              </span>
                            </div>
                            {current ? (
                              <span className="text-[10px] text-green-400 font-semibold">
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-400 font-semibold">
                                Not Uploaded
                              </span>
                            )}
                          </div>

                          {current ? (
                            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-800/40 border border-cyan-400/10 rounded-lg">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-white truncate">
                                    {current.name || "Document"}
                                  </p>
                                  {current.size && (
                                    <p className="text-[10px] text-gray-400">
                                      {formatFileSize(current.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5 flex-shrink-0">
                                {current.url && (
                                  <a
                                    href={current.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 text-[10px] bg-slate-700/40 text-gray-200 border border-slate-500/30 rounded hover:bg-slate-700/60 transition-all"
                                  >
                                    View
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReplaceClick(required.key)
                                  }
                                  className="px-2 py-1 text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded hover:bg-cyan-500/20 transition-all"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDocument(required.key)
                                  }
                                  className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-400/10 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  handleFileUpload(e, required.key)
                                }
                                className="hidden"
                                id={`edit-replace-${required.key}`}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-800/30 border border-red-400/20 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-400/30 flex items-center justify-center flex-shrink-0">
                                  <X className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-400">
                                    Not Uploaded
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    Required
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReplaceClick(required.key)
                                }
                                className="px-2.5 py-1 text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded hover:bg-cyan-500/20 transition-all"
                              >
                                Upload
                              </button>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  handleFileUpload(e, required.key)
                                }
                                className="hidden"
                                id={`edit-replace-${required.key}`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!showFetching && (
            <div className="flex items-center justify-end gap-3 p-4 border-t border-cyan-400/10 flex-shrink-0 bg-slate-900/80">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600 transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-tender-form"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium shadow-lg shadow-purple-500/20"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <LoadingSpinner variant="inline" size="sm" color="white" />
                    <span>Updating…</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Update Tender</span>
                  </span>
                )}
              </button>
            </div>
          )}

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #06b6d4, #a855f7);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #0891b2, #9333ea);
            }
          `}</style>
        </div>
      </div>
    
  );
};

export default EditTenderModal;
