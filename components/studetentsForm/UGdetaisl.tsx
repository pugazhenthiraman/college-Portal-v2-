"use client";

import React, { useRef, useCallback } from "react";
import { TestInput } from "@/components/ui/TestInput";
import toast, { Toaster } from "react-hot-toast";

export type UGDetailsData = {
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

export default function UGDetailsForm({
  data,
  onChange,
}: UGDetailsFormProps) {
  const ugInputRef = useRef<HTMLInputElement>(null);
  const pgInputRef = useRef<HTMLInputElement>(null);

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
            max="10"
            placeholder="e.g. 8.75"
            value={data.overallCGPA || ""}
            onChange={e => update("overallCGPA", e.target.value)}
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
            onChange={e => update("overallPercentage", e.target.value)}
          />

          {/* PG Toggle */}
          <div className="flex items-center space-x-2 md:col-span-2 py-2">
            <input
              id="isPG"
              type="checkbox"
              checked={!!data.isPG}
              onChange={e => update("isPG", e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="isPG" className="text-sm text-gray-700">
              I also have Postgraduate details
            </label>
          </div>

          {/* PG Section */}
          {data.isPG && (
            <>
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
                max="10"
                placeholder="e.g. 9.00"
                value={data.pgOverallCGPA || ""}
                onChange={e => update("pgOverallCGPA", e.target.value)}
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
                onChange={e => update("pgOverallPercentage", e.target.value)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}