/**
 * Extract user-friendly error message from API error response
 * @param {Error} error - The error object from API call
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = "An error occurred") => {
  // If error is already a string, return it
  if (typeof error === "string") {
    return error;
  }

  let errorMessage = defaultMessage;

  // Try to extract error message from various possible locations
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.message) {
    errorMessage = error.message;
  }

  // Handle specific error cases with user-friendly messages
  const statusCode = error.response?.status;

  // Email already exists
  if (
    errorMessage.toLowerCase().includes("email") &&
    (errorMessage.toLowerCase().includes("exist") ||
      errorMessage.toLowerCase().includes("already") ||
      errorMessage.toLowerCase().includes("duplicate"))
  ) {
    return "This email is already registered. Please use a different email or try logging in.";
  }

  // User not found
  if (
    errorMessage.toLowerCase().includes("user") &&
    errorMessage.toLowerCase().includes("not found")
  ) {
    return "User not found. Please check your credentials or register for a new account.";
  }

  // Invalid credentials
  if (
    errorMessage.toLowerCase().includes("invalid") &&
    (errorMessage.toLowerCase().includes("credential") ||
      errorMessage.toLowerCase().includes("password") ||
      errorMessage.toLowerCase().includes("email"))
  ) {
    return "The email or password you entered is incorrect. Please try again.";
  }

  // Incorrect password
  if (
    errorMessage.toLowerCase().includes("incorrect") ||
    errorMessage.toLowerCase().includes("wrong password")
  ) {
    return "The password you entered is incorrect. Please try again or reset your password.";
  }

  // Unauthorized
  if (statusCode === 401 || errorMessage.toLowerCase().includes("unauthorized")) {
    return "You are not authorized to perform this action. Please log in again.";
  }

  // Forbidden
  if (statusCode === 403 || errorMessage.toLowerCase().includes("forbidden")) {
    return "You don't have permission to perform this action.";
  }

  // Not found
  if (statusCode === 404 || errorMessage.toLowerCase().includes("not found")) {
    return "The requested resource was not found.";
  }

  // Bad request
  if (statusCode === 400) {
    if (errorMessage === defaultMessage || errorMessage.includes("status code 400")) {
      return "Invalid request. Please check your information and try again.";
    }
  }

  // Server error
  if (statusCode >= 500) {
    return "Server error. Please try again later or contact support if the problem persists.";
  }

  // Network error
  if (error.message === "Network Error" || !error.response) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Timeout
  if (errorMessage.toLowerCase().includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Token expired
  if (
    errorMessage.toLowerCase().includes("token") &&
    (errorMessage.toLowerCase().includes("expired") ||
      errorMessage.toLowerCase().includes("invalid"))
  ) {
    return "Your session has expired. Please log in again.";
  }

  // Validation errors
  if (errorMessage.toLowerCase().includes("validation")) {
    return errorMessage; // Keep validation messages as they are usually specific
  }

  // OTP errors
  if (errorMessage.toLowerCase().includes("otp")) {
    if (errorMessage.toLowerCase().includes("expired")) {
      return "OTP has expired. Please request a new one.";
    }
    if (errorMessage.toLowerCase().includes("invalid")) {
      return "Invalid OTP. Please check the code and try again.";
    }
  }

  // File upload errors
  if (errorMessage.toLowerCase().includes("file") || errorMessage.toLowerCase().includes("upload")) {
    return "File upload failed. Please check the file size and format.";
  }

  // Return the extracted or default message
  return errorMessage;
};

/**
 * Handle API error and show toast notification
 * @param {Error} error - The error object from API call
 * @param {Function} toast - Toast notification function
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {string} The error message that was displayed
 */
export const handleApiError = (error, toast, defaultMessage = "An error occurred") => {
  const errorMessage = getErrorMessage(error, defaultMessage);
  
  if (toast && typeof toast.error === "function") {
    toast.error(errorMessage);
  }
  
  return errorMessage;
};

/**
 * Log error for debugging purposes
 * @param {string} context - Context where error occurred (e.g., "Login", "Register")
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    stack: error.stack,
  });
};
