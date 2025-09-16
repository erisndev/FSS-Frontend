import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import {
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Award,
  Download,
  Eye,
  Clock,
  Tag,
} from "lucide-react";
import { tenderApi } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

const ViewTender = () => {
  const { id } = useParams();
  const [tender, setTender] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTender = async () => {
      try {
        setLoading(true);
        const tenderData = await tenderApi.getTender(id); // expects signed URLs for private files
        console.log("Fetched Tender:", tenderData);
        setTender(tenderData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tender data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTender();
  }, [id]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileText className="w-5 h-5 text-cyan-400" />;
    if (mimeType.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-400" />; // PDF
    if (mimeType.includes("word"))
      return <FileText className="w-5 h-5 text-blue-400" />; // Word
    return <FileText className="w-5 h-5 text-cyan-400" />; // fallback
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays < 0) {
      return { text: formattedDate, status: "expired", badge: "Expired" };
    } else if (diffDays <= 3) {
      return {
        text: formattedDate,
        status: "urgent",
        badge: `${diffDays} days left`,
      };
    } else if (diffDays <= 7) {
      return {
        text: formattedDate,
        status: "warning",
        badge: `${diffDays} days left`,
      };
    } else {
      return {
        text: formattedDate,
        status: "normal",
        badge: `${diffDays} days left`,
      };
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="View Tender" subtitle="Loading tender details...">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
              <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-700/30 rounded w-2/3 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-slate-700/20 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="View Tender" subtitle="Error loading tender">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-400/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => navigate("/issuer/tenders")}
              className="mt-4 px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Back to Tenders
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tender) return null;

  const deadline = formatDeadline(tender.deadline);

  return (
    <DashboardLayout title="View Tender" subtitle="Tender Details">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section with Back Button */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/issuer/tenders")}
              className="group flex items-center px-4 py-2 bg-slate-700/50 text-gray-300 rounded-xl hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Tenders
            </button>

            <div className="flex items-center space-x-3">
              {tender.isUrgent && (
                <div className="flex items-center px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-400/30">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Urgent</span>
                </div>
              )}
              <div
                className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${
                  deadline.status === "expired"
                    ? "bg-red-500/20 text-red-300 border-red-400/30"
                    : deadline.status === "urgent"
                    ? "bg-orange-500/20 text-orange-300 border-orange-400/30"
                    : deadline.status === "warning"
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                    : "bg-green-500/20 text-green-300 border-green-400/30"
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                {deadline.badge}
              </div>
            </div>
          </div>
        </div>

        {/* Main Tender Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                    {tender.title}
                  </h1>
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-medium">
                      {tender.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 text-cyan-400 mr-2" />
                    Description
                  </h3>
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                    <p className="text-gray-300 leading-relaxed">
                      {tender.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Award className="w-5 h-5 text-cyan-400 mr-2" />
                    Requirements
                  </h3>
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                    <p className="text-gray-300 leading-relaxed">
                      {tender.requirements}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {tender.documents?.length > 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/30 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <FileText className="w-5 h-5 text-cyan-400 mr-2" />
                  Documents ({tender.documents.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {tender.documents.map((doc, index) => (
                    <div
                      key={doc.public_id || doc.url || index}
                      className="group bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 hover:bg-slate-700/40 hover:border-slate-500/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(doc.mimeType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">
                              {doc.originalName || doc.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                          <a
                            href={doc.url}
                            download
                            className="flex items-center px-3 py-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 hover:text-green-200 transition-all duration-300 text-sm font-medium"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Key Information */}
          <div className="space-y-6">
            {/* Budget & Deadline Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">
                Key Details
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Budget Range</span>
                  </div>
                  <p className="text-green-300 text-lg font-semibold">
                    R{tender.budgetMin?.toLocaleString()} - R
                    {tender.budgetMax?.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Deadline</span>
                  </div>
                  <p className="text-blue-300 font-medium">{deadline.text}</p>
                </div>
              </div>
            </div>

            {/* Company Information Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building className="w-5 h-5 text-cyan-400 mr-2" />
                Company Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Company Name</p>
                  <p className="text-white font-medium">{tender.companyName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Registration Number</p>
                  <p className="text-cyan-300 font-mono">
                    {tender.registrationNumber}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-sm">B-BBEE Level</p>
                    <p className="text-white font-medium">{tender.bbeeLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">CIDB Grading</p>
                    <p className="text-white font-medium">
                      {tender.cidbGrading}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 text-cyan-400 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">Contact Person</p>
                    <p className="text-white font-medium">
                      {tender.contactPerson}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <a
                      href={`mailto:${tender.contactEmail}`}
                      className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline transition-colors duration-300"
                    >
                      {tender.contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <a
                      href={`tel:${tender.contactPhone}`}
                      className="text-cyan-300 hover:text-cyan-200 font-medium hover:underline transition-colors duration-300"
                    >
                      {tender.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewTender;
