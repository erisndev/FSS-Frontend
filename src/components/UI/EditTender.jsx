import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import {
  FileText,
  Upload,
  X,
  Calendar,
  AlertCircle,
  Save,
  ArrowLeft,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { tenderApi } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ISSUER_ISSUED_DOCUMENTS } from "../../constants/documents";

const EditTender = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const successRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    // Company info
    companyName: "",
    companyAddress: "",

    // Contacts
    technicalContactPerson: "",
    technicalContactEmail: "",
    technicalContactPhone: "",
    generalContactPerson: "",
    generalContactEmail: "",
    generalContactPhone: "",

    status: "active",
    // Keep a stable array for UI summary / compatibility with CreateTender
    documents: [],

    // Individual document fields (issuer-issued tender documents)
    termsOfReference: null,
    sbd1: null,
    sbd2: null,
    sbd4DeclarationOfInterest: null,
    sbd61: null,
    bidTechnicalSubmissionTemplate: null,
    bidFinancialSubmissionTemplate: null,
    annexure1: null,
    annexure2: null,
    annexure3: null,
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
    const fetchTender = async () => {
      setIsFetching(true);
      try {
        const res = await tenderApi.getTender(id);

        // Process existing documents
        const existingDocs = {
          termsOfReference: null,
          sbd1: null,
          sbd2: null,
          sbd4DeclarationOfInterest: null,
          sbd61: null,
          bidTechnicalSubmissionTemplate: null,
          bidFinancialSubmissionTemplate: null,
          annexure1: null,
          annexure2: null,
          annexure3: null,
        };

        // Check if documents exist and have the label property (new format)
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
              (d) => d.label === doc.label,
            );
            if (match) {
              existingDocs[match.key] = mapped;
            }
          });
        }

        // Normalize tags back into comma-separated string for the input UI
        const tagsString = Array.isArray(res.tags)
          ? res.tags.join(", ")
          : res.tags || "";

        // Some endpoints return documents as an object with keys (bidFileDocuments, ...)
        // but our edit UI expects an array (like ViewTenderModal's "new format").
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
          // Ensure we always have an array for UI compatibility
          documents: normalizedDocumentsArray,
          ...existingDocs,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch tender data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTender();
  }, [id]);

  const docTypeConfig = ISSUER_ISSUED_DOCUMENTS;

  const getDocLabel = (key) =>
    docTypeConfig.find((d) => d.key === key)?.label || key;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReplaceClick = (documentType) => {
    const input = document.getElementById(`replace-${documentType}`);
    input?.click();
  };

  // Handle file uploads for individual document types
  const handleFileUpload = (e, documentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [documentType]: file,
    }));
    toast.success(`${file.name} uploaded successfully`);
  };

  // Handle drag and drop for individual document types
  const handleDocumentDrop = (e, documentType) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`${file.name} is too large. Maximum size is 10MB`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [documentType]: file,
    }));
    toast.success(`${file.name} uploaded successfully`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveDocument = (documentType) => {
    setFormData((prev) => ({
      ...prev,
      [documentType]: null,
    }));
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
    setSuccess("");
    setLoading(true);

    try {
      // Match CreateTender payload shape for non-file fields
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

      // Existing docs should NOT be re-sent as file uploads.
      const documentFields = ISSUER_ISSUED_DOCUMENTS.map((d) => d.key);

      documentFields.forEach((field) => {
        const doc = submitData[field];
        if (doc?.isExisting) {
          submitData[field] = null;
        }
      });

      await tenderApi.updateTender(id, submitData);

      toast.success("Tender updated successfully!");
      setSuccess("Tender updated successfully!");
      setTimeout(() => navigate("/issuer/tenders"), 2000);
      successRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update tender";
      setError(msg);
      if (err.response?.status !== 403) {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Edit Tender" subtitle="Update tender details">
      <div className="max-w-4xl mx-auto -mx-3 sm:mx-auto sm:px-4">
        {isFetching ? (
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8">
            <div className="flex items-center space-x-3 text-gray-300">
              <LoadingSpinner variant="inline" size="sm" />
              <span>Loading tender details...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl sm:rounded-xl p-4 sm:p-6 lg:p-8">
            {/* Back to Tenders Button */}
            <div className="mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate("/issuer/tenders")}
                className="flex items-center px-3 py-2 sm:px-4 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenders
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 text-red-300">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 text-green-300">
                  {success}
                </div>
              )}
              {/* Title & Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tender Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter tender title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
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
              {/* Description */}{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Description *{" "}
                </label>{" "}
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                  placeholder="Provide detailed description of the tender requirements..."
                />{" "}
              </div>{" "}
              {/* Budget Min/Max & Deadline */}{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {" "}
                    Budget Min *{" "}
                  </label>{" "}
                  <input
                    type="number"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Minimum budget (e.g. 10000)"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {" "}
                    Budget Max *{" "}
                  </label>{" "}
                  <input
                    type="number"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Maximum budget (e.g. 50000)"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {" "}
                    Deadline *{" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />{" "}
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Select deadline"
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Urgent */}{" "}
              <div>
                {" "}
                <label className="flex items-center space-x-3 cursor-pointer">
                  {" "}
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
                    placeholder="Mark as urgent"
                  />{" "}
                  <span className="text-gray-300">Mark as urgent</span>{" "}
                  <AlertCircle className="w-4 h-4 text-red-400" />{" "}
                </label>{" "}
              </div>{" "}
              {/* Tags */}{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Tags{" "}
                </label>{" "}
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="e.g. construction, urgent, government"
                />{" "}
              </div>{" "}
              {/* Requirements */}{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Requirements{" "}
                </label>{" "}
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                  placeholder="List tender requirements"
                />{" "}
              </div>{" "}
              {/* Company Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Address
                  </label>
                  <textarea
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                    placeholder="Street, suburb, city, province"
                  />
                </div>
              </div>
              {/* Contacts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-slate-800/20 border border-cyan-400/10 rounded-lg p-3 sm:p-4">
                  <p className="text-sm font-semibold text-cyan-300 mb-3">
                    Technical Contact
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Person
                      </label>
                      <input
                        type="text"
                        name="technicalContactPerson"
                        value={formData.technicalContactPerson}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="technicalContactEmail"
                        value={formData.technicalContactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="technical@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="technicalContactPhone"
                        value={formData.technicalContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="+27 ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/20 border border-cyan-400/10 rounded-lg p-3 sm:p-4">
                  <p className="text-sm font-semibold text-cyan-300 mb-3">
                    General / Bid Queries Contact
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Person
                      </label>
                      <input
                        type="text"
                        name="generalContactPerson"
                        value={formData.generalContactPerson}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="generalContactEmail"
                        value={formData.generalContactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="bids@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="generalContactPhone"
                        value={formData.generalContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
                        placeholder="+27 ..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Status */}{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Status{" "}
                </label>{" "}
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Select status"
                >
                  {" "}
                  <option value="active">Active</option>{" "}
                  <option value="closed">Closed</option>{" "}
                  <option value="draft">Draft</option>{" "}
                </select>{" "}
              </div>
              {/* Documents Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3 sm:mb-4">
                  Documents
                </label>

                {/* Required Documents (match ViewTenderModal behavior) */}
                <div className="space-y-4 mb-4 sm:mb-6">
                  {ISSUER_ISSUED_DOCUMENTS.map((required, index) => {
                    const findDocInArray = () => {
                      if (!Array.isArray(formData.documents)) return null;
                      return (
                        formData.documents.find(
                          (d) => d?.label === required.label,
                        ) ||
                        // fallback matching if backend used slightly different label casing
                        formData.documents.find(
                          (d) =>
                            (d?.label || "").toLowerCase() ===
                            required.label.toLowerCase(),
                        )
                      );
                    };

                    const doc = findDocInArray();

                    // Prefer per-field state (because it can be newly replaced locally), otherwise use DB doc
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
                      <div key={required.key} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-200">
                              {required.label}
                            </span>
                          </div>
                          {current ? (
                            <span className="text-xs text-green-400 font-semibold">
                              Uploaded
                            </span>
                          ) : (
                            <span className="text-xs text-red-400 font-semibold">
                              Not Uploaded
                            </span>
                          )}
                        </div>

                        {current ? (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-800/40 border border-cyan-400/10 rounded-xl">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {current.name || "Document"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {current.size
                                    ? formatFileSize(current.size)
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 justify-end">
                              {current.url && (
                                <a
                                  href={current.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1 text-xs bg-slate-700/40 text-gray-200 border border-slate-500/30 rounded-md hover:bg-slate-700/60 transition-all duration-200"
                                >
                                  View
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleReplaceClick(required.key)}
                                className="px-3 py-1 text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded-md hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-200"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveDocument(required.key)
                                }
                                className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Hidden replace input */}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                handleFileUpload(e, required.key)
                              }
                              className="hidden"
                              id={`replace-${required.key}`}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-800/30 border border-red-400/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-400/30 flex items-center justify-center flex-shrink-0">
                                <X className="w-5 h-5 text-red-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-red-400">
                                  Not Uploaded
                                </p>
                                <p className="text-xs text-gray-500">
                                  This document is required
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 justify-end">
                              <button
                                type="button"
                                onClick={() => handleReplaceClick(required.key)}
                                className="px-3 py-1 text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded-md hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-200"
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
                                id={`replace-${required.key}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legacy per-document upload blocks removed (duplicates of Required Documents UI above) */}
              </div>
              {/* Submit */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:space-x-4 pt-6 border-t border-cyan-400/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      Update Tender
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditTender;
