// components/studetentsForm/PlacementsForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";

export type Placement = {
  employer: string;
  designation: string;
  onCampus: boolean;
  ctc: string;
};

interface Props {
  data: Placement[];
  onChange: (data: Placement[]) => void;
}

const emptyPlacement: Placement = {
  employer: "",
  designation: "",
  onCampus: true,
  ctc: "",
};

export default function PlacementsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Placement>(emptyPlacement);

  // Populate draft when editingIndex changes
  useEffect(() => {
    if (editingIndex === null) return;
    if (editingIndex >= 0) {
      setDraft(data[editingIndex]);
    } else {
      setDraft(emptyPlacement);
    }
  }, [editingIndex, data]);

  // Open modal to add new
  const startAdd = useCallback(() => setEditingIndex(-1), []);
  // Open modal to edit existing
  const startEdit = useCallback((idx: number) => setEditingIndex(idx), []);
  // Cancel add/edit
  const cancel = useCallback(() => setEditingIndex(null), []);

  // Compute diffs between original and updated
  const diffFields = (orig: Placement, upd: Placement) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof Placement)[]).forEach((k) => {
      if (String(orig[k]) !== String(upd[k])) {
        diffs.push(
          `${k}: "${String(orig[k])}" → "${String(upd[k])}"`
        );
      }
    });
    return diffs;
  };

  // Save draft into the list (with confirmation)
  const handleSave = useCallback(() => {
    if (editingIndex === null) return;
    const isNew = editingIndex < 0;
    let confirmMsg = "";

    if (isNew) {
      confirmMsg =
        "Add new placement with:\n" +
        Object.entries(draft)
          .map(([k, v]) => `${k}: "${v}"`)
          .join("\n");
    } else {
      const original = data[editingIndex];
      const changes = diffFields(original, draft);
      if (changes.length === 0) {
        alert("No changes detected.");
        return;
      }
      confirmMsg = "Confirm update:\n" + changes.join("\n");
    }

    if (!window.confirm(confirmMsg)) return;

    let next: Placement[];
    if (isNew) {
      next = [...data, draft];
    } else {
      next = data.map((it, i) => (i === editingIndex ? draft : it));
    }
    onChange(next);
    setEditingIndex(null);
  }, [data, draft, editingIndex, onChange]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Placement Details</h2>

      {/* Existing cards */}
      {data.map((pl, i) => (
        <div
          key={i}
          className="p-6 border rounded-lg bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{pl.employer}</h3>
              <p className="text-gray-600">{pl.designation}</p>
            </div>
            <button
              onClick={() => startEdit(i)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Type:</dt>
            <dd>{pl.onCampus ? "On-campus" : "Off-campus"}</dd>
            <dt className="font-medium">CTC Offered:</dt>
            <dd>{pl.ctc}</dd>
          </dl>
        </div>
      ))}

      {/* Modal form for Add/Edit */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Placement" : `Edit Placement #${editingIndex + 1}`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employer Name</label>
                <Input
                  value={draft.employer}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, employer: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <Input
                  value={draft.designation}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, designation: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <span className="block text-sm font-medium mb-1">Placement Type</span>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="placement-type"
                      checked={draft.onCampus}
                      onChange={() =>
                        setDraft((d) => ({ ...d, onCampus: true }))
                      }
                    />
                    <span>On-campus</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="placement-type"
                      checked={!draft.onCampus}
                      onChange={() =>
                        setDraft((d) => ({ ...d, onCampus: false }))
                      }
                    />
                    <span>Off-campus</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">CTC Offered</label>
                <Input
                  value={draft.ctc}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, ctc: e.target.value }))
                  }
                  placeholder="e.g. 6 LPA"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new placement */}
      {editingIndex === null && (
        <button
          type="button"
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Placement
        </button>
      )}
    </div>
  );
}
