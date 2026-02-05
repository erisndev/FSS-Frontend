import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ---------------- REQUEST INTERCEPTOR ----------------
api.interceptors.request.use((config) => {
  // Don't add auth header for public endpoints
  const publicEndpoints = [
    "/team-members/invitations/",
    "/team-auth/team-members",
  ];

  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (!isPublicEndpoint) {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    // Check if token has expired
    if (token && tokenExpiry) {
      if (new Date().getTime() > parseInt(tokenExpiry)) {
        console.log("Token expired, clearing storage and redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
        localStorage.removeItem("tokenExpiry");
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      const message =
        error.response?.data?.message ||
        "You don't have permission to perform this action";
      toast.error(message);
      console.error("Permission denied:", message);
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
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
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
  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
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

// ---------------- TEAM AUTH API ----------------
export const teamAuthApi = {
  getTeamMembersForLogin: async (email) => {
    const res = await api.post("/team-auth/team-members", { email });
    return res.data;
  },
  teamLogin: async (email, memberId, password) => {
    const res = await api.post("/team-auth/team-login", {
      email,
      memberId,
      password,
    });
    return res.data;
  },
};

// ---------------- ORGANIZATION API ----------------
export const organizationApi = {
  getOrganization: async (id) => {
    const res = await api.get(`/organizations/${id || ""}`);
    return res.data;
  },
  updateOrganization: async (id, data) => {
    const res = await api.put(`/organizations/${id}`, data);
    return res.data;
  },
  deactivateOrganization: async (id) => {
    const res = await api.delete(`/organizations/${id}`);
    return res.data;
  },
  getOrganizationStats: async (id) => {
    const res = await api.get(`/organizations/${id}/stats`);
    return res.data;
  },
};

// ---------------- TEAM MEMBERS API ----------------
export const teamMemberApi = {
  getPermissionPresets: async () => {
    const res = await api.get("/team-members/presets/permissions");
    return res.data;
  },
  addTeamMember: async (organizationId, memberData) => {
    const res = await api.post(
      `/team-members/${organizationId}/members`,
      memberData
    );
    return res.data;
  },
  getTeamMembers: async (organizationId) => {
    const res = await api.get(`/team-members/${organizationId}/members`);
    return res.data;
  },
  getTeamMember: async (organizationId, memberId) => {
    const res = await api.get(
      `/team-members/${organizationId}/members/${memberId}`
    );
    return res.data;
  },
  updateMemberPermissions: async (organizationId, memberId, data) => {
    const res = await api.put(
      `/team-members/${organizationId}/members/${memberId}`,
      data
    );
    return res.data;
  },
  removeTeamMember: async (organizationId, memberId) => {
    const res = await api.delete(
      `/team-members/${organizationId}/members/${memberId}`
    );
    return res.data;
  },
  getTeamMemberActivity: async (organizationId, memberId) => {
    const res = await api.get(
      `/team-members/${organizationId}/members/${memberId}/activity`
    );
    return res.data;
  },
  // Invitation APIs
  sendInvitation: async (organizationId, invitationData) => {
    const res = await api.post(
      `/team-members/${organizationId}/invitations`,
      invitationData
    );
    return res.data;
  },
  getPendingInvitations: async (organizationId) => {
    const res = await api.get(`/team-members/${organizationId}/invitations`);
    return res.data;
  },
  resendInvitation: async (organizationId, invitationId) => {
    const res = await api.post(
      `/team-members/${organizationId}/invitations/${invitationId}/resend`
    );
    return res.data;
  },
  cancelInvitation: async (organizationId, invitationId) => {
    const res = await api.delete(
      `/team-members/${organizationId}/invitations/${invitationId}`
    );
    return res.data;
  },
  validateInvitation: async (token) => {
    const res = await api.get(`/team-members/invitations/${token}/validate`);
    return res.data;
  },
  acceptInvitation: async (token, password) => {
    const res = await api.post(`/team-members/invitations/${token}/accept`, {
      password,
    });
    return res.data;
  },
};

// ---------------- ACTIVITY LOG API ----------------
export const activityLogApi = {
  getOrganizationActivities: async (organizationId) => {
    const res = await api.get(`/activity-logs/${organizationId}`);
    return res.data;
  },
  getMemberActivities: async (organizationId, memberId) => {
    const res = await api.get(
      `/activity-logs/${organizationId}/member/${memberId}`
    );
    return res.data;
  },
  getResourceActivities: async (resourceId) => {
    const res = await api.get(`/activity-logs/resource/${resourceId}`);
    return res.data;
  },
  getActivityStats: async (organizationId) => {
    const res = await api.get(`/activity-logs/${organizationId}/stats`);
    return res.data;
  },
  exportActivities: async (organizationId) => {
    const res = await api.get(`/activity-logs/${organizationId}/export`);
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
    
    // Document field names
    const documentFields = [
      'bidFileDocuments',
      'compiledDocuments',
      'financialDocuments',
      'technicalProposal',
      'proofOfExperience'
    ];
    
    // Append all non-document fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!documentFields.includes(key)) {
        data.append(key, value);
      }
    });
    
    // Append individual document files
    documentFields.forEach((fieldName) => {
      if (formData[fieldName] && formData[fieldName] instanceof File) {
        data.append(fieldName, formData[fieldName]);
      }
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
    
    // Document field names for applications
    const documentFields = [
      'bidFileDocuments',
      'compiledDocuments',
      'financialDocuments',
      'technicalProposal',
      'proofOfExperience',
      'supportingDocuments'
    ];
    
    // Append all non-document fields
    for (const [key, value] of Object.entries(formData)) {
      if (!documentFields.includes(key)) {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value);
        }
      }
    }
    
    // Append individual document files
    documentFields.forEach((fieldName) => {
      if (formData[fieldName] && formData[fieldName] instanceof File) {
        data.append(fieldName, formData[fieldName]);
      }
    });
    
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
  getAllRequests: async () => {
    const res = await api.get(`/verification-code/requests`);
    return res.data;
  },
  approveRequest: async (requestId) => {
    const res = await api.put(`/verification-code/approve/${requestId}`);
    return res.data;
  },
  rejectRequest: async (requestId, reason) => {
    const res = await api.put(`/verification-code/reject/${requestId}`, {
      reason,
    });
    return res.data;
  },
};

export default api;
