import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { verificationCodeApi } from "../../services/api";
import toast from "react-hot-toast";

const VerificationModal = ({ isOpen, onClose, tender, onVerified }) => {
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [existingRequest, setExistingRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // null, 'pending', 'approved', 'rejected', 'verified'
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
      // Don't reset verification status if already verified
      if (!isAlreadyVerified) {
        setHasRequestedCode(false);
        setRequestStatus(null);
        setExistingRequest(null);
      }
    }
  }, [isOpen, isAlreadyVerified]);

  const checkVerificationStatus = async () => {
    setIsCheckingStatus(true);
    try {
      // First check if user has already verified this tender via status API
      try {
        const statusResponse = await verificationCodeApi.checkStatus(tender._id);
        console.log("Verification status check:", statusResponse);
        
        if (statusResponse.isVerified || statusResponse.codeUsed) {
          // User has already verified this tender
          setIsAlreadyVerified(true);
          setRequestStatus("verified");
          setHasRequestedCode(true);
          
          // Automatically proceed to application after a brief delay
          setTimeout(() => {
            onVerified();
          }, 500);
          return; // Exit early since user is already verified
        }
      } catch (statusError) {
        // Status check might fail if no request exists yet, that's okay
        console.log("No existing verification status found");
      }

      // If not verified, check for existing requests
      const requests = await verificationCodeApi.getMyRequests();
      const foundRequest = requests.find(
        (req) => req.tenderId === tender._id || req.tender?._id === tender._id
      );

      if (foundRequest) {
        setHasRequestedCode(true);
        const status = foundRequest.status?.toLowerCase() || "pending";
        
        // Double-check if the code was already used
        if (foundRequest.codeUsed || foundRequest.isUsed || foundRequest.verified) {
          setRequestStatus("verified");
          setIsAlreadyVerified(true);
          // Auto proceed after a brief delay
          setTimeout(() => {
            onVerified();
          }, 500);
        } else {
          setRequestStatus(status);
        }
        setExistingRequest(foundRequest);
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
      setHasRequestedCode(true);
      setRequestStatus("pending");
      toast.success(
        "Verification code request sent! Please wait for approval."
      );

      // Start checking for approval status
      startStatusPolling();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to request verification code";
      setError(message);
      toast.error(message);
    } finally {
      setIsRequesting(false);
    }
  };

  const startStatusPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const requests = await verificationCodeApi.getMyRequests();
        const currentRequest = requests.find(
          (req) => req.tenderId === tender._id || req.tender?._id === tender._id
        );

        if (currentRequest) {
          const status = currentRequest.status?.toLowerCase() || "pending";
          setRequestStatus(status);
          setExistingRequest(currentRequest);

          if (status === "approved") {
            clearInterval(pollInterval);
            toast.success(
              "Your request has been approved! Check your email for the verification code."
            );
          } else if (status === "rejected") {
            clearInterval(pollInterval);
            toast.error("Your verification request was rejected.");
          }
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
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
        "Verification successful! You can now apply for this tender."
      );
      
      // Mark as verified locally
      setIsAlreadyVerified(true);
      setRequestStatus("verified");
      
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
    switch (requestStatus) {
      case "pending":
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">Pending Approval</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">
              Approved - Check Email
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">Request Rejected</span>
          </div>
        );
      case "verified":
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm">Already Verified</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-cyan-400/20 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-cyan-400/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Tender Verification
                </h3>
                <p className="text-sm text-gray-400">
                  Verify access to apply for this tender
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Tender Info */}
            <div className="p-4 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
              <h4 className="text-sm font-medium text-cyan-400 mb-1">
                Applying for:
              </h4>
              <p className="text-white font-medium">{tender?.title}</p>
            </div>

            {/* Status Badge */}
            {requestStatus && (
              <>
                <div className="flex justify-center">{getStatusBadge()}</div>

                {/* Display code if approved and available */}
                {requestStatus === "approved" && existingRequest?.code && (
                  <div className="mt-4 p-4 bg-slate-900/50 border border-green-400/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2 text-center">
                      Your Verification Code
                    </p>
                    <div className="text-center">
                      <p className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                        **{existingRequest.code}**
                      </p>
                      <div className="w-32 h-px bg-green-400/30 mt-2 mx-auto"></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg"
              >
                <p className="text-red-400 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              </motion.div>
            )}

            {/* Already Verified State */}
            {isAlreadyVerified && requestStatus === "verified" ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                <div>
                  <p className="text-white font-medium mb-2">
                    Already Verified
                  </p>
                  <p className="text-gray-400 text-sm">
                    You have already verified access to this tender. Proceeding to application form...
                  </p>
                </div>
              </div>
            ) : isCheckingStatus ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Code Input Section - Show only if approved but not yet verified */}
                {(hasRequestedCode && requestStatus === "approved" && !isAlreadyVerified) ||
                (requestStatus === null && !isAlreadyVerified) ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                        Enter 8-character verification code
                      </label>
                      <div className="flex justify-center space-x-1 flex-wrap">
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
                                e.target.value.toUpperCase()
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-10 h-12 text-center text-lg font-bold bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 uppercase"
                            placeholder="-"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {!hasRequestedCode && (
                        <button
                          onClick={handleRequestCode}
                          disabled={isRequesting}
                          className="flex-1 py-3 bg-slate-800/50 border border-cyan-400/30 text-cyan-400 font-medium rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {isRequesting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                              <span>Requesting...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <Lock className="w-4 h-4" />
                              <span>Request Code</span>
                            </div>
                          )}
                        </button>
                      )}

                      <button
                        onClick={handleVerifyCode}
                        disabled={isLoading || code.join("").length !== 8}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Verify Code</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ) : requestStatus === "pending" ? (
                  <div className="text-center py-8 space-y-4">
                    <Clock className="w-12 h-12 text-yellow-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium mb-2">
                        Waiting for Approval
                      </p>
                      <p className="text-gray-400 text-sm">
                        Your verification request is being reviewed. You'll
                        receive a code via email once approved.
                      </p>
                    </div>
                  </div>
                ) : requestStatus === "rejected" ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                    <div>
                      <p className="text-white font-medium mb-2">
                        Request Rejected
                      </p>
                      <p className="text-gray-400 text-sm mb-4">
                        Your verification request was not approved. Please
                        contact support for assistance.
                      </p>
                      <button
                        onClick={handleRequestCode}
                        disabled={isRequesting}
                        className="px-4 py-2 bg-slate-800/50 border border-cyan-400/30 text-cyan-400 font-medium rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
                      >
                        Request Again
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Help Text */}
                {!hasRequestedCode && requestStatus === null && !isAlreadyVerified && (
                  <p className="text-center text-gray-400 text-sm">
                    Don't have a code? Click "Request Code" to get one.
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VerificationModal;