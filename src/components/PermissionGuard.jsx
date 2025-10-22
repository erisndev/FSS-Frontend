import React from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 * 
 * @param {string} permission - The permission to check (e.g., "canCreateTenders")
 * @param {React.ReactNode} children - The content to render if permission is granted
 * @param {React.ReactNode} fallback - Optional content to render if permission is denied
 */
const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  if (!permission) {
    // If no permission specified, render children
    return <>{children}</>;
  }

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
