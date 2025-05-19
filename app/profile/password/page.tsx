// app/profile/password/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Lock,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

export default function SecurityPage() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentValid, setCurrentValid] = useState<boolean | null>(null);
  const [newMatch, setNewMatch] = useState(true);
  const [loading, setLoading] = useState(false);

  // Debounced validate current password
  useEffect(() => {
    setCurrentValid(null);
    if (!current) return;
    const tid = setTimeout(async () => {
      try {
        // We hit the same PUT endpoint but only check current password validity
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

    setLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPwd,
          confirmPassword: confirm,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Password updated successfully");

      // give toast a moment to show, then redirect
      setTimeout(() => {
        router.push("/home");
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when this overlay is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 rounded-full p-4 mb-3 shadow">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 tracking-tight">
            Change Password
          </h1>
          <p className="text-gray-500 text-center">
            For your security, please use a strong password you haven't used before.
          </p>
        </div>

        {/* --- Current Password --- */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <Lock className="w-4 h-4 mr-2 text-indigo-400" />
            Current Password
            {currentValid === true && (
              <CheckCircle className="ml-2 w-5 h-5 text-green-500" />
            )}
            {currentValid === false && (
              <XCircle className="ml-2 w-5 h-5 text-red-500" />
            )}
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              className={`mt-1 block w-full border-2 rounded-lg px-4 py-2 pr-10 focus:outline-none transition-all ${
                currentValid === false
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {currentValid === false && (
            <p className="mt-1 text-red-600 text-xs">
              Current password is wrong.
            </p>
          )}
        </div>

        {/* --- New Password --- */}
        <div className="mb-6">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <KeyRound className="w-4 h-4 mr-2 text-indigo-400" />
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="mt-1 block w-full border-2 rounded-lg px-4 py-2 pr-10 focus:outline-none border-gray-200 focus:border-indigo-400 transition-all"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500"
              tabIndex={-1}
            >
              {showNew ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* --- Confirm Password --- */}
        <div className="mb-8">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <KeyRound className="w-4 h-4 mr-2 text-indigo-400" />
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={`mt-1 block w-full border-2 rounded-lg px-4 py-2 pr-10 focus:outline-none transition-all ${
                !newMatch && confirm
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-indigo-400"
              }`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {!newMatch && confirm && (
            <p className="mt-1 text-red-600 text-xs">
              New password and confirmation do not match.
            </p>
          )}
        </div>

        {/* --- Save Button --- */}
        <button
          onClick={handleSave}
          disabled={
            loading ||
            !current ||
            currentValid === false ||
            !newPwd ||
            !confirm ||
            !newMatch
          }
          className={`w-full py-3 rounded-xl font-bold text-lg shadow transition-all flex items-center justify-center ${
            loading
              ? "bg-indigo-300 text-white cursor-wait"
              : currentValid && newMatch && newPwd && confirm
              ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin h-6 w-6 mr-2 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            <span>Save Password</span>
          )}
        </button>
      </div>
    </div>
  );
}
