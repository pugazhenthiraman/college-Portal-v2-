"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export type Experience = {
  employer: string;
  startDate: string;
  endDate: string;
  role: string;
  responsibilities: string;
  ctc: string;
};

interface WorkExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const emptyExperience: Experience = {
  employer: "",
  startDate: "",
  endDate: "",
  role: "",
  responsibilities: "",
  ctc: "",
};

export default function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Experience>(emptyExperience);

  // Populate draft
  useEffect(() => {
    if (editingIndex === null) return;
    setDraft(editingIndex >= 0 ? data[editingIndex] : emptyExperience);
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((idx: number) => setEditingIndex(idx), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  // Compute diffs
  const diffFields = (orig: Experience, upd: Experience) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof Experience)[]).forEach((k) => {
      if (orig[k] !== upd[k]) diffs.push(`${k}: "${orig[k]}" → "${upd[k]}"`);
    });
    return diffs;
  };

  const handleSave = useCallback(() => {
    if (editingIndex === null) return;
    const isNew = editingIndex < 0;
    let message: string;

    if (isNew) {
      message =
        "Add this experience?\n\n" +
        Object.entries(draft)
          .map(([k, v]) => `${k}: "${v}"`)
          .join("\n");
    } else {
      const changes = diffFields(data[editingIndex], draft);
      if (changes.length === 0) {
        alert("No changes to save.");
        return;
      }
      message = "Confirm changes:\n\n" + changes.join("\n");
    }

    if (window.confirm(message)) {
      const next = isNew
        ? [...data, draft]
        : data.map((it, i) => (i === editingIndex ? draft : it));
      onChange(next);
      setEditingIndex(null);
      toast.success("Saved");
    }
  }, [data, draft, editingIndex, onChange]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Work Experience <span className="text-gray-500 text-base">(optional)</span></h2>

      {/* List existing */}
      {data.map((item, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{item.employer}</h3>
              <p className="text-sm text-gray-600">{item.role}</p>
            </div>
            <button
              onClick={() => startEdit(i)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Duration</dt>
            <dd>{item.startDate} – {item.endDate}</dd>
            <dt className="font-medium">CTC</dt>
            <dd>{item.ctc}</dd>
            <dt className="font-medium col-span-2">Responsibilities</dt>
            <dd className="col-span-2 whitespace-pre-wrap">{item.responsibilities}</dd>
          </dl>
        </div>
      ))}

      {/* Add button */}
      {editingIndex === null && (
        <button
          onClick={startAdd}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Experience
        </button>
      )}

      {/* Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Experience" : `Edit Experience #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employer Name</label>
                <Input
                  value={draft.employer}
                  onChange={(e) => setDraft(d => ({ ...d, employer: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role / Position</label>
                <Input
                  value={draft.role}
                  onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft(d => ({ ...d, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft(d => ({ ...d, endDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">CTC Offered</label>
                <Input
                  placeholder="e.g. ₹5,00,000"
                  value={draft.ctc}
                  onChange={(e) => setDraft(d => ({ ...d, ctc: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Responsibilities</label>
                <Textarea
                  rows={4}
                  value={draft.responsibilities}
                  onChange={(e) => setDraft(d => ({ ...d, responsibilities: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={cancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
