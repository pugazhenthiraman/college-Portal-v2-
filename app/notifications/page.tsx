"use client";

import React, { useEffect, useState } from "react";
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { StudentViewModal } from "@/components/studentViewModel";
import SearchBar from "@/components/searchBar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function NotificationCard({ n, onMarkRead, onReview, onHistory, isFaculty }: { n: any; onMarkRead: (id: number) => void; onReview: (studentId: number) => void; onHistory?: (studentId: number) => void; isFaculty?: boolean }) {
  const statusColor =
    n.status === "success"
      ? "border-green-500"
      : n.status === "error"
      ? "border-red-500"
      : n.status === "action_required"
      ? "border-yellow-400"
      : "border-gray-300";
  const Icon =
    n.status === "success"
      ? CheckCircleIcon
      : n.status === "error"
      ? ExclamationCircleIcon
      : BellIcon;
  // Show More/Show Less for remarks
  const [showFullRemark, setShowFullRemark] = useState(false);
  const REMARK_LIMIT = 100;
  const isLongRemark = n.remarks && n.remarks.length > REMARK_LIMIT;
  const handleToggleRemark = () => {
    if (isLongRemark) {
      setShowFullRemark((prev) => {
        // If toggling to show, also show alert for mobile/UX
        if (!prev) alert(n.remarks);
        return !prev;
      });
    }
  };
  return (
    <div className={clsx(
      "relative bg-white rounded-2xl shadow-xl flex flex-col gap-3 border-2 border-indigo-300 hover:border-indigo-500 transition-all duration-200 p-6 min-w-[300px] max-w-full",
      statusColor,
      n.read && "opacity-60"
    )}>
      {/* Top row: status icon, type, history icon */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6" />
          <span className="font-bold text-base tracking-wide">{n.type.replace(/_/g, " ").toUpperCase()}</span>
        </div>
        {n.relatedStudent && (
          <button
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
            title="View History"
            onClick={() => onHistory && onHistory(n.relatedStudent.id)}
          >
            <ClockIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {/* Main message */}
      <div className="mb-2 text-sm text-gray-800">{n.message}</div>
      {n.remarks && (
        <div className="mb-2 text-xs text-gray-600">
          <span className="font-semibold">Remarks:</span> {isLongRemark && !showFullRemark ? n.remarks.slice(0, REMARK_LIMIT) + "..." : n.remarks}
          {isLongRemark && (
            <button
              className="ml-2 text-indigo-600 underline text-xs"
              onClick={handleToggleRemark}
            >
              {showFullRemark ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}
      {/* Student info grid */}
      {n.relatedStudent && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
          <div><span className="font-semibold">Name:</span> {n.relatedStudent.firstName} {n.relatedStudent.lastName}</div>
          <div><span className="font-semibold">Reg No:</span> {n.relatedStudent.rollNo || '-'}</div>
          <div><span className="font-semibold">Department:</span> {n.relatedStudent.departmentName || '-'}</div>
          <div><span className="font-semibold">Year:</span> {n.relatedStudent.academicYear || '-'}   <span className="font-semibold">Section:</span> {n.relatedStudent.section || '-'}</div>
        </div>
      )}
      {/* Date and actions */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
        <div className="flex gap-2">
          {isFaculty && n.status === "action_required" && n.relatedStudent && !n.read && (
            <button
              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => onReview(n.relatedStudent.userId)}
            >
              Review
            </button>
          )}
          {(!n.relatedStudent || n.status !== "action_required") && !n.read && (
            <button
              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => onMarkRead(n.id)}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentNotificationHistoryModal({ studentId, onClose }: { studentId: number; onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const res = await fetch(`/api/notifications?studentId=${studentId}`);
      const data = await res.json();
      setHistory(data.notifications || []);
      setLoading(false);
    }
    fetchHistory();
  }, [studentId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-red-600 font-bold">&times;</button>
        <h3 className="text-xl font-bold mb-4">Submission History</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No Submisssion history found.</div>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
            {history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((h) => (
              <li key={h.id} className={clsx(
                "rounded p-3 border flex flex-col gap-1",
                h.status === "success" ? "bg-green-50 border-green-200" :
                h.status === "error" ? "bg-red-50 border-red-200" :
                h.status === "action_required" ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
              )}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase text-xs tracking-wide">
                    {h.status === "success" ? "Approved" : h.status === "error" ? "Rejected" : "Pending"}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm font-medium">{h.message}</div>
                {h.remarks && <div className="text-xs text-gray-500">Remarks: {h.remarks}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStudent, setReviewStudent] = useState<any | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [selected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const router = useRouter();
  const [historyStudentId, setHistoryStudentId] = useState<number|null>(null);
  const { data: session } = useSession();

  function filterSort(notifs: any[]) {
    let arr = [...notifs];
    if (search) {
      arr = arr.filter(n => {
        const name = (n.relatedStudent?.firstName + " " + n.relatedStudent?.lastName).toLowerCase();
        const message = n.message.toLowerCase();
        const type = n.type.toLowerCase();
        const regNo = (n.relatedStudent?.rollNo || "").toLowerCase();
        return (
          name.includes(search.toLowerCase()) ||
          message.includes(search.toLowerCase()) ||
          type.includes(search.toLowerCase()) ||
          regNo.includes(search.toLowerCase())
        );
      });
    }
    if (typeFilter) {
      arr = arr.filter(n => n.type === typeFilter);
    }
    if (dateFrom) {
      arr = arr.filter(n => new Date(n.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      arr = arr.filter(n => new Date(n.createdAt) <= new Date(dateTo));
    }
    if (sortBy === "date_desc") {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "date_asc") {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "student_asc") {
      arr.sort((a, b) => (a.relatedStudent?.firstName || "").localeCompare(b.relatedStudent?.firstName || ""));
    } else if (sortBy === "student_desc") {
      arr.sort((a, b) => (b.relatedStudent?.firstName || "").localeCompare(a.relatedStudent?.firstName || ""));
    }
    return arr;
  }

  function paginate(arr: any[]) {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  }
  function totalPages(arr: any[]) {
    return Math.max(1, Math.ceil(arr.length / pageSize));
  }

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch(`/api/notifications`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id: number) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      fetchNotifications();
    } catch (e) {
      console.error("[Submit] Notification creation error:", e);
    }
  }

  // Fetch full student details for review
  async function handleReview(userId: number) {
    try {
      const res = await fetch(`/api/students/full/${userId}`);
      const data = await res.json();
      if (res.ok && data.student) {
        setReviewStudent(data.student);
        setReviewModalOpen(true);
      } else {
        alert(data.error || "Failed to load student details");
      }
    } catch {
      alert("Network error");
    }
  }

  // Only keep the latest notification per student
  const latestByStudent = new Map();
  for (const n of notifications.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) {
    if (!latestByStudent.has(n.relatedStudentId)) {
      latestByStudent.set(n.relatedStudentId, n);
    }
  }
  const latestNotifications = Array.from(latestByStudent.values());

  // Group latest notifications by status
  const pending = latestNotifications.filter(n => n.status === "action_required");
  const approved = latestNotifications.filter(n => n.status === "success");
  const rejected = latestNotifications.filter(n => n.status === "error");
  const tabData = [
    { label: "Pending", icon: ExclamationCircleIcon, color: "text-yellow-700", iconColor: "text-yellow-500", data: pending },
    { label: "Approved", icon: CheckCircleIcon, color: "text-green-700", iconColor: "text-green-500", data: approved },
    { label: "Rejected", icon: ExclamationCircleIcon, color: "text-red-700", iconColor: "text-red-500", data: rejected },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-10 pb-10 flex flex-col items-stretch w-full">
      <div className="w-full flex mb-6">
        {/* No back to dashboard for students or faculty */}
      </div>
      {/* Centered heading and bell icon */}
      <div className="w-full flex justify-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <BellIcon className="h-8 w-8 text-indigo-600" /> Review Student Submission
        </h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading Student Submissions...</div>
      ) : (
        <>
          {/* Improved filter bar design */}
          <div className="flex justify-center w-full mb-6">
            <div className="flex flex-wrap gap-4 items-end bg-white/80 shadow-md rounded-xl px-6 py-4 border border-gray-200">
              {session?.user?.role !== 'STUDENT' && (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Search</label>
                  <SearchBar
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="min-w-[200px]"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">To</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Sort</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition bg-white"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="student_asc">Student Name A-Z</option>
                  <option value="student_desc">Student Name Z-A</option>
                </select>
              </div>
            </div>
          </div>
          {/* Tab Bar: full width, equal spacing */}
          <Tab.Group>
            <Tab.List className="grid grid-cols-3 gap-4 border-b mb-8 w-full max-w-8xl mx-auto">
              {tabData.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    `flex items-center justify-center gap-2 px-6 py-2 rounded-t-lg font-semibold focus:outline-none transition-all duration-150 w-full ${selected ? `${tab.color} border-b-4 border-indigo-600 bg-gray-50` : "text-gray-500 hover:text-indigo-600"}`
                  }
                >
                  <tab.icon className={`h-6 w-6 ${tab.iconColor}`} />
                  {tab.label}
                  <span className="ml-2 text-xs font-bold bg-gray-200 rounded px-2 py-0.5">{filterSort(tab.data).length}</span>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {tabData.map((tab, idx) => {
                const filtered = filterSort(tab.data);
                const paged = paginate(filtered);
                return (
                  <Tab.Panel key={tab.label}>
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400 mb-6">
                        No {tab.label.toLowerCase()} notifications.
                      </div>
                    ) : (
                      <>
                            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-10 justify-center items-start mt-8 mx-auto">   
                          {paged.map((n: any) => (
                            <div key={n.id} className={selected.includes(n.id) ? "ring-2 ring-indigo-400 rounded" : ""}>
                              <NotificationCard
                                n={n}
                                onMarkRead={markAsRead}
                                onReview={(userId) => handleReview(userId)}
                                onHistory={setHistoryStudentId}
                                isFaculty={session?.user?.role === "FACULTY"}
                              />
                            </div>
                          ))}
                        </div>
                        {/* No pagination for students */}
                      </>
                    )}
                  </Tab.Panel>
                );
              })}
            </Tab.Panels>
          </Tab.Group>
        </>
      )}
      {/* Student Review Modal */}
      {reviewModalOpen && reviewStudent && (
        <StudentViewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          student={reviewStudent}
          onSave={() => {
            setReviewModalOpen(false);
            fetchNotifications();
          }}
        />
      )}
      {historyStudentId && (
        <StudentNotificationHistoryModal
          studentId={historyStudentId}
          onClose={() => setHistoryStudentId(null)}
        />
      )}
    </div>
  );
} 