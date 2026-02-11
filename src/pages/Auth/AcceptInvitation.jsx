import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import useMinLoadingTime from "../../utils/useMinLoadingTime";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Users,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const showLoading = useMinLoadingTime(loading);
  const [submitting, setSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [organizationEmail, setOrganizationEmail] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/team-members/invitations/${token}/validate`,
      );
      setInvitationData(response.data);
      setError("");
    } catch (err) {
      console.error("Error validating invitation:", err);
      if (err.response?.status === 404) {
        setError(
          "Invalid invitation link. Please check your email or contact your team leader.",
        );
      } else if (err.response?.data?.message?.includes("expired")) {
        setError(
          "This invitation has expired. Please contact your team leader for a new invitation.",
        );
      } else {
        setError(
          err.response?.data?.message || "Failed to validate invitation",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { label: "", color: "" };
    if (passwordStrength <= 2) return { label: "Weak", color: "text-red-400" };
    if (passwordStrength <= 3)
      return { label: "Fair", color: "text-yellow-400" };
    if (passwordStrength <= 4) return { label: "Good", color: "text-blue-400" };
    return { label: "Strong", color: "text-green-400" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/team-members/invitations/${token}/accept`,
        { password: formData.password },
      );

      setOrganizationEmail(response.data.organizationEmail);
      setSuccess(true);
      toast.success("Invitation accepted successfully!");

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate("/team-login", {
          state: { email: response.data.organizationEmail },
        });
      }, 5000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      if (
        err.response?.status === 400 &&
        err.response?.data?.message?.includes("expired")
      ) {
        setError(
          "This invitation has expired. Please contact your team leader for a new invitation.",
        );
      } else {
        setError(err.response?.data?.message || "Failed to accept invitation");
      }
      toast.error(err.response?.data?.message || "Failed to accept invitation");
    } finally {
      setSubmitting(false);
    }
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-red-400/20 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Invalid Invitation
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to the Team!
            </h2>
            <p className="text-gray-300">
              Your account has been created successfully.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-cyan-400/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-cyan-400" />
              How to Login
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </span>
                <span>
                  Go to the <strong className="text-white">Team Login</strong>{" "}
                  page
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </span>
                <span>
                  Enter your organization email:{" "}
                  <strong className="text-cyan-400">{organizationEmail}</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </span>
                <span>
                  Select your name:{" "}
                  <strong className="text-white">{invitationData?.name}</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  4
                </span>
                <span>Enter the password you just created</span>
              </li>
            </ol>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              Redirecting to login in 5 seconds...
            </p>
            <Link
              to="/team-login"
              state={{ email: organizationEmail }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-200"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const strengthInfo = getPasswordStrengthLabel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to {invitationData?.organizationName}!
          </h1>
          <p className="text-cyan-400/70">
            Hi {invitationData?.name}, you've been invited to join the team.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Create Your Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Enter your password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${strengthInfo.color}`}
                    >
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 2
                          ? "bg-red-400"
                          : passwordStrength <= 3
                            ? "bg-yellow-400"
                            : passwordStrength <= 4
                              ? "bg-blue-400"
                              : "bg-green-400"
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span>Accepting Invitation...</span>
                </div>
              ) : (
                "Accept & Join Team"
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white mb-1">
                After setting your password:
              </p>
              <p>
                You'll be able to login using your organization's shared email
                address and select your name from the team member list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
