import React, { useEffect, useState, useMemo } from "react";
import { Bell, BellOff, Check, Trash2, CheckCircle2, Clock } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { notificationApi } from "../../services/api";
import toast from "react-hot-toast";
import { emitNotificationsChanged } from "../../utils/notificationsBus";

const formatTime = (date) => {
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
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const list = await notificationApi.getMyNotifications();
        const normalized = (list || []).map((n) => ({
          id: n._id || n.id,
          title:
            n.title || (n.type ? String(n.type).replace(/[_:]/g, " ") : "Notification"),
          message: n.message || n.body || n.description || "",
          createdAt: n.createdAt || n.time || new Date().toISOString(),
          isRead: n.isRead === true,
        }));
        normalized.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (mounted) setNotifications(normalized);
      } catch (e) {
        console.error("Failed to load notifications", e);
        if (mounted) setError("Failed to load notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkAsRead = async (n) => {
    try {
      await notificationApi.markAsRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      emitNotificationsChanged({ action: "markAsRead", id: n.id });
      toast.success("Marked as read");
    } catch (e) {
      console.error("Failed to mark as read", e);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
      emitNotificationsChanged({ action: "markAllAsRead" });
      toast.success("All notifications marked as read");
    } catch (e) {
      console.error("Failed to mark all as read", e);
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.clearNotifications();
      setNotifications([]);
      emitNotificationsChanged({ action: "clear" });
      toast.success("Notifications cleared");
    } catch (e) {
      console.error("Failed to clear notifications", e);
      toast.error("Failed to clear notifications");
    }
  };

  const visible = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  return (
    <DashboardLayout title="Notifications" subtitle="System-wide updates and alerts">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg border text-sm transition ${
                filter === "all"
                  ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                  : "bg-slate-800/50 border-cyan-400/20 text-gray-300 hover:bg-slate-800"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg border text-sm transition ${
                filter === "unread"
                  ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                  : "bg-slate-800/50 border-cyan-400/20 text-gray-300 hover:bg-slate-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 rounded-lg border border-cyan-400/30 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Check className="w-4 h-4" /> Mark all as read
              </span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 rounded-lg border border-red-400/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Clear all
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading notifications...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 border border-cyan-400/20 rounded-xl bg-white/5">
            {notifications.length === 0 ? (
              <BellOff className="w-12 h-12 text-gray-400 mb-3" />
            ) : (
              <Bell className="w-12 h-12 text-gray-400 mb-3" />
            )}
            <div className="text-white font-semibold mb-1">
              {notifications.length === 0 ? "No notifications yet" : "No unread notifications"}
            </div>
            <div className="text-gray-400 text-sm">
              {notifications.length === 0
                ? "You'll receive notifications here as activities occur."
                : "You're all caught up!"}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((n, idx) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border backdrop-blur-xl ${
                  n.isRead
                    ? "bg-white/5 border-gray-400/20"
                    : "bg-cyan-500/10 border-cyan-400/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      <div className="text-white font-medium truncate">
                        {n.title}
                      </div>
                      {!n.isRead && <span className="w-2 h-2 bg-cyan-400 rounded-full" />}
                    </div>
                    {n.message && (
                      <div className="text-gray-300 text-sm leading-relaxed break-words">
                        {n.message}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <Clock className="w-3.5 h-3.5" /> {formatTime(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n)}
                      className="px-3 py-1 rounded-lg border border-cyan-400/30 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs flex-shrink-0"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;