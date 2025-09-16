import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await authApi.me();
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (!res.token || !res.user) throw new Error("Invalid login response");

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);

      return res.user;
    } catch (error) {
      let message =
        error?.response?.data?.message || error.message || "Login failed";
      console.error("Login error:", message);
      throw new Error(message);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { user: userData, token } = await authApi.register(
        name,
        email,
        password,
        role
      );
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    console.log("User logged out");
  };

  const forgotPassword = async (email) => {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Failed to send reset email"
      );
    }
  };

  // ---------------- NEW OTP METHODS ----------------
  const verifyRegisterOTP = async (email, otp) => {
    try {
      const { user: userData, token } = await authApi.verifyRegisterOTP(
        email,
        otp
      );
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Invalid registration OTP"
      );
    }
  };

  const verifyResetOTP = async (email, otp) => {
    try {
      console.log("Verifying reset OTP for:", email, otp);
      const data = await authApi.verifyResetOTP(email, otp);
      console.log("Reset OTP verified:", data);
      return data;
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Invalid reset OTP");
    }
  };

  const resetPassword = async (email, otp, password) => {
    try {
      console.log("Resetting password for:", email);
      await authApi.resetPassword(email, otp, password);
      console.log("Password reset successful");
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Password reset failed"
      );
    }
  };

  const resendRegisterOTP = async (email) => {
    try {
      return await authApi.resendRegisterOTP(email);
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Failed to resend OTP");
    }
  };

  const resendResetOTP = async (email) => {
    try {
      return await authApi.resendResetOTP(email);
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Failed to resend reset OTP"
      );
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await authApi.updateMe(updates);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      return data.user;
    } catch (error) {
      throw new Error(
        error?.response?.data?.message || "Profile update failed"
      );
    }
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    forgotPassword,
    verifyRegisterOTP, // ✅ updated
    verifyResetOTP, // ✅ updated
    resetPassword,
    loading,
    resendRegisterOTP,
    resendResetOTP,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
