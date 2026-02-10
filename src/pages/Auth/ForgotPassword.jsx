import React, { useState } from "react";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Requesting password reset for:", normalizedEmail);
      await forgotPassword(normalizedEmail);
      // Start OTP timer and move to OTP Verification step
      console.log("Password reset OTP sent to:", normalizedEmail);
      localStorage.setItem("otpTimestamp", Date.now().toString());
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email: normalizedEmail, isRegistration: false } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Title */}
        <div
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
          <p className="text-cyan-400/70 mt-2">
            {isEmailSent ? "Check your email" : "Reset your password"}
          </p>
        </div>

        {/* Form */}
        <div
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 shadow-2xl"
        >
          {isEmailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Email Sent!</h3>
              <p className="text-gray-400">
                We've sent a password reset link to{" "}
                <strong className="text-cyan-400">{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Please check your email and follow the instructions to reset
                your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-300 text-sm"
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We'll send a 6-digit OTP to your email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner variant="inline" size="sm" color="white" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
