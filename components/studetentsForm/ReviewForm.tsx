"use client";

import React, { useState } from "react";
import { EyeIcon, ChevronDownIcon, ChevronUpIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { formatDateRange } from "@/utils/helper";

// Section order and their corresponding data keys
const SECTION_ORDER: { label: string; key: string }[] = [
  { label: "General Info", key: "general" },
  { label: "UG Details", key: "ugDetailsUG" },
  { label: "PG Details", key: "ugDetailsPG" },
  { label: "Internships", key: "internships" },
  { label: "Projects", key: "projects" },
  { label: "Skills", key: "technicalSkills" },          // ✅ fixed
  { label: "Social", key: "socialProfiles" },
  { label: "Publications", key: "publications" },
  { label: "Enhancement Program", key: "events" },     // ✅ fixed
  { label: "Work Experience", key: "workExperience" },
  { label: "Placements", key: "placements" },
];

// UG and PG field keys
const UG_FIELDS = [
  "ugBatch",
  "semesterNo",
  "semesterMarksheet",
  "overallCGPA",
  "overallPercentage",
];
const PG_FIELDS = [
  "isPG",
  "pgBatch",
  "pgSemesterNo",
  "pgSemesterMarksheet",
  "pgOverallCGPA",
  "pgOverallPercentage",
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

// Add a set of optional fields for internships and projects
const OPTIONAL_INTERNSHIP_FIELDS = ["stipend", "supervisorName"];
const OPTIONAL_PROJECT_FIELDS = ["link"];

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
  // Hide 'batch' from General Info
  if (k === 'batch') return null;

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
      <>
        <dt className="font-medium text-gray-600">{k}</dt>
        <dd className="flex items-center gap-2">
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
        </dd>
      </>
    );
  }

  // For certificates/marksheets: show field name left, file name + view button right
  if (FILE_FIELDS.includes(k) && v) {
    const fileName = getFileName(v);
    return (
      <>
        <dt className="font-medium text-gray-600">{k}</dt>
        <dd className="flex items-center gap-2 whitespace-nowrap justify-end">
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
        </dd>
      </>
    );
  }

  // In renderField, skip 'location' for internships:
  if (k === 'location' && item && item.state) return null;

  // For other fields, show normally
  return (
    <>
      <dt className="font-medium text-gray-600">{k}</dt>
      <dd className="text-gray-900 break-words">{String(v)}</dd>
    </>
  );
}

function renderSectionContent(sectionKey: string, sectionData: any, fullData?: any) {
  // Special handling for UG/PG split
  if (sectionKey === "ugDetailsUG" || sectionKey === "ugDetailsPG") {
    const ugDetails = fullData?.ugDetails || {};
    const fieldKeys = sectionKey === "ugDetailsUG" ? UG_FIELDS : PG_FIELDS;
    const filtered = Object.fromEntries(
      Object.entries(ugDetails).filter(([k]) => fieldKeys.includes(k))
    );
    // Reuse the object rendering logic
    sectionData = filtered;
  }

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
    // Only show items with at least one filled field
    const filledItems = sectionData.filter(item =>
      Object.entries(item).some(([k, v]) => !HIDDEN_FIELDS.includes(k) && v && String(v).trim() !== "")
    );
    return (
      <div className="space-y-2">
        {filledItems.map((item, i) => {
          const filledFields = Object.entries(item).filter(
            ([k, v]) => !HIDDEN_FIELDS.includes(k) && v && String(v).trim() !== ""
          );
          // For internships, treat stipend and supervisorName as optional
          let emptyFields = Object.entries(item).filter(
            ([k, v]) => !HIDDEN_FIELDS.includes(k) && (!v || String(v).trim() === "")
          );
          let optionalFields: [string, any][] = [];
          if (sectionKey === "internships") {
            optionalFields = emptyFields.filter(([k]) => OPTIONAL_INTERNSHIP_FIELDS.includes(k));
            emptyFields = emptyFields.filter(([k]) => !OPTIONAL_INTERNSHIP_FIELDS.includes(k));
          }
          // For projects, treat 'link' as optional
          if (sectionKey === "projects") {
            optionalFields = optionalFields.concat(emptyFields.filter(([k]) => OPTIONAL_PROJECT_FIELDS.includes(k)));
            emptyFields = emptyFields.filter(([k]) => !OPTIONAL_PROJECT_FIELDS.includes(k));
          }
          // --- Always show all unanswered fields (required + optional) ---
          const allUnanswered = [
            ...emptyFields.map(([k]) => ({ name: k, optional: false })),
            ...optionalFields.map(([k]) => ({ name: k, optional: true })),
          ];
          return (
            <div key={i} className="border rounded p-3 bg-gray-50">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm w-full table-fixed">
                {filledFields.map(([k, v], idx) =>
                  <React.Fragment key={k + '-' + idx}>{renderField(k, v, item)}</React.Fragment>
                )}
              </dl>
              {/* Always show unanswered questions block */}
              {allUnanswered.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm flex items-start gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <strong>Unanswered Questions:</strong>
                    <ul className="list-disc ml-6">
                      {allUnanswered.map(({ name, optional }, idx) => (
                        <li key={name + '-' + idx}>
                          {name}
                          {optional && <span className="italic text-xs text-yellow-600 ml-1">(optional)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Object (e.g., general info, social profiles)
  if (typeof sectionData === "object") {
    const filledFields = Object.entries(sectionData).filter(
      ([k, v]) => !HIDDEN_FIELDS.includes(k) && v && String(v).trim() !== ""
    );
    const emptyFields = Object.entries(sectionData).filter(
      ([k, v]) => !HIDDEN_FIELDS.includes(k) && (!v || String(v).trim() === "")
    );
    // --- Always show all unanswered fields (required + optional) ---
    const allUnanswered = emptyFields.map(([k]) => ({ name: k, optional: false }));
    return (
      <>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm w-full table-fixed">
          {filledFields.map(([k, v], idx) =>
            <React.Fragment key={k + '-' + idx}>{renderField(k, v, sectionData)}</React.Fragment>
          )}
        </dl>
        {/* Always show unanswered questions block */}
        {allUnanswered.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm flex items-start gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <strong>Unanswered Questions:</strong>
              <ul className="list-disc ml-6">
                {allUnanswered.map(({ name }, idx) => (
                  <li key={name + '-' + idx}>{name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for primitives
  return <span>{String(sectionData)}</span>;
}

interface ReviewFormProps {
  data: Record<string, any>;
  labels: string[];
  onEdit: (sectionIndex: number) => void;
}

export default function ReviewForm({
  data,
  labels = [],
  onEdit,
}: ReviewFormProps) {
  // LOG all keys at the top
  console.log("ReviewForm data keys:", Object.keys(data));
  console.log("ReviewForm full data:", data);

  // Helper to check if a value is empty
  function isEmptyValue(v: any) {
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  }

  // For debugging: log unanswered required fields per section (except Social)
  SECTION_ORDER.forEach(({ key, label }) => {
    if (key === "socialProfiles") return; // Social section is fully optional

    const sectionData = data[key];
    if (!sectionData) {
      console.log(`[ReviewForm] Section "${label}" is missing entirely (required)`);
      return;
    }

    const unanswered: string[] = [];

    if (Array.isArray(sectionData)) {
      sectionData.forEach((item, idx) => {
        Object.entries(item).forEach(([k, v]) => {
          if (
            !HIDDEN_FIELDS.includes(k) &&
            !(key === "internships" && OPTIONAL_INTERNSHIP_FIELDS.includes(k)) &&
            !(key === "projects" && OPTIONAL_PROJECT_FIELDS.includes(k)) &&
            isEmptyValue(v)
          ) {
            unanswered.push(`${k} (item ${idx + 1})`);
          }
        });
      });
    } else if (typeof sectionData === "object") {
      Object.entries(sectionData).forEach(([k, v]) => {
        if (!HIDDEN_FIELDS.includes(k) && isEmptyValue(v)) {
          unanswered.push(k);
        }
      });
    }

    if (unanswered.length > 0) {
      console.log(`[ReviewForm] Section "${label}" has unanswered required fields:`, unanswered);
    }
  });

  return (
    <div className="space-y-10 max-w-3xl mx-auto" id="review-form-pdf-content">
      <h2 className="text-3xl font-bold text-center mb-4">Review & Submit</h2>

      <div className="space-y-6">
        {SECTION_ORDER.map(({ label, key }) => (
          <div
            key={key}
            className={`bg-white rounded-xl shadow-md p-6 border border-gray-200`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-indigo-700">
                {label}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(labels.findIndex(l => l === (label === "UG Details" ? "UG Details" : label === "PG Details" ? "UG Details" : label)))}
                className="text-indigo-600 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
            <div>{renderSectionContent(key, data[key], data)}</div>
          </div>
        ))}
      </div>

      {/* No action buttons at the bottom as requested */}
    </div>
  );
}