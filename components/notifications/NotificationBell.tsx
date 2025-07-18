import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

export default function NotificationBell({ onClick }: { onClick: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count from API
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications?type=incoming&unread=true");
        const data = await res.json();
        setUnreadCount(data.notifications?.length || 0);
      } catch (e) {
        setUnreadCount(0);
      }
    }
    fetchUnread();
    // Optionally, poll every 30s
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      onClick={onClick}
      aria-label="Notifications"
    >
      <BellIcon className="h-7 w-7 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
          {unreadCount}
        </span>
      )}
    </button>
  );
} 