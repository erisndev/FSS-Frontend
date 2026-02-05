/**
 * Application-wide constants
 * Centralized location for magic numbers and strings
 */

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    IMAGES: ['image/jpeg', 'image/png', 'image/jpg'],
    ALL: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/jpg'],
  },
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

// Tender Status
export const TENDER_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  DRAFT: 'DRAFT',
};

// Verification Request Status
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  VERIFIED: 'VERIFIED',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ISSUER: 'issuer',
  BIDDER: 'bidder',
  TEAM_MEMBER: 'team_member',
};

// Timing Constants (in milliseconds)
export const TIMING = {
  VERIFICATION_DELAY: 500,
  TOAST_DURATION: 3000,
  TOAST_DURATION_LONG: 5000,
  POLLING_INTERVAL: 30000, // 30 seconds
  POLLING_INTERVAL_SHORT: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  OTP_RESEND_DELAY: 60000, // 60 seconds
  TOKEN_REFRESH_INTERVAL: 300000, // 5 minutes
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  TENDERS: '/tenders',
  APPLICATIONS: '/applications',
  NOTIFICATIONS: '/notifications',
  VERIFICATION: '/verification-code',
  USERS: '/users',
  TEAM: '/team-members',
  ORGANIZATION: '/organizations',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  TOKEN_EXPIRY: 'tokenExpiry',
  OTP_TIMESTAMP: 'otpTimestamp',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
};

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  OTP_LENGTH: 6,
  VERIFICATION_CODE_LENGTH: 8,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^[0-9]{10,15}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Document Types
export const DOCUMENT_TYPES = {
  BID_FILE: 'bidFileDocuments',
  COMPILED: 'compiledDocuments',
  FINANCIAL: 'financialDocuments',
  TECHNICAL: 'technicalProposal',
  PROOF_OF_EXPERIENCE: 'proofOfExperience',
  SUPPORTING: 'supportingDocuments',
};

// Document Labels
export const DOCUMENT_LABELS = {
  [DOCUMENT_TYPES.BID_FILE]: 'Bid File Documents',
  [DOCUMENT_TYPES.COMPILED]: 'Compiled Documents',
  [DOCUMENT_TYPES.FINANCIAL]: 'Financial Documents',
  [DOCUMENT_TYPES.TECHNICAL]: 'Technical Proposal',
  [DOCUMENT_TYPES.PROOF_OF_EXPERIENCE]: 'Proof of Experience (Reference Letter)',
  [DOCUMENT_TYPES.SUPPORTING]: 'Supporting Documents',
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid document.',
  REQUIRED_FIELD: 'This field is required.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTRATION_SUCCESS: 'Registration successful!',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  SUBMIT_SUCCESS: 'Submitted successfully',
  UPLOAD_SUCCESS: 'File uploaded successfully',
};

export default {
  FILE_UPLOAD,
  APPLICATION_STATUS,
  TENDER_STATUS,
  VERIFICATION_STATUS,
  USER_ROLES,
  TIMING,
  API_ENDPOINTS,
  STORAGE_KEYS,
  PAGINATION,
  VALIDATION,
  DOCUMENT_TYPES,
  DOCUMENT_LABELS,
  Z_INDEX,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
