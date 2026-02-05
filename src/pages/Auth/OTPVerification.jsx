import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const OTPVerification = () => {
  const {
    verifyRegisterOTP,
    verifyResetOTP,
    resendRegisterOTP,
    resendResetOTP,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  // Cooldown implementation: store a timestamp (ms) until resend is allowed
  const [cooldownUntil, setCooldownUntil] = useState(null);

  const { email, isRegistration } = location.state || {};

  const normalizedEmail = useMemo(
    () => (email ? email.toLowerCase().trim() : ""),
    [email]
  );

  const resendTimer = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  }, [cooldownUntil]);

  const canResend = resendTimer === 0;

  useEffect(() => {
    if (!normalizedEmail) {
      navigate("/login", { replace: true });
      return;
    }
  }, [normalizedEmail, isRegistration, navigate]);

  // Load cooldown timestamp (ms) on mount
  useEffect(() => {
    const stored = localStorage.getItem("registerOtpCooldownUntil");
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed > Date.now()) {
        setCooldownUntil(parsed);
      }
    }
  }, []);

  // Tick every second while cooling down
  useEffect(() => {
    if (!cooldownUntil) return;

    const id = setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null);
      } else {
        // trigger rerender for timer display
        setCooldownUntil((prev) => prev);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [cooldownUntil]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const otpString = otp.join("");
    
    if (!normalizedEmail) {
      setError("Missing email. Please register again.");
      return;
    }

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (isRegistration) {
        const user = await verifyRegisterOTP(normalizedEmail, otpString);
        toast.success("Registration successful");

        
        if (user && user.role) {
          const dashboardPath =
            user.role === "admin"
              ? "/admin"
              : user.role === "issuer"
              ? "/issuer"
              : "/bidder";
          navigate(dashboardPath, { replace: true });
        } else {
          setError(
            "Registration completed, but user info is missing. Please login."
          );
          toast.error("Please login to continue");
          navigate("/login", { replace: true });
        }
      } else {
        await verifyResetOTP(normalizedEmail, otpString);
        navigate("/reset-password", {
          state: { email: normalizedEmail, otp: otpString },
        });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Verification failed";

      
      // Match spec messaging for register flow
      if (
        isRegistration &&
        err?.response?.status === 400 &&
        message === "Invalid or expired registration OTP"
      ) {
        setError(
          "Incorrect code. Please check the latest email or resend a new code."
        );
      } else if (isRegistration && err?.response?.status === 404) {
        setError("User not found. Please register again.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!normalizedEmail) {
      setError("Missing email. Please register again.");
      return;
    }

    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");

    
    try {
      let res;
      if (isRegistration) {
        res = await resendRegisterOTP(normalizedEmail);
      } else {
        res = await resendResetOTP(normalizedEmail);
      }

      
      // Spec: backend may return resendAvailableInSeconds when reusing cooldown
      const seconds =
        Number(res?.resendAvailableInSeconds) > 0
          ? Number(res.resendAvailableInSeconds)
          : 60;

      const until = Date.now() + seconds * 1000;
      localStorage.setItem("registerOtpCooldownUntil", until.toString());
      setCooldownUntil(until);

      // UX: make it clear they must use the latest OTP
      toast.success("Code sent. Use the latest code you receive.");

      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      if (firstInput) firstInput.focus();

      // If backend indicates already verified
      if (res?.message === "Email already verified") {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to resend OTP";

      
      // Spec: already verified should redirect to login
      if (isRegistration && err?.response?.status === 400) {
        if (message === "Email already verified") {
          navigate("/login", { replace: true });
          return;
        }
      }

      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isRegistration ? "Complete Registration" : "Verify OTP"}
          </h2>
          <p className="text-cyan-400/70 mt-2 text-sm">
            {isRegistration
              ? `Enter the verification code sent to ${email}`
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </motion.div>

        {/* OTP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border rounded-lg p-3 text-sm ${
                  error.toLowerCase().includes("expired") ||
                  error.toLowerCase().includes("invalid")
                    ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-300"
                    : "bg-red-500/20 border-red-400/50 text-red-300"
                }`}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                  />
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            {!canResend ? (
              <p className="text-gray-400 text-sm">
                Didn't receive the code? Resend in{" "}
                <span className="text-cyan-400 font-medium">
                  {formatTimer(resendTimer)}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Resending...</span>
                  </div>
                ) : (
                  "Resend code"
                )}
              </button>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() =>
                navigate(isRegistration ? "/register" : "/forgot-password")
              }
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                Back to {isRegistration ? "Registration" : "Forgot Password"}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
