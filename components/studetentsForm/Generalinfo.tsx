"use client";

import React, { useCallback } from "react";
import { TestInput } from "@/components/ui/TestInput";
import toast from "react-hot-toast";

export type ProfileData = {
  photo?: string;
  candidate_first_name: string;
  candidate_last_name: string;
  candidate_id: string;
  email: string;
  current_degree: string;
  affiliate_university: string;
  college_name: string;
  batch: string;
  roll_reg_no: string;
  sslc_percentage: string;
  hsc_percentage: string;
};

const emptyProfile: ProfileData = {
  photo: undefined,
  candidate_first_name: "",
  candidate_last_name: "",
  candidate_id: "",
  email: "",
  current_degree: "",
  affiliate_university: "",
  college_name: "",
  batch: "",
  roll_reg_no: "",
  sslc_percentage: "",
  hsc_percentage: "",
};

interface GeneralinfoProps {
  data?: Partial<ProfileData>;
  onChange: (data: ProfileData) => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
}

const frozenFields = [
  "candidate_first_name",
  "candidate_last_name",
  "candidate_id",
  "email",
  "affiliate_university",
  "college_name",
  "roll_reg_no",
];

export default function Generalinfo({
  data = {},
  onChange,
  onSaveDraft,
  onNext,
}: GeneralinfoProps) {
  const merged = React.useMemo(() => ({ ...emptyProfile, ...data }), [data]);

  const update = useCallback(
    <K extends keyof ProfileData>(field: K, val: ProfileData[K]) =>
      onChange({ ...merged, [field]: val }),
    [merged, onChange]
  );

  // Handler for frozen fields
  const handleFrozenField = () => {
    toast.error("Please contact the faculty for changes.");
  };

  // Only validate on "Next", not on "Save Draft"
  const handleNext = () => {
    if (
      !merged.batch ||
      !merged.sslc_percentage ||
      !merged.hsc_percentage
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onNext && onNext();
  };

  // Handle photo upload using /api/upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", "photo");
    if (merged.photo) {
      formData.append("oldPath", merged.photo); // Remove old photo if exists
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.path) {
      update("photo", data.path); // Save only the path in DB
    } else {
      toast.error(data.error || "Failed to upload photo.");
    }
  };

  // Remove photo from server and state, then save immediately
  const handleRemovePhoto = async () => {
    if (merged.photo && merged.photo.startsWith("/uploads/")) {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: merged.photo }),
      });
    }
    update("photo", null);
    if (onSaveDraft) onSaveDraft(); // Save immediately after removal
  };

  // Helper for displaying the photo or fallback
  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === "") return "/default-profile.png";
    if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
    return `/uploads/${photo}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-200 via-blue-100 to-white">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm border border-blue-200 shadow-2xl rounded-3xl p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-2">
              Student General Information
            </h2>
            <p className="text-gray-600">
              Please fill in your details accurately. All fields are required.
            </p>
          </div>
          {/* Photo Upload */}
          <div className="flex flex-col items-center mt-6 md:mt-0">
            <div className="relative group">
              {merged.photo ? (
                <img
                  src={getPhotoUrl(merged.photo)}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200 to-blue-100 flex items-center justify-center text-4xl text-indigo-400 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-14 w-14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              )}

              {merged.photo ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute bottom-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs shadow hover:bg-red-700 transition-opacity"
                >
                  Remove
                </button>
              ) : (
                <label className="absolute bottom-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs shadow cursor-pointer hover:bg-indigo-700 transition-opacity">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-2">
              {merged.photo ? "Click Remove to clear photo" : "Upload a clear profile photo"}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <TestInput
            name="candidate_first_name"
            label={
              <span>
                First Name
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="John"
            value={merged.candidate_first_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="candidate_last_name"
            label={
              <span>
                Last Name
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="Doe"
            value={merged.candidate_last_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="candidate_id"
            label={
              <span>
                Candidate ID
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="CAND-12345"
            value={merged.candidate_id}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="email"
            label={
              <span>
                Email Address
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            type="email"
            placeholder="you@example.com"
            value={merged.email}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="affiliate_university"
            label={
              <span>
                Affiliate University
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="XYZ University"
            value={merged.affiliate_university}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="college_name"
            label={
              <span>
                College Name
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="ABC Engineering College"
            value={merged.college_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="roll_reg_no"
            label={
              <span>
                Roll / Reg No
                <span className="ml-1 text-gray-400" title="Locked">
                  <svg className="inline h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7a4 4 0 118 0v4" />
                    <rect width="16" height="10" x="4" y="11" rx="2" />
                  </svg>
                </span>
              </span>
            }
            placeholder="2021CS001"
            value={merged.roll_reg_no}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          {/* Editable fields below */}
          <TestInput
            name="batch"
            label="Batch"
            placeholder="2021–25"
            value={merged.batch}
            onChange={(e) => update("batch", e.target.value)}
          />
          <TestInput
            name="sslc_percentage"
            label="SSLC %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="88.50"
            value={merged.sslc_percentage}
            onChange={(e) => update("sslc_percentage", e.target.value)}
          />
          <TestInput
            name="hsc_percentage"
            label="HSC %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="91.20"
            value={merged.hsc_percentage}
            onChange={(e) => update("hsc_percentage", e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          {onSaveDraft && (
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg shadow hover:bg-gray-300"
              onClick={onSaveDraft}
            >
              Save Draft
            </button>
          )}
          {onNext && (
            <button
              type="button"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}