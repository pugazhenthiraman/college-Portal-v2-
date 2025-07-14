"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { TestInput } from "@/components/ui/TestInput";
import toast, { Toaster } from "react-hot-toast";

export type UGDetailsData = {
  ugBatch?: string;
  pgBatch?: string;
  semesterNo?: string;
  semesterMarksheet?: string;
  overallCGPA?: string;
  overallPercentage?: string;
  isPG?: boolean;
  pgSemesterNo?: string;
  pgSemesterMarksheet?: string;
  pgOverallCGPA?: string;
  pgOverallPercentage?: string;
};

interface UGDetailsFormProps {
  data: UGDetailsData;
  onChange: (data: UGDetailsData) => void;
}

// Helper to validate percentage input (0-100, up to 2 decimals)
function validatePercentage(value: string) {
  if (value === "") return true;
  const regex = /^(100(\.0{1,2})?|(\d{1,2})(\.\d{1,2})?)$/;
  if (!regex.test(value)) return false;
  const num = parseFloat(value);
  return num >= 0 && num <= 100;
}

// Helper to validate CGPA input (0-100, up to 2 decimals)
function validateCGPA(value: string) {
  if (value === "") return true;
  const regex = /^(100(\.0{1,2})?|(\d{1,2})(\.\d{1,2})?)$/;
  if (!regex.test(value)) return false;
  const num = parseFloat(value);
  return num >= 0 && num <= 100;
}

function parseBatchYears(batch?: string): { start: number; end: number } | null {
  if (!batch) return null;
  const match = batch.match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;
  return { start: parseInt(match[1], 10), end: parseInt(match[2], 10) };
}

function isValidBatch(batch?: string): boolean {
  const match = batch?.match(/^(\d{4})-(\d{4})$/);
  if (!match) return false;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return end - start === 4;
}

export default function UGDetailsForm({
  data,
  onChange,
}: UGDetailsFormProps) {
  const ugInputRef = useRef<HTMLInputElement>(null);
  const pgInputRef = useRef<HTMLInputElement>(null);

  // Only allow PG if current date is after UG batch end year (June)
  const batchYears = parseBatchYears(data.ugBatch);
  const now = new Date();
  let canEditPG = false;
  if (batchYears) {
    if (now.getFullYear() > batchYears.end) {
      canEditPG = true;
    } else if (now.getFullYear() === batchYears.end && now.getMonth() >= 5) {
      // June is month 5 (0-indexed)
      canEditPG = true;
    }
  }

  // Upload handler: uploads file to /api/upload and stores the returned path
  const handleUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      field: "semesterMarksheet" | "pgSemesterMarksheet"
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast.error("Only JPG, PNG, or PDF files are allowed for marksheets.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", "marksheet");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (result.path) {
          onChange({ ...data, [field]: result.path });
          if (field === "semesterMarksheet") {
            toast.success("UG marksheet uploaded successfully!");
          } else if (field === "pgSemesterMarksheet") {
            toast.success("PG marksheet uploaded successfully!");
          }
        } else {
          toast.error(result.error || "Upload failed. Please try again.");
        }
      } catch {
        toast.error("Upload failed. Please try again.");
      }
    },
    [data, onChange]
  );

  const update = useCallback(
    <K extends keyof UGDetailsData>(field: K, val: UGDetailsData[K]) => {
      onChange({ ...data, [field]: val });
      if (
        (field === "semesterMarksheet" || field === "pgSemesterMarksheet") &&
        val === undefined
      ) {
        toast.success("File removed.");
      }
    },
    [data, onChange]
  );

  // Batch validation state
  const [batchInput, setBatchInput] = useState(data.ugBatch || "");
  const [batchValid, setBatchValid] = useState(false);
  const [batchError, setBatchError] = useState("");
  useEffect(() => {
    setBatchInput(data.ugBatch || "");
  }, [data.ugBatch]);
  useEffect(() => {
    if (!batchInput) {
      setBatchValid(false);
      setBatchError("");
      return;
    }
    const handler = setTimeout(() => {
      if (!isValidBatch(batchInput)) {
        setBatchValid(false);
        setBatchError("Please enter a valid batch (e.g., 2020-2024 for a 4-year UG course)");
      } else {
        setBatchValid(true);
        setBatchError("");
      }
    }, 2000);
    return () => clearTimeout(handler);
  }, [batchInput]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-100 via-indigo-50 to-white">
      <Toaster position="top-right" />
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm border border-indigo-200 shadow-2xl rounded-3xl p-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-1">
            Undergraduate & Postgraduate Details
          </h2>
          <p className="text-gray-600 text-sm">
            Upload your semester marksheets and enter your CGPA/percentages.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UG Batch */}
          <TestInput
            name="ugBatch"
            label="UG Batch"
            placeholder="2021-2025"
            title="Enter your UG batch in the format YYYY-YYYY, e.g., 2020-2024"
            value={batchInput}
            onChange={e => {
              setBatchInput(e.target.value);
              update("ugBatch", e.target.value);
            }}
            rightIcon={batchValid ? (
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : undefined}
          />
          {batchError && (
            <div className="text-xs text-red-500 mt-1 mb-2">{batchError}</div>
          )}
          {/* UG Semester No */}
          <TestInput
            name="semesterNo"
            label="UG Semester No"
            type="number"
            min="1"
            max="12"
            placeholder="e.g. 6"
            value={data.semesterNo || ""}
            onChange={e => update("semesterNo", e.target.value)}
          />
          {/* UG Marksheet Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UG Marksheet (JPG, PNG, PDF)
            </label>
            {data.semesterMarksheet ? (
              <div className="flex items-center space-x-2">
                <a
                  href={data.semesterMarksheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm truncate max-w-[180px]"
                  title={data.semesterMarksheet}
                >
                  {data.semesterMarksheet.split("/").pop()}
                </a>
                <button
                  type="button"
                  onClick={() => update("semesterMarksheet", undefined)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ) : (
              <input
                ref={ugInputRef}
                type="file"
                accept=".jpeg,.jpg,.png,.pdf"
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1"
                title="Upload your UG marksheet (JPG, PNG, PDF)"
                placeholder="Upload UG marksheet"
                onChange={e => handleUpload(e, "semesterMarksheet")}
              />
            )}
          </div>

          {/* UG CGPA */}
          <TestInput
            name="overallCGPA"
            label="UG Overall CGPA"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 8.75"
            value={data.overallCGPA || ""}
            onChange={e => {
              const val = e.target.value;
              if (validateCGPA(val)) {
                update("overallCGPA", val);
              } else {
                toast.error("Enter a valid CGPA (0–100, up to 2 decimals)");
              }
            }}
          />
          {/* UG Percentage */}
          <TestInput
            name="overallPercentage"
            label="UG Overall %"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 87.5"
            value={data.overallPercentage || ""}
            onChange={e => {
              const val = e.target.value;
              if (validatePercentage(val)) {
                update("overallPercentage", val);
              } else {
                toast.error("Enter a valid percentage (0–100, up to 2 decimals)");
              }
            }}
          />

          {/* PG Toggle */}
          <div className="flex items-center space-x-2 md:col-span-2 py-2">
            <input
              id="isPG"
              type="checkbox"
              checked={!!data.isPG}
              onChange={e => update("isPG", e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              disabled={!canEditPG}
            />
            <label htmlFor="isPG" className="text-sm text-gray-700">
              I also have Postgraduate details
            </label>
            {!canEditPG && (
              <span className="text-xs text-red-500 ml-2">
                (PG details can only be entered after UG batch completion, i.e., after {data.ugBatch ? `${data.ugBatch.split("-")[1]} June` : "UG end year"})
              </span>
            )}
          </div>

          {/* PG Section */}
          {data.isPG && canEditPG && (
            <>
              <TestInput
                name="pgBatch"
                label="PG Batch"
                placeholder="2025-2027"
                title="Enter your PG batch in the format YYYY-YYYY, e.g., 2025-2027"
                value={data.pgBatch || ""}
                onChange={e => update("pgBatch", e.target.value)}
              />
              <TestInput
                name="pgSemesterNo"
                label="PG Semester No"
                type="number"
                min="1"
                max="12"
                placeholder="e.g. 4"
                value={data.pgSemesterNo || ""}
                onChange={e => update("pgSemesterNo", e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PG Marksheet (JPG, PNG, PDF)
                </label>
                {data.pgSemesterMarksheet ? (
                  <div className="flex items-center space-x-2">
                    <a
                      href={data.pgSemesterMarksheet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm truncate max-w-[180px]"
                      title={data.pgSemesterMarksheet}
                    >
                      {data.pgSemesterMarksheet.split("/").pop()}
                    </a>
                    <button
                      type="button"
                      onClick={() => update("pgSemesterMarksheet", undefined)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <input
                    ref={pgInputRef}
                    type="file"
                    accept=".jpeg,.jpg,.png,.pdf"
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1"
                    title="Upload your PG marksheet (JPG, PNG, PDF)"
                    placeholder="Upload PG marksheet"
                    onChange={e => handleUpload(e, "pgSemesterMarksheet")}
                  />
                )}
              </div>
              <TestInput
                name="pgOverallCGPA"
                label="PG Overall CGPA"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 9.00"
                value={data.pgOverallCGPA || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (validateCGPA(val)) {
                    update("pgOverallCGPA", val);
                  } else {
                    toast.error("Enter a valid CGPA (0–100, up to 2 decimals)");
                  }
                }}
              />
              <TestInput
                name="pgOverallPercentage"
                label="PG Overall %"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 90.0"
                value={data.pgOverallPercentage || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (validatePercentage(val)) {
                    update("pgOverallPercentage", val);
                  } else {
                    toast.error("Enter a valid percentage (0–100, up to 2 decimals)");
                  }
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}