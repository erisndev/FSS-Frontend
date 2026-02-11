import React, { useState } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Users,
  Building,
  Phone,
  FileText,
  Award,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../services/api";
import toast from "react-hot-toast";
import { handleApiError } from "../../utils/errorHandler.jsx";
import logger from "../../utils/logger";

const Register = () => {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    role: "bidder",
    // Issuer-specific fields
    contactPhone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  if (user) {
    const dashboardPath =
      user.role === "admin"
        ? "/admin"
        : user.role === "issuer"
          ? "/issuer"
          : "/bidder";
    return <Navigate to={dashboardPath} replace />;
  }

  if (isRegistered) {
    return (
      <Navigate
        to="/verify-otp"
        state={{
          email: formData.email.toLowerCase().trim(),
          isRegistration: true,
        }}
        replace
      />
    );
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      logger.log("Registering user...");
      logger.log(formData);

      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        company: formData.company,
      };

      // Add issuer-specific fields if role is issuer
      if (formData.role === "issuer") {
        registrationData.contactPhone = formData.contactPhone;
      }

      // Call API directly with all fields
      const response = await authApi.register(registrationData);

      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Registration successful → redirect to OTP verification
      toast.success("Registration successful! Please verify your email.");
      // Update formData with normalized email for navigation state
      setFormData((prev) => ({
        ...prev,
        email: prev.email.toLowerCase().trim(),
      }));
      setIsRegistered(true);
    } catch (err) {
      logger.error("Registration error:", err);

      // Extract error message from response
      let errorMessage = "Registration failed";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle specific error cases
      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("exist")
      ) {
        errorMessage =
          "This email is already registered. Please use a different email or login.";
      } else if (err.response?.status === 400) {
        // Generic 400 error
        if (errorMessage === "Registration failed") {
          errorMessage =
            "Invalid registration data. Please check your information and try again.";
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-4">
      <div className="max-w-md w-full space-y-4 sm:space-y-6 md:space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Create Account
          </h2>
          <p className="text-cyan-400/70 mt-1 sm:mt-2 text-sm sm:text-base">
            Join TenderFlow System
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 md:space-y-5"
          >
            {/* {error && (
              <div
                className="bg-red-500/20 border border-red-400/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-red-300 text-xs sm:text-sm break-words"
              >
                {error}
              </div>
            )} */}

            {/* Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Role
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                >
                  <option value="bidder">Bidder</option>
                  <option value="issuer">Issuer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Issuer-specific fields */}
            {formData.role === "issuer" && (
              <>
                {/* Contact Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      required
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                      placeholder="Contact phone number"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-1.5 md:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-2.5 md:py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-3 sm:mt-4 md:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
