import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { X, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { verificationCodeApi } from "../../services/api";
import toast from "react-hot-toast";

const VerificationModal = ({ isOpen, onClose, tender, onVerified }) => {
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const [hasApprovedCode, setHasApprovedCode] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    if (isOpen && tender) {
      checkVerificationStatus();
    }
  }, [isOpen, tender]);

  useEffect(() => {
    // Reset state when modal closes
    if (!isOpen) {
      setCode(["", "", "", "", "", "", "", ""]);
      setError("");
      // Keep hasApprovedCode so user can reopen and verify without re-requesting
    }
  }, [isOpen]);

  const checkVerificationStatus = async () => {
    setIsCheckingStatus(true);
    setError("");

    try {
      const statusResponse = await verificationCodeApi.checkStatus(tender._id);
      console.log("Verification status check:", statusResponse);

      const applied = !!statusResponse?.hasApplied;
      const approvedCode = !!statusResponse?.hasApprovedCode;
      const noRequest = !!statusResponse?.noRequest;

      setHasApplied(applied);
      setHasApprovedCode(approvedCode);

      // If already applied, lock UI.
      if (applied) return;

      // If the backend indicates there's no *unused* request, it may be because
      // the bidder already verified in a previous session.
      // We'll treat this as "not verified" and let Apply enforce via 403.
      if (noRequest) {
        setIsAlreadyVerified(false);
        return;
      }

      // If there is an approved code waiting, show verify UI.
      if (approvedCode) {
        setIsAlreadyVerified(false);
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCodeChange = (index, value) => {
    // Allow alphanumeric characters for 8-character codes
    if (value.length <= 1 && /^[A-Z0-9]*$/i.test(value)) {
      const newCode = [...code];
      newCode[index] = value.toUpperCase();
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 7) {
        const nextInput = document.getElementById(`verify-code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`verify-code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRequestCode = async () => {
    setIsRequesting(true);
    setError("");

    try {
      await verificationCodeApi.requestCode(tender._id);
      setHasApprovedCode(true);
      toast.success("Code sent to your email.");
    } catch (error) {
      const data = error?.response?.data;
      if (error?.response?.status === 400 && data?.hasApprovedCode) {
        setHasApprovedCode(true);
        toast.success("Code already sent. Please check your email.");
      } else {
        const message = data?.message || "Failed to request verification code";
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join("");

    if (codeString.length !== 8) {
      setError("Please enter all 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await verificationCodeApi.verifyCode(tender._id, codeString);

      toast.success(
        "Verification successful! You can now apply for this tender.",
      );

      // Mark as verified locally
      setIsAlreadyVerified(true);

      // Proceed to application
      onVerified();
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid verification code";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (hasApplied) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-500/20 border border-slate-400/30 rounded-full">
          <CheckCircle className="w-4 h-4 text-slate-300" />
          <span className="text-slate-200 text-sm">Already Applied</span>
        </div>
      );
    }

    if (isAlreadyVerified) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">Verified</span>
        </div>
      );
    }

    if (hasApprovedCode) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Code Sent</span>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-400/20 rounded-xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-cyan-400/10">
          <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-400/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white truncate">
                Tender Verification
              </h3>
              <p className="text-xs text-gray-400 truncate">
                Secure access verification required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Tender Info */}
          <div className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-cyan-400/10 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-cyan-400 mb-1">
                  Applying for:
                </h4>
                <p className="text-sm text-white font-semibold break-words">
                  {tender?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {(hasApplied || hasApprovedCode || isAlreadyVerified) && (
            <div className="flex justify-center">{getStatusBadge()}</div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2 sm:p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-400 text-xs sm:text-sm flex items-center space-x-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </p>
            </div>
          )}

          {/* Already Verified State */}
          {isAlreadyVerified ? (
            <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mx-auto" />
              <div>
                <p className="text-sm sm:text-base text-white font-medium mb-2">
                  Verified
                </p>
                <p className="text-xs sm:text-sm text-gray-400 px-2">
                  Verification successful. Opening application form...
                </p>
              </div>
            </div>
          ) : isCheckingStatus ? (
            <div className="flex justify-center py-6 sm:py-8">
              <LoadingSpinner />
            </div>
          ) : hasApplied ? (
            <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto" />
              <div className="px-2">
                <p className="text-sm sm:text-base text-white font-medium mb-2">
                  Already Applied
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  You have already applied to this tender.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Code Input Section - shown after code is requested/sent */}
              {hasApprovedCode ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3 text-center">
                      Enter 8-character verification code
                    </label>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          id={`verify-code-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(
                              index,
                              e.target.value.toUpperCase(),
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-10 h-12 text-center text-lg font-bold bg-slate-800/50 border-2 border-cyan-400/20 rounded-xl text-white focus:outline-none focus:border-cyan-400/60 focus:bg-slate-800/70 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 uppercase shadow-lg"
                          placeholder="-"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleRequestCode}
                      disabled={isRequesting}
                      className="flex-1 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/30 text-cyan-400 font-medium rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isRequesting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner variant="inline" size="sm" />
                          <span>Requesting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Resend Code</span>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={handleVerifyCode}
                      disabled={isLoading || code.join("").length !== 8}
                      className="flex-1 py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner
                            variant="inline"
                            size="sm"
                            color="white"
                          />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Verify Code</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                  <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mx-auto" />
                  <div className="px-2">
                    <p className="text-sm sm:text-base text-white font-medium mb-2">
                      Request Verification Code
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mb-4">
                      We'll email you a code for this tender. Enter it here to
                      verify, then you can apply.
                    </p>
                    <button
                      onClick={handleRequestCode}
                      disabled={isRequesting}
                      className="w-full py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-cyan-400/30 text-cyan-400 font-medium rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isRequesting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner variant="inline" size="sm" />
                          <span>Requesting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Request Code</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
