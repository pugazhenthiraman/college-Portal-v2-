// components/stud​etentsForm/EnhancementProgramForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import villageData from '../../utils/village-location.json';

export type EnhancementProgram = {
  name: string;
  district: string;
  block: string;
  details: string;
  contribution: string;
};

interface Props {
  data: EnhancementProgram[];
  onChange: (data: EnhancementProgram[]) => void;
}

const emptyProgram: EnhancementProgram = {
  name: "",
  district: "",
  block: "",
  details: "",
  contribution: "",
};

export default function EnhancementProgramForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<EnhancementProgram>(emptyProgram);

  // Populate draft when editingIndex changes
  useEffect(() => {
    if (editingIndex === null) return;
    setDraft(editingIndex >= 0 ? data[editingIndex] : emptyProgram);
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((i: number) => setEditingIndex(i), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  const diffFields = (
    orig: EnhancementProgram,
    upd: EnhancementProgram
  ) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof EnhancementProgram)[]).forEach((k) => {
      if (orig[k] !== upd[k]) {
        diffs.push(`${k}: "${orig[k]}" → "${upd[k]}"`);
      }
    });
    return diffs;
  };

  const handleSave = useCallback(() => {
    if (editingIndex === null) return;
    if (!draft.district || !draft.block) {
      toast.error("Please select both district and block.");
      return;
    }
    const isNew = editingIndex < 0;
    let msg: string;

    if (isNew) {
      msg =
        "Add this event?\n\n" +
        Object.entries(draft)
          .map(([k, v]) => `${k}: "${v}"`)
          .join("\n");
    } else {
      const changes = diffFields(data[editingIndex], draft);
      if (changes.length === 0) {
        alert("No changes detected.");
        return;
      }
      msg = "Confirm update:\n\n" + changes.join("\n");
    }

    if (!window.confirm(msg)) return;

    const next = isNew
      ? [...data, draft]
      : data.map((it, idx) => (idx === editingIndex ? draft : it));

    onChange(next);
    setEditingIndex(null);
    toast.success(isNew ? "Event added" : "Event updated");
  }, [data, draft, editingIndex, onChange]);

  const handleRemove = useCallback(
    (i: number) => {
      if (!window.confirm("Remove this event?")) return;
      onChange(data.filter((_, idx) => idx !== i));
      toast.success("Event removed");
    },
    [data, onChange]
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Workshops & Events</h2>

      {/* Existing entries as cards */}
      {data.map((ev, i) => (
        <div
          key={i}
          className="p-6 border rounded-lg bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{ev.name}</h3>
              <p className="text-sm text-gray-600">{ev.district}, {ev.block}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(i)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(i)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-y-2 text-sm">
            <div>
              <dt className="font-medium">Event Details:</dt>
              <dd>{ev.details}</dd>
            </div>
            <div>
              <dt className="font-medium">Your Contribution:</dt>
              <dd>{ev.contribution}</dd>
            </div>
          </dl>
        </div>
      ))}

      {/* Add/Edit modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Event/Workshop" : `Edit Event #${editingIndex + 1}`}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="ep-name" className="block text-sm font-medium mb-1">
                  Event Name
                </label>
                <Input
                  id="ep-name"
                  placeholder="Enter event name"
                  value={draft.name}
                  onChange={(e: { target: { value: any; }; }) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <select
                  className="w-full border rounded px-2 py-1 mb-2"
                  value={draft.district}
                  onChange={e => {
                    const district = e.target.value;
                    setDraft(d => ({ ...d, district, block: "" }));
                  }}
                  required
                >
                  <option value="">Select district</option>
                  {villageData.map((d: any) => (
                    <option key={d.district} value={d.district}>{d.district}</option>
                  ))}
                </select>
                <label className="block text-sm font-medium mb-1">Block</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={draft.block}
                  onChange={e => setDraft(d => ({ ...d, block: e.target.value }))}
                  required
                  disabled={!draft.district}
                >
                  <option value="">{draft.district ? "Select block" : "Select district first"}</option>
                  {draft.district &&
                    villageData.find((d: any) => d.district === draft.district)?.blocks.map((b: any) => (
                      <option key={b.block} value={b.block}>{b.block}</option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="ep-details" className="block text-sm font-medium mb-1">
                  Event Details
                </label>
                <Textarea
                  id="ep-details"
                  rows={4}
                  placeholder="Describe the event..."
                  value={draft.details}
                  onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="ep-contribution" className="block text-sm font-medium mb-1">
                  Your Contribution
                </label>
                <Textarea
                  id="ep-contribution"
                  rows={4}
                  placeholder="What was your role / contribution?"
                  value={draft.contribution}
                  onChange={(e) => setDraft((d) => ({ ...d, contribution: e.target.value }))}
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

      {/* “+ Add Event” button */}
      {editingIndex === null && (
        <button
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Event
        </button>
      )}
    </div>
  );
}
