/**
 * Centralized error handling utility
 * Provides consistent error handling across the application
 */

import toast from "react-hot-toast";
import { ERROR_MESSAGES, TIMING } from "../constants";
import logger from "./logger";

/**
 * Handle API errors with consistent messaging
 * @param {Error} error - The error object
 * @param {string} customMessage - Optional custom error message
 * @param {boolean} showToast - Whether to show toast notification
 * @returns {string} The error message
 */
export const handleApiError = (
  error,
  customMessage = null,
  showToast = true
) => {
  let message = customMessage || ERROR_MESSAGES.GENERIC_ERROR;

  // Extract error message from different error formats
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }

  // Handle specific HTTP status codes
  if (error.response?.status === 401) {
    message = ERROR_MESSAGES.UNAUTHORIZED;
  } else if (error.response?.status === 403) {
    message = ERROR_MESSAGES.UNAUTHORIZED;
  } else if (error.response?.status === 404) {
    message = customMessage || "Resource not found";
  } else if (error.response?.status === 500) {
    message = "Server error. Please try again later.";
  } else if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
    message = ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Show toast notification
  if (showToast) {
    toast.error(message, {
      duration: TIMING.TOAST_DURATION_LONG,
    });
  }

  // Log error in development
  logger.error("API Error:", {
    message,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error,
  });

  return message;
};

/**
 * Handle form validation errors
 * @param {Object} errors - Validation errors object
 * @param {boolean} showToast - Whether to show toast notification
 */
export const handleValidationErrors = (errors, showToast = true) => {
  const errorMessages = Object.values(errors)
    .map((error) => error.message || error)
    .filter(Boolean);

  if (errorMessages.length > 0 && showToast) {
    toast.error(errorMessages[0], {
      duration: TIMING.TOAST_DURATION,
    });
  }

  logger.warn("Validation Errors:", errors);
  return errorMessages;
};

/**
 * Handle file upload errors
 * @param {Error} error - The error object
 * @param {string} fileName - Name of the file
 */
export const handleFileUploadError = (error, fileName = "file") => {
  let message = `Failed to upload ${fileName}`;

  if (error.message?.includes("size")) {
    message = ERROR_MESSAGES.FILE_TOO_LARGE;
  } else if (error.message?.includes("type")) {
    message = ERROR_MESSAGES.INVALID_FILE_TYPE;
  }

  toast.error(message, {
    duration: TIMING.TOAST_DURATION,
  });

  logger.error("File Upload Error:", error);
  return message;
};

/**
 * Handle network errors
 * @param {Error} error - The error object
 */
export const handleNetworkError = (error) => {
  const message = ERROR_MESSAGES.NETWORK_ERROR;

  toast.error(message, {
    duration: TIMING.TOAST_DURATION_LONG,
  });

  logger.error("Network Error:", error);
  return message;
};

/**
 * Handle authentication errors
 * @param {Error} error - The error object
 */
export const handleAuthError = (error) => {
  let message = "Authentication failed";

  if (error.response?.status === 401) {
    message = "Invalid credentials";
  } else if (error.response?.status === 403) {
    message = ERROR_MESSAGES.UNAUTHORIZED;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  }

  toast.error(message, {
    duration: TIMING.TOAST_DURATION,
  });

  logger.error("Auth Error:", error);
  return message;
};

/**
 * Create an error boundary fallback component
 * @param {Error} error - The error object
 * @param {Function} resetErrorBoundary - Function to reset error boundary
 */
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-800/50 border border-red-400/20 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-400 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default {
  handleApiError,
  handleValidationErrors,
  handleFileUploadError,
  handleNetworkError,
  handleAuthError,
  ErrorFallback,
};
