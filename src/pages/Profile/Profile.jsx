// src/pages/dashboard/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Users,
  Crown,
  Building2,
  Phone,
  CheckCircle,
  XCircle,
  Info,
  Settings,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { authApi, organizationApi } from "../../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile, isTeamLeader } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    description: user?.description || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Refs for scrolling to forms
  const editProfileRef = useRef(null);
  const changePasswordRef = useRef(null);

  // Check if user is part of an organization
  const isPartOfOrganization = user?.organizationId && user?.memberRole;
  const isTeamLeaderUser = user?.memberRole === "team_leader";
  const isTeamMember = user?.memberRole === "member";

  // Fetch organization details if user is part of one
  useEffect(() => {
    if (isPartOfOrganization) {
      fetchOrganization();
    }
  }, [isPartOfOrganization]);

  const fetchOrganization = async () => {
    try {
      setLoadingOrg(true);
      const response = await organizationApi.getOrganization(
        user.organizationId,
      );
      setOrganization(response.organization || response);
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoadingOrg(false);
    }
  };

  // Handle input change for profile
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Save profile using API
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const updatedUser = await updateProfile(formData);
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "Failed to update profile");
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Change password using API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setSuccess("Password changed successfully!");
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Role badge colors
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "from-red-500 to-pink-500";
      case "issuer":
        return "from-purple-500 to-pink-500";
      case "bidder":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/20 border-red-400/30";
      case "issuer":
        return "text-purple-400 bg-purple-400/20 border-purple-400/30";
      case "bidder":
        return "text-blue-400 bg-blue-400/20 border-blue-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your account settings and preferences"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r ${getRoleColor(
                  user?.role,
                )} flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">
                {user?.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 break-all">
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full border ${getRoleBadgeColor(
                    user?.role,
                  )}`}
                >
                  {user?.role}
                </span>
                {isTeamLeaderUser && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full text-yellow-400 bg-yellow-400/20 border border-yellow-400/30 flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Team Leader</span>
                  </span>
                )}
                {isTeamMember && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full text-blue-400 bg-blue-400/20 border border-blue-400/30 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Team Member</span>
                  </span>
                )}
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full text-green-400 bg-green-400/20 border border-green-400/30">
                  Active
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setTimeout(() => {
                    editProfileRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  setTimeout(() => {
                    changePasswordRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Change Password</span>
                <span className="xs:hidden">Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              success
                ? "bg-green-500/20 border-green-400/50 text-green-300"
                : "bg-red-500/20 border-red-400/50 text-red-300"
            }`}
          >
            {success || error}
          </motion.div>
        )}

        {/* Organization Information (Team Members/Leaders Only) */}
        {isPartOfOrganization && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span>Organization Information</span>
              </h3>
              {isTeamLeaderUser && (
                <button
                  onClick={() => navigate("/issuer/team")}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Team</span>
                </button>
              )}
            </div>

            {loadingOrg ? (
              <div className="flex items-center justify-center py-8">
                <div
                  className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin
"
                ></div>
              </div>
            ) : organization ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Organization Name</p>
                      <p className="text-white font-medium">
                        {organization.companyName || user.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Shared Email</p>
                      <p className="text-white font-medium break-all">
                        {organization.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {organization.contactPhone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Contact Phone</p>
                        <p className="text-white font-medium">
                          {organization.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs rounded-full ${
                          organization.isActive !== false
                            ? "text-green-400 bg-green-400/20 border border-green-400/30"
                            : "text-red-400 bg-red-400/20 border border-red-400/30"
                        }`}
                      >
                        {organization.isActive !== false
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Organization details not available
              </p>
            )}
          </motion.div>
        )}

        {/* Permissions Section (Team Members/Leaders Only) */}
        {isPartOfOrganization && user?.permissions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-6 md:p-8"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>My Permissions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries({
                canCreateTenders: "Create Tenders",
                canEditTenders: "Edit Tenders",
                canDeleteTenders: "Delete Tenders",
                canViewApplications: "View Applications",
                canAcceptReject: "Accept/Reject Applications",
                canManageTeam: "Manage Team",
              }).map(([key, label]) => {
                const hasPermission = user.permissions[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
                      hasPermission
                        ? "bg-green-500/10 border-green-400/30"
                        : "bg-red-500/10 border-red-400/30 opacity-60"
                    }`}
                  >
                    {hasPermission ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        hasPermission ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {isTeamMember && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-300 font-medium mb-1">
                      Note
                    </p>
                    <p className="text-sm text-gray-300">
                      Your permissions are managed by your team leader. Contact
                      them if you need additional access.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Login Information Section */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Login Information</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Login Method</p>
                <p className="text-white font-medium">
                  {isPartOfOrganization
                    ? "Organization Login"
                    : "Standard Login"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Login Email</p>
                <p className="text-white font-medium break-all">
                  {isPartOfOrganization
                    ? organization?.email || "Loading..."
                    : user?.email}
                </p>
              </div>
            </div>

            {isPartOfOrganization && (
              <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-cyan-300 font-medium mb-2">
                      How to login:
                    </p>
                    <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Go to Organization Login page</li>
                      <li>
                        Enter:{" "}
                        <code className="px-2 py-0.5 bg-slate-800 rounded text-cyan-400">
                          {organization?.email || "organization email"}
                        </code>
                      </li>
                      <li>
                        Select your name:{" "}
                        <strong className="text-white">{user?.name}</strong>
                      </li>
                      <li>Enter your password</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.div
            ref={editProfileRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/30 border border-cyan-400/20 rounded-lg text-gray-400 cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <div
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin
"
                    ></div>
                  ) : (
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Change Password Form */}
        {isChangingPassword && (
          <motion.div
            ref={changePasswordRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4 sm:p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Change Password
              </h3>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 sm:space-y-6"
            >
              {["current", "new", "confirm"].map((type, index) => (
                <div key={index}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    {type === "current"
                      ? "Current Password"
                      : type === "new"
                        ? "New Password"
                        : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type={showPasswords[type] ? "text" : "password"}
                      name={
                        type === "current"
                          ? "currentPassword"
                          : type === "new"
                            ? "newPassword"
                            : "confirmPassword"
                      }
                      value={
                        type === "current"
                          ? passwordData.currentPassword
                          : type === "new"
                            ? passwordData.newPassword
                            : passwordData.confirmPassword
                      }
                      onChange={handlePasswordChange}
                      required
                      className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder={
                        type === "current"
                          ? "Enter current password"
                          : type === "new"
                            ? "Enter new password"
                            : "Confirm new password"
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          [type]: !showPasswords[type],
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {showPasswords[type] ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <div
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin
"
                    ></div>
                  ) : (
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  <span>{loading ? "Changing..." : "Change Password"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
