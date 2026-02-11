import React from "react";
import LoadingSpinner from "./UI/LoadingSpinner";
import useMinLoadingTime from "../utils/useMinLoadingTime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const showLoading = useMinLoadingTime(loading);

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  // If no user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // console.log("User is logged in:", user);
  // console.log("User role:", user.role);

  // If user role is not allowed
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
