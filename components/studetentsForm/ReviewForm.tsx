"use client";

import React, { useState } from "react";
import { ArrowPathIcon, ArrowDownTrayIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { formatDateRange } from "@/utils/helper";

// Section order and their corresponding data keys
const SECTION_ORDER: { label: string; key: string }[] = [
  { label: "General Info", key: "general" },
  { label: "UG Details", key: "ugDetails" },
  { label: "Internships", key: "internships" },
  { label: "Projects", key: "projects" },
  { label: "Skills", key: "technicalSkills" },          // ✅ fixed
  { label: "Social", key: "socialProfiles" },
  { label: "Publications", key: "publications" },
  { label: "Enhancement Program", key: "events" },     // ✅ fixed
  { label: "Work Experience", key: "workExperiences" },
  { label: "Placements", key: "placements" },
];


// Fields to hide in review
const HIDDEN_FIELDS = [
  "id",
  "studentId",
  "userId",
  "createdAt",
  "updatedAt",
  "deletedAt",
];

// File fields
const FILE_FIELDS = [
  "photo",
  "certificateFile",
  "certificateName",
  "semesterMarksheet",
  "pgSemesterMarksheet",
  "certificate",
  "certificateName",
];

// File fields that should show only file name (not as a link)
const FILE_NAME_ONLY_FIELDS = [
  "certificateFile",
  "semesterMarksheet",
  "pgSemesterMarksheet",
  "certificate",
];

// Helper to get file name from path or URL
function getFileName(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return decodeURIComponent(url.pathname.split("/").pop() || value);
  } catch {
    return value.split("/").pop() || value;
  }
}

// Certificate file name folding component
function FoldableFileName({ fileName }: { fileName: string }) {
  const [expanded, setExpanded] = useState(false);
  if (fileName.length <= 24) return <span className="text-gray-500">{fileName}</span>;
  return (
    <span
      className="text-gray-500 cursor-pointer select-none inline-flex items-center"
      title={fileName}
      onClick={() => setExpanded(e => !e)}
    >
      {expanded ? fileName : fileName.slice(0, 12) + "..." + fileName.slice(-8)}
      {expanded ? (
        <ChevronUpIcon className="h-4 w-4 ml-1 inline" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 ml-1 inline" />
      )}
    </span>
  );
}

function renderField(k: string, v: any, item?: any) {
  if (HIDDEN_FIELDS.includes(k)) return null;

  // If this is a startDate or endDate field and the item has both, show as a range only once
  if ((k === "startDate" || k === "endDate") && item && item.startDate && item.endDate) {
    if (k === "startDate") {
      return (
        <React.Fragment key="duration">
          <dt className="font-medium text-gray-600">Duration</dt>
          <dd className="text-gray-900 break-words">{formatDateRange(item.startDate, item.endDate)}</dd>
        </React.Fragment>
      );
    } else {
      return null; // skip endDate, already shown
    }
  }

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

  // For certificates in skills/internships: show name and folded file name
  if ((k === "certificateName" || k === "certificate") && item?.certificateName) {
    const fileName = getFileName(item.certificateName);
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <FoldableFileName fileName={fileName} />
      </div>
    );
  }

  // For file fields that should show only file name (folded)
  if (FILE_NAME_ONLY_FIELDS.includes(k) && v) {
    const fileName = getFileName(v);
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <FoldableFileName fileName={fileName} />
      </div>
    );
  }

  // For other file fields: show file name and view link
  if (FILE_FIELDS.includes(k) && v) {
    const fileName = getFileName(v);
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="font-medium text-gray-600">{k}</span>
        <FoldableFileName fileName={fileName} />
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

  // In renderField, skip 'location' for internships:
  if (k === 'location' && item && item.state) return null;

  // For other fields, show normally
  return (
    <React.Fragment key={k}>
      <dt className="font-medium text-gray-600">{k}</dt>
      <dd className="text-gray-900 break-words">{String(v)}</dd>
    </React.Fragment>
  );
}

function renderSectionContent(sectionKey: string, sectionData: any) {
  // LOG for each section
  console.log(`Section "${sectionKey}" data:`, sectionData);

  if (!sectionData) {
    return <span className="text-gray-400">No data</span>;
  }

  // Array of objects (e.g., experiences, skills, etc.)
  if (Array.isArray(sectionData)) {
    if (sectionData.length === 0) {
      return <span className="text-gray-400">No entries</span>;
    }
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

interface ReviewFormProps {
  data: Record<string, any>;
  labels: string[];
  onEdit: (sectionIndex: number) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function ReviewForm({
  data,
  labels = [],
  onEdit,
  onSaveDraft,
  onSubmit,
}: ReviewFormProps) {
  // LOG all keys at the top
  console.log("ReviewForm data keys:", Object.keys(data));
  console.log("ReviewForm full data:", data);

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
        {SECTION_ORDER.map(({ label, key }, idx) => (
          <div
            key={key}
            className={`bg-white rounded-xl shadow-md p-6 border border-gray-200 ${data[key] ? "" : "opacity-50"}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-indigo-700">
                {label}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(labels.findIndex(l => l === label))}
                className="text-indigo-600 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
            <div>{renderSectionContent(key, data[key])}</div>
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