import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, Save, Upload, FileText, X } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { tenderApi } from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateTender = () => {
  const successRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  // Initialize form data with localStorage or defaults
  const getInitialFormData = () => {
    const savedData = localStorage.getItem("createTenderFormData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { ...parsed, documents: [] }; // do not restore documents for security
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
    return {
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
      documents: [],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Show notification if draft restored
  useEffect(() => {
    const savedData = localStorage.getItem("createTenderFormData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const hasData = Object.values(parsed).some(
          (value) => value !== "" && value !== false && value !== "active"
        );
        if (hasData) {
          toast.success("Draft restored from previous session!");
        }
      } catch (error) {
        console.error("Error checking saved data:", error);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    const dataToSave = { ...formData };
    delete dataToSave.documents;
    localStorage.setItem("createTenderFormData", JSON.stringify(dataToSave));
  }, [formData]);

  const clearSavedData = () => {
    localStorage.removeItem("createTenderFormData");
  };

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file,
    }));
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...newFiles],
    }));
  };

  const handleRemoveDocument = (id) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
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

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("Preparing to submit form data:", formData);

      await tenderApi.createTender(formData);

      setSuccess("Tender created successfully!");
      clearSavedData();

      setTimeout(() => navigate("/issuer/tenders"), 2000);

      setFormData(getInitialFormData());
    } catch (err) {
      console.error("Error creating tender:", err);
      setError("Failed to create tender. Please try again.");
      toast.error("Failed to create tender.");
    } finally {
      setLoading(false);
    }
  };

  const { documents } = formData;

  return (
    <DashboardLayout
      title="Create New Tender"
      subtitle="Post a new tender for bidders to apply"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
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

            {/* Success */}
            {success && (
              <motion.div
                ref={successRef}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 text-green-300"
              >
                {success}
              </motion.div>
            )}

            {/* --- Form Fields --- */}

            {/* Title & Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tender Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
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
                  value={formData.category}
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                placeholder="Provide detailed description of the tender requirements..."
              />
            </div>

            {/* Budget Min/Max & Deadline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Minimum budget "
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Maximum budget "
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Select deadline"
                  />
                </div>
              </div>
            </div>

            {/* Urgent */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
                  placeholder="Mark as urgent"
                />
                <span className="text-gray-300">Mark as urgent</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </label>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                placeholder="e.g. construction, urgent, government"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                placeholder="List tender requirements"
              />
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter registration number"
                />
              </div>
            </div>

            {/* B-BBEE & CIDB */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  B-BBEE Level
                </label>
                <select
                  name="bbeeLevel"
                  value={formData.bbeeLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Select B-BBEE Level"
                >
                  <option value="">Select B-BBEE Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                  <option value="6">Level 6</option>
                  <option value="7">Level 7</option>
                  <option value="8">Level 8</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CIDB Grading
                </label>
                <select
                  name="cidbGrading"
                  value={formData.cidbGrading}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Select CIDB Grading"
                >
                  <option value="">Select CIDB Grading</option>
                  <option value="1GB">1GB</option>
                  <option value="2GB">2GB</option>
                  <option value="3GB">3GB</option>
                  <option value="4GB">4GB</option>
                  <option value="5GB">5GB</option>
                  <option value="6GB">6GB</option>
                  <option value="7GB">7GB</option>
                  <option value="8GB">8GB</option>
                  <option value="9GB">9GB</option>
                  <option value="10GB">10GB</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Contact person email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Contact person phone"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                placeholder="Select status"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Documents Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Documents
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-cyan-400/20 hover:border-cyan-400/40"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-gray-500 text-sm">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 50MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block mt-4 px-6 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 cursor-pointer transition-all duration-300"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">
                    Uploaded Documents:
                  </h4>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white text-sm">{doc.name}</p>
                          {doc.size && (
                            <p className="text-gray-400 text-xs">
                              {formatFileSize(doc.size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-cyan-400/10">
              <button
                type="button"
                onClick={() => {
                  clearSavedData();
                  setFormData({
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
                    documents: [],
                  });
                  toast.success("Draft cleared!");
                }}
                className="px-4 py-2 bg-slate-700/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-700/70 hover:text-white transition-all duration-300"
              >
                Clear Draft
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 inline mr-2" />
                    Create Tender
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

export default CreateTender;
