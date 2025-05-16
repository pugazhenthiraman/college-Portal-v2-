"use client";

import React from "react";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface ReviewFormProps {
  /** The full form data keyed by section names */
  data: Record<string, any>;
  /** Section labels in the same order as your steps */
  labels: string[];
  /** Called with the section index when user clicks Edit */
  onEdit: (sectionIndex: number) => void;
  /** Save draft callback */
  onSaveDraft: () => void;
  /** Final submit callback */
  onSubmit: () => void;
}

export default function ReviewForm({
  data,
  labels = [],
  onEdit,
  onSaveDraft,
  onSubmit,
}: ReviewFormProps){
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
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Review & Submit</h2>

      <div className="grid gap-6">
        {sections.map((key, idx) => {
          const sectionData = data[key];
          return (
            <div
              key={key}
              className="p-6 bg-white rounded-lg shadow flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">
                  {labels[idx] || key}
                </h3>
                <button
                  type="button"
                  onClick={() => onEdit(idx)}
                  className="text-indigo-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <pre className="max-h-48 overflow-auto text-sm bg-gray-50 p-4 rounded">
                {JSON.stringify(sectionData, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
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
      
      </div>
    </div>
  );
}