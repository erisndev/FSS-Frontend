import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Users,
  Crown,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { handleApiError, logError } from "../../utils/errorHandler";

const TeamLogin = () => {
  const { user, teamLogin, getTeamMembers, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Email, 2: Member Selection, 3: Password
  const [email, setEmail] = useState("");
  const [organizationData, setOrganizationData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user && user.role) {
    const dashboardPath =
      user.role === "admin"
        ? "/admin"
        : user.role === "issuer"
        ? "/issuer"
        : "/bidder";
    return <Navigate to={dashboardPath} replace />;
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await getTeamMembers(email);
      setOrganizationData(data);
      setStep(2);
      toast.success(`Welcome to ${data.organizationName}`);
    } catch (err) {
      // If no team found, redirect to regular login
      if (err?.response?.status === 404) {
        toast.error("No team found. Redirecting to regular login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(
          err?.response?.data?.message || "Failed to fetch team members"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await teamLogin(email, selectedMember.id, password);
      toast.success("Login successful");
    } catch (err) {
      logError("Team Login", err);
      const friendlyError = handleApiError(err, toast, "Login failed");
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 3) {
      setStep(2);
      setPassword("");
      setSelectedMember(null);
    } else if (step === 2) {
      setStep(1);
      setOrganizationData(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 sm:space-y-8"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Organization Login
          </h2>
          <p className="text-cyan-400/70 mt-1 sm:mt-2 text-sm sm:text-base">
            {step === 1 && "Enter your organization email"}
            {step === 2 && "Select your team member"}
            {step === 3 && "Enter your password"}
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-cyan-400"
                    : s < step
                    ? "w-2 bg-cyan-400/50"
                    : "w-2 bg-gray-600"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailSubmit}
                className="space-y-4 sm:space-y-6"
              >
                {/* {error && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-2.5 sm:p-3 text-red-300 text-xs sm:text-sm break-words">
                    {error}
                  </div>
                )} */}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Organization Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Enter organization email"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </div>
                  ) : (
                    "Continue"
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* Step 2: Member Selection */}
            {step === 2 && organizationData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <button
                  onClick={handleBack}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {organizationData.organizationName}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Select your profile to continue
                  </p>
                </div>

                <div className="space-y-3">
                  {organizationData.members.map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMemberSelect(member)}
                      className="w-full p-4 bg-slate-800/50 border border-cyan-400/20 rounded-lg hover:border-cyan-400/50 hover:bg-slate-800/70 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-medium">
                                {member.name}
                              </p>
                              {member.role === "team_leader" && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-gray-400 text-sm capitalize">
                              {member.role.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Password Input */}
            {step === 3 && selectedMember && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                {/* {error && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-2.5 sm:p-3 text-red-300 text-xs sm:text-sm break-words">
                    {error}
                  </div>
                )} */}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <span>{selectedMember.name}</span>
                    {selectedMember.role === "team_leader" && (
                      <Crown className="w-5 h-5 text-yellow-400" />
                    )}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 capitalize">
                    {selectedMember.role.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Links */}
          {step === 1 && (
            <div className="mt-4 sm:mt-6 space-y-3 text-center">
              <Link
                to="/login"
                className="block text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                Use regular login instead
              </Link>
              <p className="text-xs sm:text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeamLogin;
