import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Calendar,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  Building,
  User,
  Mail,
  Phone,
  Hash,
  Tag,
  Info,
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  Shield,
  Award,
  Building2,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { tenderApi } from "../../services/api";
import toast from "react-hot-toast";
import { ISSUER_ISSUED_DOCUMENTS } from "../../constants/documents";

const CreateTenderModal = ({ isOpen, onClose, onSuccess }) => {
  const contentRef = React.useRef(null);
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
    // Keep a stable array for UI summary (length access) and future support for multi-file uploads
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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

  const stepInfo = [
    {
      number: 1,
      title: "Basic Info",
      icon: FileText,
      description: "Title, category, and description",
    },
    {
      number: 2,
      title: "Budget & Timeline",
      icon: Calendar,
      description: "Financial and time constraints",
    },
    {
      number: 3,
      title: "Company Details",
      icon: Building,
      description: "Organization and contact info",
    },
    {
      number: 4,
      title: "Requirements & Docs",
      icon: Shield,
      description: "Specifications and attachments",
    },
  ];

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isOpen && formData.title) {
      const draftData = { ...formData };
      delete draftData.documents; // Don't save files in localStorage
      localStorage.setItem("tenderDraft", JSON.stringify(draftData));
    }
  }, [formData, isOpen]);

  // Load draft on mount
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem("tenderDraft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // Ensure documents is always an array to avoid `.length` crashes in Step 4 summary
            documents: Array.isArray(parsed?.documents) ? parsed.documents : [],
          }));
          toast.success("Draft restored from previous session", {
            icon: "📝",
            duration: 3000,
          });
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [isOpen]);

  // Clean stray artifacts: ensure file has no rogue text nodes around this line
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "title":
        if (!value.trim()) error = "Title is required";
        else if (value.length < 10)
          error = "Title must be at least 10 characters";
        else if (value.length > 100)
          error = "Title must be less than 100 characters";
        break;
      case "description":
        if (!value.trim()) error = "Description is required";
        else if (value.length < 50)
          error = "Description must be at least 50 characters";
        else if (value.length > 2000)
          error = "Description must be less than 2000 characters";
        break;
      case "category":
        if (!value) error = "Category is required";
        break;
      case "companyName":
        if (!value.trim()) error = "Company name is required";
        break;
      case "budgetMin":
        if (!value) error = "Minimum budget is required";
        else if (Number(value) < 0) error = "Budget cannot be negative";
        break;
      case "budgetMax":
        if (!value) error = "Maximum budget is required";
        else if (Number(value) < 0) error = "Budget cannot be negative";
        else if (Number(value) < Number(formData.budgetMin))
          error = "Maximum budget must be greater than minimum";
        break;
      case "deadline":
        if (!value) error = "Deadline is required";
        else {
          const deadlineDate = new Date(value);
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 7); // Minimum 7 days from now
          if (deadlineDate <= new Date())
            error = "Deadline must be in the future";
          else if (deadlineDate < minDate)
            error = "Deadline must be at least 7 days from now";
        }
        break;
      case "technicalContactEmail":
      case "generalContactEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "technicalContactPhone":
      case "generalContactPhone":
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value))
          error = "Invalid phone number format";
        break;
      default:
        break;
    }

    return error;
  };

  const validateStep = (step) => {
    const newErrors = {};
    const fieldsToValidate = getStepFields(step);

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ["title", "category", "description"];
      case 2:
        return ["budgetMin", "budgetMax", "deadline"];
      case 3:
        return [];
      case 4:
        return [];
      default:
        return [];
    }
  };

  const handleNext = () => {
    const stepFields = getStepFields(currentStep);
    const newTouched = {};
    stepFields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched({ ...touched, ...newTouched });

    if (validateStep(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
      // Scroll to top of form
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Please fix the errors before proceeding", {
        icon: "⚠️",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    // Scroll to top of form
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleDocumentUpload = (e, documentType) => {
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

  const handleDocumentDrop = (e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

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

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draftData = { ...formData, status: "draft" };
      await tenderApi.createTender(draftData);
      toast.success("Draft saved successfully!", {
        icon: "💾",
      });
      localStorage.removeItem("tenderDraft");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps
    let hasErrors = false;
    for (let step = 1; step <= 2; step++) {
      if (!validateStep(step)) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      toast.error("Please complete all required fields", {
        icon: "⚠️",
      });
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      // console.log("SubmitData", submitData);

      await tenderApi.createTender(submitData);

      // Success animation
      toast.success("Tender created successfully! 🎉", {
        duration: 4000,
      });

      // Clear draft from localStorage
      localStorage.removeItem("tenderDraft");

      // Reset form
      setFormData({
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
      setCurrentStep(1);
      setErrors({});
      setTouched({});
      setCompletedSteps([]);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating tender:", error);
      toast.error(error.response?.data?.message || "Failed to create tender", {
        icon: "❌",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isSavingDraft) return;

    // Check if form has significant data
    const hasData =
      formData.title ||
      formData.description ||
      formData.category ||
      formData.companyName ||
      formData.companyAddress;
    if (hasData) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Do you want to save them as a draft before closing?",
      );
      if (confirmClose) {
        handleSaveDraft();
        return;
      }
    }

    onClose();
  };

  const getStepProgress = () => {
    const totalFields = getStepFields(currentStep).length;
    if (totalFields === 0) return 100;

    const filledFields = getStepFields(currentStep).filter(
      (field) => formData[field] && formData[field].toString().trim(),
    ).length;

    return Math.round((filledFields / totalFields) * 100);
  };

  const getOverallProgress = () => {
    const requiredFields = [
      "title",
      "category",
      "description",
      "companyName",
      "budgetMin",
      "budgetMax",
      "deadline",
    ];
    const filledFields = requiredFields.filter(
      (field) => formData[field] && formData[field].toString().trim(),
    ).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  // Guard render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-3 border-b border-cyan-400/10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Create New Tender
                </h3>
                <p className="text-xs text-gray-400">
                  Complete all steps to publish your tender
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting || isSavingDraft}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Overall Progress</span>
              <span className="text-xs text-cyan-400 font-medium">
                {getOverallProgress()}%
              </span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                animate={{ width: `${getOverallProgress()}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="px-4 py-2 bg-slate-900/50 border-b border-cyan-400/10">
          <div className="flex items-center justify-between">
            {stepInfo.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  onClick={() => handleStepClick(step.number)}
                  disabled={
                    step.number > currentStep &&
                    !completedSteps.includes(step.number - 1)
                  }
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                    currentStep === step.number
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30"
                      : completedSteps.includes(step.number)
                        ? "bg-green-500/10 border border-green-400/20 hover:bg-green-500/20"
                        : step.number < currentStep
                          ? "hover:bg-white/5"
                          : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`relative ${
                      currentStep === step.number ? "animate-pulse" : ""
                    }`}
                  >
                    <step.icon
                      className={`w-4 h-4 ${
                        currentStep === step.number
                          ? "text-cyan-400"
                          : completedSteps.includes(step.number)
                            ? "text-green-400"
                            : "text-gray-400"
                      }`}
                    />
                    {completedSteps.includes(step.number) && (
                      <CheckCircle className="absolute -top-1 -right-1 w-2.5 h-2.5 text-green-400" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p
                      className={`text-xs font-medium ${
                        currentStep === step.number
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </button>
                {index < stepInfo.length - 1 && (
                  <ArrowRight
                    className={`w-3 h-3 mx-1 ${
                      completedSteps.includes(step.number)
                        ? "text-green-400"
                        : "text-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                Step {currentStep} Progress
              </span>
              <span className="text-xs text-purple-400 font-medium">
                {getStepProgress()}%
              </span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                key={currentStep}
                animate={{ width: `${getStepProgress()}%` }}
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div key="step1" className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-400/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-cyan-400 font-medium">
                        Quick Tip
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        A clear and descriptive title helps bidders quickly
                        understand your tender requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tender Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Construction of Office Building in Johannesburg"
                    className={`w-full px-4 py-3 bg-slate-800/50 border ${
                      touched.title && errors.title
                        ? "border-red-400/50"
                        : "border-cyan-400/20"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                  />
                  {touched.title && errors.title && (
                    <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.title}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${
                        touched.category && errors.category
                          ? "border-red-400/50"
                          : "border-cyan-400/20"
                      } rounded-lg text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {touched.category && errors.category && (
                      <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.category}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={5}
                    placeholder="Provide a detailed description of the tender requirements, scope of work, and expectations..."
                    className={`w-full px-4 py-3 bg-slate-800/50 border ${
                      touched.description && errors.description
                        ? "border-red-400/50"
                        : "border-cyan-400/20"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200 resize-none`}
                  />
                  {touched.description && errors.description && (
                    <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.description.length}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., construction, urgent, government (comma separated)"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Separate tags with commas to help bidders find your tender
                  </p>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="isUrgent"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-400 bg-slate-800 border-red-400/20 rounded focus:ring-red-400/50"
                  />
                  <label
                    htmlFor="isUrgent"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-gray-300">
                      Mark as urgent tender
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Timeline */}
            {currentStep === 2 && (
              <div key="step2" className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-400 font-medium">
                        Budget Guidelines
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Set realistic budget ranges to attract qualified
                        bidders. Consider market rates and project complexity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Budget (R) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="budgetMin"
                        value={formData.budgetMin}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                          touched.budgetMin && errors.budgetMin
                            ? "border-red-400/50"
                            : "border-cyan-400/20"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                      />
                    </div>
                    {touched.budgetMin && errors.budgetMin && (
                      <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.budgetMin}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Budget (R) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                          touched.budgetMax && errors.budgetMax
                            ? "border-red-400/50"
                            : "border-cyan-400/20"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                      />
                    </div>
                    {touched.budgetMax && errors.budgetMax && (
                      <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.budgetMax}</span>
                      </p>
                    )}
                  </div>
                </div>

                {formData.budgetMin && formData.budgetMax && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-lg">
                    <p className="text-sm text-cyan-400">
                      Budget Range:{" "}
                      <span className="font-bold">
                        R{Number(formData.budgetMin).toLocaleString()} - R
                        {Number(formData.budgetMax).toLocaleString()}
                      </span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Submission Deadline <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                        touched.deadline && errors.deadline
                          ? "border-red-400/50"
                          : "border-cyan-400/20"
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                    />
                  </div>
                  {touched.deadline && errors.deadline && (
                    <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.deadline}</span>
                    </p>
                  )}
                  {formData.deadline && (
                    <div className="mt-3 p-3 bg-purple-500/10 border border-purple-400/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <p className="text-sm text-purple-400">
                          Deadline:{" "}
                          {new Date(formData.deadline).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.ceil(
                          (new Date(formData.deadline) - new Date()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days from now
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tender Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                  >
                    <option value="active">
                      Active - Open for applications
                    </option>
                    <option value="draft">Draft - Save for later</option>
                    <option value="closed">
                      Closed - Not accepting applications
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Company Details */}
            {currentStep === 3 && (
              <div key="step3" className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-emerald-400 font-medium">
                        Company Information
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        These details help establish credibility and enable
                        bidders to verify your organization.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Your company name"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                        touched.companyName && errors.companyName
                          ? "border-red-400/50"
                          : "border-cyan-400/20"
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                    />
                  </div>
                  {touched.companyName && errors.companyName && (
                    <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.companyName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Address
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Street, suburb, city, province, postal code"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200 resize-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    This will be shown to bidders as part of the tender details.
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-medium text-purple-400 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Contact Information</span>
                  </h4>

                  {/* Technical contact */}
                  <div className="p-4 bg-slate-800/30 border border-cyan-400/10 rounded-xl">
                    <p className="text-sm font-semibold text-cyan-300 mb-3">
                      Technical Contact
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="technicalContactPerson"
                          value={formData.technicalContactPerson}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="technicalContactEmail"
                            value={formData.technicalContactEmail}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="technical@example.com"
                            className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                              touched.technicalContactEmail &&
                              errors.technicalContactEmail
                                ? "border-red-400/50"
                                : "border-cyan-400/20"
                            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                          />
                        </div>
                        {touched.technicalContactEmail &&
                          errors.technicalContactEmail && (
                            <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors.technicalContactEmail}</span>
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="technicalContactPhone"
                            value={formData.technicalContactPhone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="+27 ..."
                            className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                              touched.technicalContactPhone &&
                              errors.technicalContactPhone
                                ? "border-red-400/50"
                                : "border-cyan-400/20"
                            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                          />
                        </div>
                        {touched.technicalContactPhone &&
                          errors.technicalContactPhone && (
                            <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors.technicalContactPhone}</span>
                            </p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* General/Bid queries contact */}
                  <div className="p-4 bg-slate-800/30 border border-cyan-400/10 rounded-xl">
                    <p className="text-sm font-semibold text-cyan-300 mb-3">
                      General / Bid Queries Contact
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contact Person
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="generalContactPerson"
                          value={formData.generalContactPerson}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="generalContactEmail"
                            value={formData.generalContactEmail}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="bids@example.com"
                            className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                              touched.generalContactEmail &&
                              errors.generalContactEmail
                                ? "border-red-400/50"
                                : "border-cyan-400/20"
                            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                          />
                        </div>
                        {touched.generalContactEmail &&
                          errors.generalContactEmail && (
                            <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors.generalContactEmail}</span>
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="generalContactPhone"
                            value={formData.generalContactPhone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="+27 ..."
                            className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border ${
                              touched.generalContactPhone &&
                              errors.generalContactPhone
                                ? "border-red-400/50"
                                : "border-cyan-400/20"
                            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200`}
                          />
                        </div>
                        {touched.generalContactPhone &&
                          errors.generalContactPhone && (
                            <p className="mt-1 text-sm text-red-400 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{errors.generalContactPhone}</span>
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Requirements & Documents */}
            {currentStep === 4 && (
              <div key="step4" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requirements & Specifications
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="List specific requirements, qualifications, certifications, or any other specifications bidders must meet..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 transition-all duration-200 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Be specific about mandatory requirements vs. preferred
                    qualifications
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Documents
                  </h3>
                  <div className="space-y-4">
                    {ISSUER_ISSUED_DOCUMENTS.map((def) => {
                      const value = formData[def.key];
                      const inputId = def.key;

                      return (
                        <div key={def.key}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {def.label}
                          </label>
                          {value ? (
                            <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-cyan-400" />
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {value.name}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {formatFileSize(value.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(def.key)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                              >
                                <X className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                id={inputId}
                                onChange={(e) =>
                                  handleDocumentUpload(e, def.key)
                                }
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                              />
                              <label
                                htmlFor={inputId}
                                onDrop={(e) => handleDocumentDrop(e, def.key)}
                                onDragOver={handleDragOver}
                                className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                              >
                                <Upload className="w-5 h-5 mr-2" />
                                <span className="text-sm">
                                  Choose File or Drop Here
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Summary */}
                <div className="p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-400/20 rounded-xl">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Tender Summary</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Title:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.title || "Not set"}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Company:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.companyName || "Not set"}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Address:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.companyAddress || "Not set"}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Category:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.category || "Not set"}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Status:</span>{" "}
                        <span
                          className={`font-medium ${
                            formData.status === "active"
                              ? "text-green-400"
                              : formData.status === "draft"
                                ? "text-yellow-400"
                                : "text-gray-400"
                          }`}
                        >
                          {formData.status.charAt(0).toUpperCase() +
                            formData.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Budget:</span>{" "}
                        <span className="text-cyan-400 font-medium">
                          R{Number(formData.budgetMin || 0).toLocaleString()} -
                          R{Number(formData.budgetMax || 0).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Deadline:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.deadline
                            ? new Date(formData.deadline).toLocaleDateString()
                            : "Not set"}
                        </span>
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Documents:</span>{" "}
                        <span className="text-white font-medium">
                          {formData.documents.length} file(s)
                        </span>
                      </p>
                      {formData.isUrgent && (
                        <p className="text-red-400 font-medium flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>Marked as Urgent</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-3 border-t border-cyan-400/10 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || isSavingDraft}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            {currentStep === 4 && formData.status === "active" && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-slate-800/50 border border-gray-600/50 text-gray-300 rounded-lg hover:bg-slate-800/70 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {isSavingDraft ? (
                  <>
                    <LoadingSpinner variant="inline" size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save as Draft</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isSavingDraft}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSavingDraft}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Tender</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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
  );
};

export default CreateTenderModal;
