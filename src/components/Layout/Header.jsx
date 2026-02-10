import { useState, useEffect, useMemo, useRef } from "react";
import { Bell, X, FileText, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { notificationApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { onNotificationsChanged } from "../../utils/notificationsBus";

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

  const fetchInFlightRef = useRef(false);

  // Fetch notifications via API (deduped)
  // silent: avoids showing dropdown loading state for background refreshes
  const fetchNotifications = async ({ silent = false } = {}) => {
    if (fetchInFlightRef.current) return;

    try {
      fetchInFlightRef.current = true;
      if (!silent) setNotifLoading(true);
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
        (a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0),
      );
      const onlyUnread = items.filter((x) => !x.isRead);
      const limited = onlyUnread.slice(0, 10);
      setNotifications(limited);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifError("Failed to load notifications");
    } finally {
      fetchInFlightRef.current = false;
      if (!silent) setNotifLoading(false);
    }
  };

  // Fetch once on mount (best-effort) and again when auth user is known
  // Some app states set `user` after initial render, but token is already present.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchNotifications({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    fetchNotifications({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Refetch when returning to the tab / window, or when other pages mutate notifications
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications({ silent: true });
      }
    };

    const onFocus = () => {
      fetchNotifications({ silent: true });
    };

    const offBus = onNotificationsChanged(() => {
      fetchNotifications({ silent: true });
    });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      offBus();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
          setNotifOpen((v) => {
            const next = !v;
            // Refetch when user opens the notifications UI
            if (next) fetchNotifications();
            return next;
          });
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
      
        {notifOpen && (
          <div
            ref={notifMenuRef}
            className="fixed lg:absolute right-2 lg:right-0 top-16 lg:top-auto lg:mt-2 w-80 sm:w-96 z-[9999]"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
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
          </div>
        )}
      
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
      
        {userMenuOpen && (
          <div
            ref={userMenuRef}
            className="fixed lg:absolute right-2 lg:right-0 top-16 lg:top-auto lg:mt-2 w-72 z-[9999]"
            style={{ pointerEvents: "auto" }}
          >
            <div
              className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
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
          </div>
        )}
      
    </div>
  );

  return (
    <>
      <header
        onClick={() => {
          if (isMobile && isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
          }
        }}
        className={`relative lg:sticky lg:top-0 z-40 bg-slate-900/70 backdrop-blur-xl border-b border-white/[0.06] p-3 sm:p-4 lg:px-8 lg:py-5 transition-all duration-300 ${
          isMobile && isMobileMenuOpen
            ? "blur-sm pointer-events-auto cursor-pointer"
            : ""
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
              <div
                className="flex items-center space-x-2"
              >
                {/* Notifications - Mobile */}
                <NotificationBell />

                {/* User Menu - Mobile */}
                <UserMenu />
              </div>
            </div>

            {/* Title row */}
            <div className="text-center">
              <h1
                className="text-xl font-bold text-white"
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-cyan-400/70 mt-1 text-sm"
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold text-white"
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-cyan-400/70 mt-1"
                >
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications - Desktop */}
              <NotificationBell />

              {/* User Menu - Desktop */}
              <div
              >
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      
        {showLogoutModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]"
            onClick={() => setShowLogoutModal(false)}
          >
            <div
              className="bg-gradient-to-b from-slate-900 to-slate-950 border border-red-400/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Confirm Logout
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      End your current session
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <div className="p-4 rounded-lg border border-red-400/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Are you sure you want to logout? You'll need to sign in again
                  to access your account.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg hover:bg-slate-800/70 hover:border-gray-400/40 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      
    </>
  );
};

export default Header;
