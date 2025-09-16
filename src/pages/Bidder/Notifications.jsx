import React, { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import NotificationCard from "../../components/UI/NotificationCard";
import NotificationFilters from "../../components/UI/NotificationFilters";
import ApplicationModal from "../../components/UI/ApplicationModal";
import ConfirmDeleteModal from "../../components/UI/ConfirmDeleteModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { notificationApi } from "../../services/api";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all", // all | unread | application | tender | account
  });

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const list = await notificationApi.getMyNotifications();
      const normalized = (list || []).map((n) => ({
        _id: n._id || n.id,
        type: n.type || "general",
        status: n.status || n.category || n.type || "info",
        newStatus: n.status,
        message: n.message || n.body || n.description || "",
        isRead: n.isRead === true,
        createdAt: n.createdAt || n.time || new Date().toISOString(),
        tenderTitle: n.tenderTitle,
        application: n.application,
        applicationId: n.applicationId,
      }));
      // Sort newest first
      normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(normalized);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Category filter
    const cat = (filters.category || "all").toLowerCase();
    if (cat === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (cat === "application") {
      filtered = filtered.filter(
        (n) => (n.category || n.type || "").toLowerCase() === "application"
      );
    } else if (cat === "tender") {
      filtered = filtered.filter(
        (n) => (n.category || n.type || "").toLowerCase() === "tender"
      );
    } else if (cat === "account") {
      filtered = filtered.filter((n) => {
        const t = (n.category || n.type || "").toLowerCase();
        return t === "user" || t === "system";
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredNotifications(filtered);
  };

  const getNotificationCounts = () => {
    const counts = {
      // Categories
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      application: notifications.filter(
        (n) => (n.category || n.type || "").toLowerCase() === "application"
      ).length,
      tender: notifications.filter(
        (n) => (n.category || n.type || "").toLowerCase() === "tender"
      ).length,
      account: notifications.filter((n) => {
        const t = (n.category || n.type || "").toLowerCase();
        return t === "user" || t === "system";
      }).length,

      };
    return counts;
  };

  const handleFilterChange = async (key, value) => {
    if (key === "markAllAsRead") {
      await handleMarkAllAsRead();
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewApplication = (notification) => {
    if (notification.application) {
      setSelectedApplication(notification.application);
      setShowApplicationModal(true);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationApi.markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;

    try {
      // If backend supports single delete, call here
      // await notificationApi.deleteNotification(notificationToDelete._id);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationToDelete._id)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Notifications"
        subtitle="Stay updated on your application status changes"
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Stay updated on your application status changes"
    >
      <div className="space-y-6">
        {/* Filters */}
        <NotificationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          notificationCounts={getNotificationCounts()}
        />

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={notifications.length === 0 ? BellOff : Bell}
            title={
              notifications.length === 0
                ? "No notifications yet"
                : "No notifications match your filter"
            }
            description={
              notifications.length === 0
                ? "You'll receive notifications here when your application statuses change."
                : "Try adjusting your filter to see more notifications."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                index={index}
                onView={handleViewApplication}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}

        {/* Application Modal */}
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setNotificationToDelete(null);
          }}
          onConfirm={confirmDeleteNotification}
          itemName="this notification"
          title="Delete Notification"
          message="Are you sure you want to delete this notification? This action cannot be undone."
        />
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
