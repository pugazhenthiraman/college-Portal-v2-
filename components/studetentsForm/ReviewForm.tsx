"use client";

import React from "react";
import { ArrowPathIcon, ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

interface ReviewFormProps {
  data: Record<string, any>;
  labels: string[];
  onEdit: (sectionIndex: number) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

// Fields to hide in review
const HIDDEN_FIELDS = [
  "id",
  "studentId",
  "userId",
  "createdAt",
  "updatedAt",
  "deletedAt",
];

// Fields that are files (show as link or button)
const FILE_FIELDS = [
  "photo",
  "certificateFile",
  "certificateName",
  "semesterMarksheet",
  "pgSemesterMarksheet",
];

function getFileName(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return decodeURIComponent(url.pathname.split("/").pop() || value);
  } catch {
    return value.split("/").pop() || value;
  }
}

function renderField(k: string, v: any, item?: any) {
  if (HIDDEN_FIELDS.includes(k)) return null;

  // Show image thumbnail for photo
  if (k === "photo" && v) {
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <img
          src={v}
          alt="Profile"
          className="h-12 w-12 rounded object-cover border"
        />
        <a
          href={v}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </a>
      </div>
    );
  }

  // For certificates in skills: show name and view link
  if (k === "certificateName" && item?.certificateFile) {
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <span className="text-gray-900">{v}</span>
        <a
          href={item.certificateFile}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </a>
      </div>
    );
  }

  // For other file fields: show file name and view link
  if (FILE_FIELDS.includes(k) && v) {
    const fileName = getFileName(v);
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <span className="text-gray-900">{fileName}</span>
        <a
          href={v}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </a>
      </div>
    );
  }

  // For other fields, show normally
  return (
    <React.Fragment key={k}>
      <dt className="font-medium text-gray-600">{k}</dt>
      <dd className="text-gray-900 break-words">{String(v)}</dd>
    </React.Fragment>
  );
}

function renderSectionContent(sectionData: any) {
  if (!sectionData) return <span className="text-gray-400">No data</span>;

  // Array of objects (e.g., experiences, skills, etc.)
  if (Array.isArray(sectionData)) {
    if (sectionData.length === 0) return <span className="text-gray-400">No entries</span>;
    return (
      <div className="space-y-2">
        {sectionData.map((item, idx) => (
          <div key={idx} className="border rounded p-3 bg-gray-50">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {Object.entries(item)
                .filter(([k]) => !HIDDEN_FIELDS.includes(k))
                .map(([k, v]) =>
                  FILE_FIELDS.includes(k) && v
                    ? (
                      <div key={k} className="col-span-2">{renderField(k, v, item)}</div>
                    )
                    : renderField(k, v, item)
                )}
            </dl>
          </div>
        ))}
      </div>
    );
  }

  // Object (e.g., general info, social profiles)
  if (typeof sectionData === "object") {
    return (
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {Object.entries(sectionData)
          .filter(([k]) => !HIDDEN_FIELDS.includes(k))
          .map(([k, v]) =>
            FILE_FIELDS.includes(k) && v
              ? (
                <div key={k} className="col-span-2">{renderField(k, v, sectionData)}</div>
              )
              : renderField(k, v, sectionData)
          )}
      </dl>
    );
  }

  // Fallback for primitives
  return <span>{String(sectionData)}</span>;
}

export default function ReviewForm({
  data,
  labels = [],
  onEdit,
  onSaveDraft,
  onSubmit,
}: ReviewFormProps) {
  const sections = Object.keys(data);

  const handleDownload = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_profile.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-4">Review & Submit</h2>

      <div className="space-y-6">
        {sections.map((key, idx) => (
          <div
            key={key}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-indigo-700">
                {labels[idx] || key}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(idx)}
                className="text-indigo-600 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
            <div>{renderSectionContent(data[key])}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download JSON
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Save Draft
          </button>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold"
        >
          Submit All
        </button>
      </div>
    </div>
  );
}