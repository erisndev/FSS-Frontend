// src/pages/dashboard/Profile.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../services/api";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
      console.log("Sending update: ", formData);
      const updatedUser = await updateProfile(formData); // <-- use context
      console.log("Updated user returned: ", updatedUser);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "Failed to update profile");
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
      await authApi.resetPassword(
        user.email,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
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
        return "from-gray-500 to-gray-600";
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-r ${getRoleColor(
                  user?.role
                )} flex items-center justify-center text-4xl font-bold text-white`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">
                {user?.name}
              </h2>
              <p className="text-gray-400 mb-4">{user?.email}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span
                  className={`px-3 py-1 text-sm rounded-full border ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
                <span className="px-3 py-1 text-sm rounded-full text-green-400 bg-green-400/20 border border-green-400/30">
                  Active
                </span>
                <span className="px-3 py-1 text-sm rounded-full text-cyan-400 bg-cyan-400/20 border border-cyan-400/30">
                  Verified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </motion.div>

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

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Change Password
              </h3>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              {["current", "new", "confirm"].map((type, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {type === "current"
                      ? "Current Password"
                      : type === "new"
                      ? "New Password"
                      : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
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
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
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
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-6 py-3 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lock className="w-4 h-4" />
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
