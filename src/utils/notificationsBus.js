// Simple cross-component notification invalidation.
// Allows pages (Notifications page) to tell Header to refetch.
// Keeps the solution framework-agnostic (no extra libs required).

export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export function emitNotificationsChanged(detail) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_CHANGED_EVENT, { detail: detail || {} })
  );
}

export function onNotificationsChanged(handler) {
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
}
