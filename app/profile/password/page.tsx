// File: app/profile/security/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function SecurityPage() {
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentValid, setCurrentValid] = useState<boolean | null>(null);
  const [newMatch, setNewMatch] = useState(true);

  // Debounced validate current password
  useEffect(() => {
    setCurrentValid(null);
    if (!current) return;
    const tid = setTimeout(async () => {
      try {
        const res = await fetch("/api/profile/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: current,
            newPassword: current,
            confirmPassword: current,
          }),
        });
        setCurrentValid(res.ok);
      } catch {
        setCurrentValid(false);
      }
    }, 500);
    return () => clearTimeout(tid);
  }, [current]);

  // Check new vs confirm
  useEffect(() => {
    setNewMatch(newPwd === confirm);
  }, [newPwd, confirm]);

  const handleSave = async () => {
    if (!currentValid) return toast.error("Current password is incorrect");
    if (!newPwd || !confirm) return toast.error("Please fill in all fields");
    if (!newMatch) return toast.error("New and confirmation must match");

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPwd,
          confirmPassword: confirm, // <-- add this line
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Password updated successfully");
      setCurrent("");
      setNewPwd("");
      setConfirm("");
      setCurrentValid(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold">Change Password</h1>

      {/* Current Password */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          Current Password
          {currentValid === true && <CheckCircle className="ml-2 w-5 h-5 text-green-500" />}
          {currentValid === false && <XCircle className="ml-2 w-5 h-5 text-red-500" />}
        </label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            className="mt-1 block w-full border rounded px-3 py-2"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showCurrent ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {currentValid === false && (
          <p className="mt-1 text-red-600 text-sm">Current password is wrong.</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            className="mt-1 block w-full border rounded px-3 py-2"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showNew ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            className="mt-1 block w-full border rounded px-3 py-2"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {!newMatch && (
          <p className="mt-1 text-red-600 text-sm">
            New password and confirmation do not match.
          </p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={
            !current ||
            currentValid === false ||
            !newPwd ||
            !confirm ||
            !newMatch
          }
          className={`px-4 py-2 rounded ${
            currentValid && newMatch && newPwd && confirm
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Password
        </button>
      </div>
    </div>
  );
}
