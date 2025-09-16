import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Landing Page
import LandingPage from "./pages/Landing/LandingPage";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OTPVerification from "./pages/Auth/OTPVerification";
import ResetPassword from "./pages/Auth/ResetPassword";

// Bidder Pages
import BidderDashboard from "./pages/Bidder/BidderDashboard";
import BrowseTenders from "./pages/Bidder/BrowseTenders";
import MyApplications from "./pages/Bidder/MyApplications";
import Notifications from "./pages/Bidder/Notifications";

// Issuer Pages
import IssuerDashboard from "./pages/Issuer/IssuerDashboard";
import CreateTender from "./pages/Issuer/CreateTender";
import ManageTenders from "./pages/Issuer/ManageTenders";
import ReviewApplications from "./pages/Issuer/ReviewApplications";
import Analytics from "./pages/Issuer/Analytics";
import EditTender from "./components/UI/EditTender";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import TenderManagement from "./pages/Admin/TenderManagement";
import ApplicationManagement from "./pages/Admin/ApplicationManagement";
import SystemSettings from "./pages/Admin/SystemSettings";
import AdminNotifications from "./pages/Admin/Notifications";
import IssuerNotifications from "./pages/Issuer/Notifications";

// Shared Pages
import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Bidder Routes */}
          <Route
            path="/bidder"
            element={
              <ProtectedRoute roles={["bidder"]}>
                <BidderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidder/tenders"
            element={
              <ProtectedRoute roles={["bidder"]}>
                <BrowseTenders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidder/applications"
            element={
              <ProtectedRoute roles={["bidder"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidder/profile"
            element={
              <ProtectedRoute roles={["bidder"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidder/notifications"
            element={
              <ProtectedRoute roles={["bidder"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Issuer Routes */}
          <Route
            path="/issuer"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <IssuerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/create-tender"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <CreateTender />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/edit-tender/:id"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <EditTender />
              </ProtectedRoute>
            }
          />

          <Route
            path="/issuer/tenders"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <ManageTenders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/applications"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <ReviewApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/analytics"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/notifications"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <IssuerNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issuer/profile"
            element={
              <ProtectedRoute roles={["issuer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tenders"
            element={
              <ProtectedRoute roles={["admin"]}>
                <TenderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ApplicationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Unauthorized Access
                  </h1>
                  <p className="text-gray-400">
                    You don't have permission to access this page.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
