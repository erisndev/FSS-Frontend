import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

const EditTender = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const successRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    isUrgent: false,
    tags: "",
    requirements: "",
    companyName: "",
    registrationNumber: "",
    bbeeLevel: "",
    cidbGrading: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    status: "active",
    bidFileDocuments: null,
    compiledDocuments: null,
    financialDocuments: null,
    technicalProposal: null,
    proofOfExperience: null,
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
      try {
        const res = await tenderApi.getTender(id);
        console.log("Fetched tender data:", res);

        // Process existing documents
        let existingDocs = {
          bidFileDocuments: null,
          compiledDocuments: null,
          financialDocuments: null,
          technicalProposal: null,
          proofOfExperience: null,
        };

        // Check if documents exist and have the label property (new format)
        if (Array.isArray(res.documents) && res.documents.length > 0) {
          res.documents.forEach(doc => {
            if (doc.label === 'Bid File Documents') {
              existingDocs.bidFileDocuments = { 
                name: doc.name || doc.originalName, 
                url: doc.url, 
                size: doc.size,
                isExisting: true 
              };
            } else if (doc.label === 'Compiled Documents') {
              existingDocs.compiledDocuments = { 
                name: doc.name || doc.originalName, 
                url: doc.url, 
                size: doc.size,
                isExisting: true 
              };
            } else if (doc.label === 'Financial Documents') {
              existingDocs.financialDocuments = { 
                name: doc.name || doc.originalName, 
                url: doc.url, 
                size: doc.size,
                isExisting: true 
              };
            } else if (doc.label === 'Technical Proposal') {
              existingDocs.technicalProposal = { 
                name: doc.name || doc.originalName, 
                url: doc.url, 
                size: doc.size,
                isExisting: true 
              };
            } else if (doc.label === 'Proof of Experience (Reference Letter)') {
              existingDocs.proofOfExperience = { 
                name: doc.name || doc.originalName, 
                url: doc.url, 
                size: doc.size,
                isExisting: true 
              };
            }
          });
        }

        setFormData({
          ...res,
          deadline: res.deadline ? res.deadline.slice(0, 16) : "",
          ...existingDocs,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch tender data");
      }
    };

    fetchTender();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      const documentFields = [
        "bidFileDocuments",
        "compiledDocuments",
        "financialDocuments",
        "technicalProposal",
        "proofOfExperience",
      ];

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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8"
        >
          {/* Back to Tenders Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/issuer/tenders")}
              className="flex items-center px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenders
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 text-red-300"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 text-green-300"
              >
                {success}
              </motion.div>
            )}
            {/* Title & Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            {/* Company Info */}{" "}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Company Name *{" "}
                </label>{" "}
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter company name"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Registration Number{" "}
                </label>{" "}
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter registration number"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* B-BBEE & CIDB */}{" "}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  B-BBEE Level{" "}
                </label>{" "}
                <select
                  name="bbeeLevel"
                  value={formData.bbeeLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Select B-BBEE Level"
                >
                  {" "}
                  <option value="">Select B-BBEE Level</option>{" "}
                  <option value="1">Level 1</option>{" "}
                  <option value="2">Level 2</option>{" "}
                  <option value="3">Level 3</option>{" "}
                  <option value="4">Level 4</option>{" "}
                  <option value="5">Level 5</option>{" "}
                  <option value="6">Level 6</option>{" "}
                  <option value="7">Level 7</option>{" "}
                  <option value="8">Level 8</option>{" "}
                </select>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  CIDB Grading{" "}
                </label>{" "}
                <input
                  type="text"
                  name="cidbGrading"
                  value={formData.cidbGrading}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="e.g., 5GB, 7CE"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Contact Info */}{" "}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Contact Person{" "}
                </label>{" "}
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter contact person"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Contact Email{" "}
                </label>{" "}
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter contact email"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {" "}
                  Contact Phone{" "}
                </label>{" "}
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter contact phone"
                />{" "}
              </div>{" "}
            </div>{" "}
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
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Documents
              </label>
              <div className="space-y-4">
                {/* Bid File Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bid File Documents
                  </label>
                  {formData.bidFileDocuments ? (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{formData.bidFileDocuments.name}</p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.bidFileDocuments.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('bidFileDocuments')}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'bidFileDocuments')}
                        className="hidden"
                        id="bidFileDocuments"
                      />
                      <label
                        htmlFor="bidFileDocuments"
                        onDrop={(e) => handleDocumentDrop(e, 'bidFileDocuments')}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:bg-slate-800/70 hover:border-cyan-400/40 cursor-pointer transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File or Drop Here
                      </label>
                    </div>
                  )}
                </div>

                {/* Compiled Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Compiled Documents
                  </label>
                  {formData.compiledDocuments ? (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{formData.compiledDocuments.name}</p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.compiledDocuments.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('compiledDocuments')}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'compiledDocuments')}
                        className="hidden"
                        id="compiledDocuments"
                      />
                      <label
                        htmlFor="compiledDocuments"
                        onDrop={(e) => handleDocumentDrop(e, 'compiledDocuments')}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:bg-slate-800/70 hover:border-cyan-400/40 cursor-pointer transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File or Drop Here
                      </label>
                    </div>
                  )}
                </div>

                {/* Financial Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Financial Documents
                  </label>
                  {formData.financialDocuments ? (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{formData.financialDocuments.name}</p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.financialDocuments.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('financialDocuments')}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'financialDocuments')}
                        className="hidden"
                        id="financialDocuments"
                      />
                      <label
                        htmlFor="financialDocuments"
                        onDrop={(e) => handleDocumentDrop(e, 'financialDocuments')}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:bg-slate-800/70 hover:border-cyan-400/40 cursor-pointer transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File or Drop Here
                      </label>
                    </div>
                  )}
                </div>

                {/* Technical Proposal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Technical Proposal
                  </label>
                  {formData.technicalProposal ? (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{formData.technicalProposal.name}</p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.technicalProposal.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('technicalProposal')}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'technicalProposal')}
                        className="hidden"
                        id="technicalProposal"
                      />
                      <label
                        htmlFor="technicalProposal"
                        onDrop={(e) => handleDocumentDrop(e, 'technicalProposal')}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:bg-slate-800/70 hover:border-cyan-400/40 cursor-pointer transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File or Drop Here
                      </label>
                    </div>
                  )}
                </div>

                {/* Proof of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proof of Experience (Reference Letter)
                  </label>
                  {formData.proofOfExperience ? (
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{formData.proofOfExperience.name}</p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.proofOfExperience.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument('proofOfExperience')}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'proofOfExperience')}
                        className="hidden"
                        id="proofOfExperience"
                      />
                      <label
                        htmlFor="proofOfExperience"
                        onDrop={(e) => handleDocumentDrop(e, 'proofOfExperience')}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:bg-slate-800/70 hover:border-cyan-400/40 cursor-pointer transition-all duration-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File or Drop Here
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Submit */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-cyan-400/10">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EditTender;
