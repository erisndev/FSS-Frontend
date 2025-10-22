import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { notificationApi } from "../../services/api";
import { useNavigate } from "react-router-dom";

// Relative time helper
function timeAgo(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  const yr = Math.floor(mon / 12);
  return `${yr}y ago`;
}

const Header = ({ title, subtitle, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const navigate = useNavigate();
  const notificationsPath =
    role === "admin"
      ? "/admin/notifications"
      : role === "issuer"
      ? "/issuer/notifications"
      : "/bidder/notifications";

  const [isMobile, setIsMobile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");

  const notifBtnRef = useRef(null);
  const notifMenuRef = useRef(null);
  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Click outside to close notifications
  useEffect(() => {
    const handler = (e) => {
      if (!notifOpen) return;
      const btn = notifBtnRef.current;
      const menu = notifMenuRef.current;
      if (btn && btn.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Click outside to close user menu
  useEffect(() => {
    const handler = (e) => {
      if (!userMenuOpen) return;
      const btn = userBtnRef.current;
      const menu = userMenuRef.current;
      if (btn && btn.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;
      setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Fetch notifications via API
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      setNotifError("");
      const list = await notificationApi.getMyNotifications();
      const items = (list || []).map((n) => ({
        id: n._id || n.id,
        title:
          n.title ||
          (n.type ? String(n.type).replace(/[_:]/g, " ") : "Notification"),
        message: n.message || n.body || n.description || "",
        time: n.createdAt
          ? new Date(n.createdAt)
          : n.time
          ? new Date(n.time)
          : new Date(),
        icon: FileText,
        isRead: n.isRead === true,
      }));
      items.sort(
        (a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0)
      );
      const onlyUnread = items.filter((x) => !x.isRead);
      const limited = onlyUnread.slice(0, 10);
      setNotifications(limited);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifError("Failed to load notifications");
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Changed to 30 seconds to reduce re-renders
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setUserMenuOpen(false);
    const profilePath =
      role === "admin"
        ? "/admin/profile"
        : role === "issuer"
        ? "/issuer/profile"
        : "/bidder/profile";
    navigate(profilePath);
  };

  const handleViewNotification = (n) => {
    setNotifOpen(false);
    navigate(notificationsPath);
  };

  const handleMarkAsRead = async (n) => {
    try {
      await notificationApi.markAsRead(n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    } catch (e) {
      console.error("Failed to mark as read", e);
      setNotifError("Failed to mark as read");
    }
  };

  const NotificationBell = () => (
    <div className="relative">
      <button
        ref={notifBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setNotifOpen((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={notifOpen}
        className="relative p-2 bg-slate-800/50 border border-cyan-400/20 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300"
      >
        <Bell className="w-5 h-5 text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full ring-2 ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence mode="wait">
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            ref={notifMenuRef}
            className="fixed lg:absolute right-2 lg:right-0 top-16 lg:top-auto lg:mt-2 w-80 sm:w-96 z-[9999]"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-cyan-400/10 flex items-center justify-between">
                <span className="text-white font-semibold">Notifications</span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading...
                  </div>
                ) : notifError ? (
                  <div className="p-4 text-center text-red-400">
                    {notifError}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={`${n.id}`}
                      className="flex items-start space-x-3 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        {n.icon ? (
                          <n.icon className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {n.title}
                        </div>
                        <div className="text-gray-400 text-xs truncate">
                          {n.message}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-gray-500 text-[11px]">
                            {timeAgo(n.time)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewNotification(n)}
                              className="text-cyan-400 hover:text-cyan-300 text-[11px]"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleMarkAsRead(n)}
                              className="text-gray-300 hover:text-white text-[11px]"
                            >
                              Mark as read
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-cyan-400/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate(notificationsPath);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  View all
                </button>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const UserMenu = () => (
    <div className="relative">
      <button
        ref={userBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setUserMenuOpen((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={userMenuOpen}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:ring-2 hover:ring-cyan-400/50 transition-all duration-300"
      >
        {getUserInitials(user?.name)}
      </button>

      {/* Dropdown */}
      <AnimatePresence mode="wait">
        {userMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            ref={userMenuRef}
            className="fixed lg:absolute right-2 lg:right-0 top-16 lg:top-auto lg:mt-2 w-72 z-[9999]"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* User Info Section */}
              <div className="px-4 py-4 border-b border-cyan-400/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {getUserInitials(user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {user?.name}
                    </p>
                    <p className="text-cyan-400/70 text-sm capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-cyan-400/10">
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white text-sm truncate">{user?.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-2">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-cyan-400/10 transition-colors text-left"
                >
                  <User className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          if (isMobile && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }}
        className={`relative lg:sticky lg:top-0 z-40 bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-xl border-b border-cyan-400/20 p-3 sm:p-4 lg:p-6 transition-all duration-300 ${
          isMobile && isMobileMenuOpen ? 'blur-sm pointer-events-auto cursor-pointer' : ''
        }`}
      >
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Top row with hamburger space and user info */}
          <div className="flex items-center justify-between">
            {/* Left space for hamburger (positioned by Sidebar component) */}
            <div className="w-10 h-10 flex-shrink-0"></div>

            {/* User Info - Compact on mobile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2"
            >
              {/* Notifications - Mobile */}
              <NotificationBell />
              
              {/* User Menu - Mobile */}
              <UserMenu />
            </motion.div>
          </div>

          {/* Title row */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-white"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-cyan-400/70 mt-1 text-sm"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

                  </div>
      ) : (
        /* Desktop Layout */
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-white"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-cyan-400/70 mt-1"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            
            {/* Notifications - Desktop */}
            <NotificationBell />

            {/* User Menu - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <UserMenu />
            </motion.div>
          </div>
        </div>
      )}

      </motion.header>

      {/* Logout Confirmation Modal - Outside header to avoid positioning issues */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-slate-900 p-6 rounded-xl w-80 max-w-[90vw] text-center border border-cyan-400/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Confirm Logout
              </h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
