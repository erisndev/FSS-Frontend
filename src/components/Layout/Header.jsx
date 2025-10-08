import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, FileText } from "lucide-react";
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

const Header = ({ title, subtitle }) => {
  const { user } = useAuth();
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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

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
    <div className="relative" ref={notifBtnRef}>
      <button
        onClick={() => setNotifOpen((v) => !v)}
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
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={notifMenuRef}
            className="fixed lg:absolute right-2 lg:right-0 top-16 lg:top-auto mt-2 w-80 sm:w-96 z-[9000]"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-xl shadow-xl overflow-hidden">
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

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative lg:sticky lg:top-0 z-40 bg-gradient-to-r from-slate-800/50 to-purple-900/30 backdrop-blur-xl border-b border-cyan-400/20 p-3 sm:p-4 lg:p-6"
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
              className="flex items-center space-x-2 flex-1 justify-end min-w-0"
            >
              <div className="text-right min-w-0 flex-1 max-w-[200px] sm:max-w-none">
                <p className="text-white font-medium text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-cyan-400/70 text-xs">{user?.role}</p>
              </div>

              {/* Notifications - Mobile */}
              <NotificationBell />
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

            {/* User Info - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-right"
            >
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-cyan-400/70 text-sm">{user?.role}</p>
            </motion.div>
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
