import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, teamAuthApi, teamMemberApi } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async (userData) => {
    if (!userData?.organizationId) {
      setPermissions(null);
      return;
    }

    try {
      const members = await teamMemberApi.getTeamMembers(
        userData.organizationId,
      );
      const current = members?.find(
        (m) =>
          m.user?._id === userData._id ||
          m.userId === userData._id ||
          m._id === userData?.memberId,
      );
      setPermissions(current?.permissions || null);
    } catch (e) {
      console.error("Failed to load permissions", e);
      setPermissions(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const tokenExpiry = localStorage.getItem("tokenExpiry");

        if (token) {
          // Check if token has expired
          if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
            console.log("Token has expired, logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("tokenExpiry");
            setPermissions(null);
            setLoading(false);
            return;
          }

          const userData = await authApi.me();
          setUser(userData);
          await fetchPermissions(userData);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const res = await authApi.login(normalizedEmail, password);

      // Check if this is a redirect response (not an error, but a redirect instruction)
      if (res.redirectToTeamLogin) {
        // Return the redirect data instead of throwing an error
        return {
          redirectToTeamLogin: true,
          organizationEmail: res.organizationEmail,
          organizationName: res.organizationName,
          message: res.message,
        };
      }

      if (!res.token || !res.user) throw new Error("Invalid login response");

      // Set token expiry to 24 hours from now
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      setUser(res.user);
      await fetchPermissions(res.user);

      return res.user;
    } catch (error) {
      let message =
        error?.response?.data?.message || error.message || "Login failed";
      console.error("Login error:", message);
      // Throw the original error object so we can access response data
      throw error;
    }
  };

  const teamLogin = async (email, memberId, password) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const res = await teamAuthApi.teamLogin(
        normalizedEmail,
        memberId,
        password,
      );
      if (!res.token || !res.user) throw new Error("Invalid login response");

      // Set token expiry to 24 hours from now
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      setUser(res.user);
      await fetchPermissions(res.user);

      return res.user;
    } catch (error) {
      let message =
        error?.response?.data?.message || error.message || "Team login failed";
      console.error("Team login error:", message);
      throw new Error(message);
    }
  };

  const getTeamMembers = async (email) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const res = await teamAuthApi.getTeamMembersForLogin(normalizedEmail);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  };

  const isTeamLeader = () => {
    // Check if user has memberRole set to team_leader
    // Only return true if memberRole is explicitly "team_leader"
    return user?.memberRole === "team_leader";
  };

  const register = async (userData) => {
    try {
      console.log("Registering user with data:", userData);
      const { user: registeredUser, token } = await authApi.register(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(registeredUser));
      setUser(registeredUser);
      await fetchPermissions(registeredUser);
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    setUser(null);
    setPermissions(null);
    console.log("User logged out");
  };

  const forgotPassword = async (email) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      await authApi.forgotPassword(normalizedEmail);
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Failed to send reset email",
      );
    }
  };

  // ---------------- NEW OTP METHODS ----------------
  const verifyRegisterOTP = async (email, otp) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { user: userData, token } = await authApi.verifyRegisterOTP(
        normalizedEmail,
        otp,
      );

      // Set token expiry to 24 hours from now
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      setUser(userData);
      await fetchPermissions(userData);
      return userData;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Invalid registration OTP",
      );
    }
  };

  const verifyResetOTP = async (email, otp) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Verifying reset OTP for:", normalizedEmail, otp);
      const data = await authApi.verifyResetOTP(normalizedEmail, otp);
      console.log("Reset OTP verified:", data);
      return data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Invalid reset OTP");
    }
  };

  const resetPassword = async (email, otp, password) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Resetting password for:", normalizedEmail);
      await authApi.resetPassword(normalizedEmail, otp, password);
      console.log("Password reset successful");
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Password reset failed",
      );
    }
  };

  const resendRegisterOTP = async (email) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      return await authApi.resendRegisterOTP(normalizedEmail);
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Failed to resend OTP");
    }
  };

  const resendResetOTP = async (email) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      return await authApi.resendResetOTP(normalizedEmail);
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Failed to resend reset OTP",
      );
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await authApi.updateMe(updates);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        await fetchPermissions(data.user);
      }
      return data.user;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Profile update failed",
      );
    }
  };

  const value = {
    user,
    permissions,
    setUser,
    login,
    teamLogin,
    getTeamMembers,
    register,
    logout,
    forgotPassword,
    verifyRegisterOTP,
    verifyResetOTP,
    resetPassword,
    loading,
    resendRegisterOTP,
    resendResetOTP,
    updateProfile,
    hasPermission,
    isTeamLeader,
    fetchPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
