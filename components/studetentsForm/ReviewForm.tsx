"use client";

import React from "react";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ReviewFormProps {
  data: Record<string, any>;
  labels: string[];
  onEdit: (sectionIndex: number) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
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
              {Object.entries(item).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt className="font-medium text-gray-600">{k}</dt>
                  <dd className="text-gray-900 break-words">{String(v)}</dd>
                </React.Fragment>
              ))}
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
        {Object.entries(sectionData).map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="font-medium text-gray-600">{k}</dt>
            <dd className="text-gray-900 break-words">{String(v)}</dd>
          </React.Fragment>
        ))}
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