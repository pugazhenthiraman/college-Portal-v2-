"use client";

import React, { useCallback } from "react";
import { TestInput } from "@/components/ui/TestInput";
import toast from "react-hot-toast";

export type ProfileData = {
  photo?: string;
  candidate_first_name: string;
  candidate_last_name: string;
  email: string;
  current_degree: string;
  affiliate_university: string;
  college_name: string;
  batch: string;
  roll_reg_no: string;
  sslc_percentage: string;
  hsc_percentage: string;
  country?: string;
  district?: string;
  state?: string;
  departmentName?: string;
  section?: string;
  academicYear?: string;
  adhaarNo?: string;
  passportNo?: string;
  passportExpiryDate?: string; // ISO string for date
  DOB?: string; // ISO string for date
  phoneNo?: string;
  secondaryPhoneNo?: string;
  panNo?: string;
};

const emptyProfile: ProfileData = {
  photo: undefined,
  candidate_first_name: "",
  candidate_last_name: "",
  email: "",
  current_degree: "",
  affiliate_university: "",
  college_name: "",
  batch: "",
  roll_reg_no: "",
  sslc_percentage: "",
  hsc_percentage: "",
  country: "",
  district: "",
  state: "",
  departmentName: "",
  section: "",
  academicYear: "",
  adhaarNo: "",
  passportNo: "",
  passportExpiryDate: "",
  DOB: "",
  phoneNo: "",
  secondaryPhoneNo: "",
  panNo: "",
};

interface GeneralinfoProps {
  data?: Partial<ProfileData>;
  onChange: (data: ProfileData) => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
}

const validatePercentage = (value: string) => {
  if (value === "") return true;
  const regex = /^(100(\.0{1,2})?|(\d{1,2})(\.\d{1,2})?)$/;
  if (!regex.test(value)) return false;
  const num = parseFloat(value);
  return num >= 0 && num <= 100;
};

// Aadhaar: allow only digits, format as '1111 2222 3333', max 12 digits
const formatAadhaar = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '').slice(0, 12);
  // Format as '1111 2222 3333'
  return digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (m, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join(' '));
};

// Passport: allow empty or up to 8 alphanumeric, but only show error if length is 8 and not valid
const validatePassport = (value: string) => {
  // Remove spaces before validating
  const val = value.replace(/\s/g, '');
  return val === "" || /^[A-Z]{1}[0-9]{7}$/.test(val);
};

const validatePAN = (value: string) => {
  return value === "" || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
};

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

  const handleFrozenField = () => {
    toast.error("Please contact the faculty for changes.");
  };

  const handleNext = () => {
    if (
      !merged.sslc_percentage ||
      !merged.hsc_percentage
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (
      !validatePercentage(merged.sslc_percentage) ||
      !validatePercentage(merged.hsc_percentage)
    ) {
      toast.error("Enter valid percentages (0–100, up to 2 decimals)");
      return;
    }
    if (
      merged.adhaarNo &&
      merged.adhaarNo.length > 0 &&
      merged.adhaarNo.length !== 12
    ) {
      toast.error("Aadhaar must be exactly 12 digits");
      return;
    }
    if (
      merged.adhaarNo &&
      merged.adhaarNo.length === 12 &&
      !/^\d{12}$/.test(merged.adhaarNo)
    ) {
      toast.error("Aadhaar must be exactly 12 digits");
      return;
    }
    if (
      merged.passportNo &&
      merged.passportNo.length > 0 &&
      merged.passportNo.length !== 8
    ) {
      toast.error("Passport must be exactly 8 characters (A-Z, 0-9)");
      return;
    }
    if (
      merged.passportNo &&
      merged.passportNo.length === 8 &&
      !/^[A-Za-z0-9]{8}$/.test(merged.passportNo)
    ) {
      toast.error("Passport must be exactly 8 characters (A-Z, 0-9)");
      return;
    }
    if (onNext) onNext();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", "photo");
    if (merged.photo) {
      formData.append("oldPath", merged.photo);
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.path) {
      update("photo", data.path);
    } else {
      toast.error(data.error || "Failed to upload photo.");
    }
  };

  const handleRemovePhoto = async () => {
    if (merged.photo && merged.photo.startsWith("/uploads/")) {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: merged.photo }),
      });
    }
    update("photo", undefined);
    if (onSaveDraft) onSaveDraft();
  };

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
                  {/* Modern user avatar icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" />
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
          {/* Frozen fields with lock icon */}
          <TestInput
            name="candidate_first_name"
            label="First Name"
            placeholder="John"
            value={merged.candidate_first_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="candidate_last_name"
            label="Last Name"
            placeholder="Doe"
            value={merged.candidate_last_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={merged.email}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="affiliate_university"
            label="Affiliate University"
            placeholder="XYZ University"
            value={merged.affiliate_university}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="college_name"
            label="College Name"
            placeholder="ABC Engineering College"
            value={merged.college_name}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="roll_reg_no"
            label="Roll / Reg No"
            placeholder="2021CS001"
            value={merged.roll_reg_no}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="country"
            label="Country"
            placeholder="India"
            value={merged.country || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="state"
            label="State"
            placeholder="Tamil Nadu"
            value={merged.state || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="district"
            label="District"
            placeholder="Chennai"
            value={merged.district || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="departmentName"
            label="Department"
            placeholder="Computer Science"
            value={merged.departmentName || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="section"
            label="Section"
            placeholder="A"
            value={merged.section || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="academicYear"
            label="Academic Year"
            placeholder="2024-2025"
            value={merged.academicYear || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="DOB"
            label="Date of Birth"
            type="date"
            value={merged.DOB ? merged.DOB.substring(0, 10) : ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="phoneNo"
            label="Phone Number"
            placeholder="9876543210"
            value={merged.phoneNo || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />
          <TestInput
            name="secondaryPhoneNo"
            label="Secondary Phone Number"
            placeholder="Alternate number"
            value={merged.secondaryPhoneNo || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            onFocus={handleFrozenField}
          />

          {/* Editable fields */}
          <TestInput
            name="sslc_percentage"
            label="SSLC %"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="88.50"
            value={merged.sslc_percentage}
            onChange={(e) => {
              const val = e.target.value;
              if (validatePercentage(val)) {
                update("sslc_percentage", val);
              } else {
                toast.error("Enter a valid percentage (0–100, up to 2 decimals)");
              }
            }}
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
            onChange={(e) => {
              const val = e.target.value;
              if (validatePercentage(val)) {
                update("hsc_percentage", val);
              } else {
                toast.error("Enter a valid percentage (0–100, up to 2 decimals)");
              }
            }}
          />
          <TestInput
            name="adhaarNo"
            label="Aadhaar Number"
            placeholder="1111 2222 3333"
            value={formatAadhaar(merged.adhaarNo || "")}
            maxLength={14} // 12 digits + 2 spaces
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 12); // Only digits, max 12
              update("adhaarNo", val);
            }}
            onBlur={e => {
              const val = e.target.value.replace(/\D/g, '');
              if (val && val.length !== 12) {
                toast.error("Aadhaar must be exactly 12 digits");
              }
            }}
          />
          <TestInput
            name="passportNo"
            label="Passport Number"
            placeholder="A 1234567"
            value={
              merged.passportNo
                ? merged.passportNo.length > 1
                  ? `${merged.passportNo[0]} ${merged.passportNo.slice(1)}`
                  : merged.passportNo
                : ""
            }
            maxLength={9} // 8 chars + 1 space
            onChange={e => {
              let val = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
              // Remove all spaces for storage/validation
              val = val.replace(/\s/g, '');
              // Only allow first char as letter, rest as digits
              if (val.length > 0) {
                val = val[0].replace(/[^A-Z]/g, '') + val.slice(1).replace(/[^0-9]/g, '');
              }
              // Limit to 8 chars (1 letter + 7 digits)
              val = val.slice(0, 8);
              update("passportNo", val);
            }}
            onBlur={e => {
              const val = e.target.value.toUpperCase().replace(/\s/g, '');
              if (val && !validatePassport(val)) {
                toast.error("Passport must be 1 capital letter followed by 7 digits (e.g., A 1234567)");
              }
            }}
          />
          <TestInput
            name="passportExpiryDate"
            label="Passport Expiry Date"
            type="date"
            value={merged.passportExpiryDate ? merged.passportExpiryDate.substring(0, 10) : ""}
            onChange={e => update("passportExpiryDate", e.target.value)}
          />
          <TestInput
            name="panNo"
            label="PAN Number"
            placeholder="ABCDE1234F"
            value={merged.panNo || ""}
            maxLength={10}
            onChange={e => {
              const val = e.target.value.toUpperCase();
              update("panNo", val);
            }}
            onBlur={e => {
              const val = e.target.value.toUpperCase();
              if (val && !validatePAN(val)) {
                toast.error("PAN must be in format AAAAA9999A");
              }
            }}
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