import React, { useState, useEffect } from "react";
import { notificationApi } from "../../services/api";

const NotificationBadge = ({ className = "" }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const list = await notificationApi.getMyNotifications();
      const unread = (list || []).filter((n) => n.isRead !== true).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setUnreadCount(0);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}>
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default NotificationBadge;