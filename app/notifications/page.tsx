"use client";

import React, { useEffect, useState } from "react";
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { PrismaClient } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  action_required: "bg-yellow-100 text-yellow-800",
};

function NotificationCard({ n, onMarkRead }: { n: any; onMarkRead: (id: number) => void }) {
  const color = STATUS_COLORS[n.status] || "bg-gray-100 text-gray-800";
  const Icon =
    n.status === "success"
      ? CheckCircleIcon
      : n.status === "error"
      ? ExclamationCircleIcon
      : BellIcon;
  return (
    <div className={clsx("rounded-lg p-4 shadow flex items-start gap-4", color, n.read && "opacity-60") }>
      <Icon className="h-7 w-7 mt-1" />
      <div className="flex-1">
        <div className="font-semibold mb-1">{n.type.replace(/_/g, " ").toUpperCase()}</div>
        <div className="mb-1">{n.message}</div>
        <div className="text-xs text-gray-500 flex gap-2 items-center">
          <span>{new Date(n.createdAt).toLocaleString()}</span>
          {n.relatedStudent && (
            <span className="ml-2">Student: {n.relatedStudent.firstName} {n.relatedStudent.lastName}</span>
          )}
        </div>
      </div>
      {!n.read && (
        <button
          className="ml-2 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={() => onMarkRead(n.id)}
        >
          Mark as read
        </button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch(`/api/notifications?type=${tab}`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    // Optionally, poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [tab]);

  async function markAsRead(id: number) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      fetchNotifications();
    } catch (e) {
      console.error("[Submit] Notification creation error:", e);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BellIcon className="h-8 w-8 text-indigo-600" /> Notifications
      </h2>
      <div className="flex gap-4 mb-6">
        <button
          className={clsx(
            "px-4 py-2 rounded font-semibold flex items-center gap-2",
            tab === "incoming"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          onClick={() => setTab("incoming")}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Incoming
        </button>
        <button
          className={clsx(
            "px-4 py-2 rounded font-semibold flex items-center gap-2",
            tab === "outgoing"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          onClick={() => setTab("outgoing")}
        >
          Outgoing <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No notifications found.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationCard key={n.id} n={n} onMarkRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
} 