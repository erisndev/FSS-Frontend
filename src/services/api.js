import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ---------------- REQUEST INTERCEPTOR ----------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------- RESPONSE INTERCEPTOR ----------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      const url = error.config?.url || "";
      const isAuthEndpoint = url.startsWith("/auth/");

      if (token && !isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------------- AUTH API ----------------
export const authApi = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  register: async (name, email, password, role) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    return res.data;
  },
  verifyRegisterOTP: async (email, otp) => {
    const res = await api.post("/auth/verify-register-otp", { email, otp });
    return res.data;
  },
  verifyResetOTP: async (email, otp) => {
    const res = await api.post("/auth/verify-reset-otp", { email, otp });
    return res.data;
  },
  resendRegisterOTP: async (email) => {
    const res = await api.post("/auth/resend-register-otp", { email });
    return res.data;
  },
  resendResetOTP: async (email) => {
    const res = await api.post("/auth/resend-reset-otp", { email });
    return res.data;
  },
  forgotPassword: async (email) => {
    await api.post("/auth/request-password-reset", { email });
  },
  resetPassword: async (email, otp, password) => {
    await api.post("/auth/reset-password", { email, otp, password });
  },
  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  updateMe: async (data) => {
    const res = await api.put("/auth/me", data);
    return res.data;
  },
};

// ---------------- TENDERS API ----------------
export const tenderApi = {
  getTenders: async (filters) => {
    const res = await api.get("/tenders", { params: filters });
    return res.data;
  },
  getTender: async (id) => {
    const res = await api.get(`/tenders/${id}`);
    return res.data;
  },
  createTender: async (formData) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "documents") data.append(key, value);
    });
    const documents = formData.documents || [];
    documents.forEach((doc) => {
      if (doc?.file) data.append("documents", doc.file);
    });
    const res = await api.post("/tenders", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  updateTender: async (id, formData) => {
    const res = await api.put(`/tenders/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  deleteTender: async (id) => {
    await api.delete(`/tenders/${id}`);
  },
  getMyTenders: async () => {
    const res = await api.get("/tenders/my");
    return res.data;
  },
};

// ---------------- APPLICATION API ----------------
export const applicationApi = {
  applyToTender: async (tenderId, formData) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key === "files") {
        value.forEach((file) => {
          if (file instanceof File) data.append("files", file);
        });
      } else if (Array.isArray(value)) {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value);
      }
    }
    const res = await api.post(`/applications/${tenderId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getMyApplications: async () => {
    const res = await api.get("/applications/my");
    return res.data;
  },
  getTenderApplications: async (tenderId) => {
    const res = await api.get(`/applications/received/${tenderId}`);
    return res.data;
  },
  getAllApplications: async () => {
    const res = await api.get("/applications");
    return res.data;
  },
  updateApplicationStatus: async (id, status, comment) => {
    const payload = { status };
    if (comment !== undefined && comment !== null) {
      payload.comment = comment;
      payload.message = comment;
    }
    const res = await api.put(`/applications/${id}/status`, payload);
    return res.data;
  },
  withdrawApplication: async (id) => {
    await api.delete(`/applications/${id}`);
  },
};

// ---------------- USERS API ----------------
export const userApi = {
  getUsers: async () => {
    const res = await api.get("/auth");
    return res.data;
  },
  getUser: async (id) => {
    const res = await api.get(`/auth/${id}`);
    return res.data;
  },
  createUser: async (user) => {
    const res = await api.post("/auth/register", user);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/auth/${id}`, data);
    return res.data;
  },
  deleteUser: async (id) => {
    await api.delete(`/auth/${id}`);
  },
};

// ---------------- NOTIFICATIONS API ----------------
export const notificationApi = {
  getMyNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },
  clearNotifications: async () => {
    const res = await api.delete("/notifications/clear");
    return res.data;
  },
};

// ---------------- VERIFICATION CODE API ----------------
export const verificationCodeApi = {
  // Bidder actions
  requestCode: async (tenderId) => {
    const res = await api.post(`/verification-code/request/${tenderId}`);
    return res.data;
  },
  verifyCode: async (tenderId, code) => {
    const res = await api.post(`/verification-code/verify/${tenderId}`, {
      verificationCode: code,
    });
    return res.data;
  },

  checkStatus: async (tenderId) => {
    const res = await api.get(`/verification-code/status/${tenderId}`);
    return res.data;
  },
  getMyRequests: async () => {
    const res = await api.get(`/verification-code/my-requests`);
    return res.data;
  },

  // Admin/Issuer actions
  getAllRequests: async () => {
    const res = await api.get(`/verification-code/requests`);
    return res.data;
  },
  approveRequest: async (requestId) => {
    const res = await api.put(`/verification-code/approve/${requestId}`);
    return res.data;
  },
  rejectRequest: async (requestId) => {
    const res = await api.put(`/verification-code/reject/${requestId}`);
    return res.data;
  },
};

export default api;
