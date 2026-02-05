import { format } from "date-fns";

/**
 * Safely formats a date string or Date object
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: "MMM dd, yyyy")
 * @returns {string} Formatted date string or fallback text
 */
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";
  return format(d, formatStr);
};

/**
 * Safely formats a date with time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

/**
 * Safely formats a date for display in tables
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatTableDate = (date) => {
  return formatDate(date, "MMM dd, yyyy");
};

/**
 * Safely formats a date for short display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatShortDate = (date) => {
  return formatDate(date, "MMM dd");
};

/**
 * Calculate days until a deadline
 * @param {string|Date} deadline - The deadline date
 * @returns {number} Number of days until deadline (0 if invalid)
 */
export const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return 0;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return 0;
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
