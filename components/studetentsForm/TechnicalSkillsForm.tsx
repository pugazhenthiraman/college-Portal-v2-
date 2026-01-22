"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { formatDateRange } from "@/utils/helper";
import { addDays, subDays } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import ExpandableText from "../ExpandableText"; 

export type Skill = {
  courseName: string;
  startDate: string;
  endDate: string;
  details: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  certificateFile?: string;
  certificateName?: string;
};

interface Props {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const emptySkill: Skill = {
  courseName: "",
  startDate: "",
  endDate: "",
  details: "",
  level: "Beginner",
  certificateFile: undefined,
  certificateName: undefined,
};

function RemoveToast({ label, onConfirm, onCancel }) {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const handleRemove = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setSuccess(true);
    setTimeout(onCancel, 900);
  };
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-red-200 flex flex-col items-center min-w-[320px] max-w-[90vw]">
      <div className="text-lg font-semibold mb-3 text-red-700">{label}</div>
      <div className="flex gap-3 justify-center mt-2">
        <button
          className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold flex items-center gap-2 text-base disabled:opacity-60"
          disabled={loading || success}
          onClick={handleRemove}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 className="text-green-500" size={20} /> : null}
          {success ? "Removed!" : loading ? "Removing..." : "Confirm"}
        </button>
        <button
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold text-base hover:bg-gray-300"
          disabled={loading || success}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TechnicalSkillsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Skill>(emptySkill);
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (editingIndex == null) return;
    setDraft(editingIndex >= 0 ? data[editingIndex] : emptySkill);
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((i: number) => setEditingIndex(i), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  const diffFields = (orig: Skill, upd: Skill) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof Skill)[]).forEach((k) => {
      const ov = orig[k] ?? "";
      const nv = upd[k] ?? "";
      if (ov !== nv) diffs.push(`${k}: "${ov}" → "${nv}"`);
    });
    return diffs;
  };

  const handleSave = useCallback(() => {
    if (editingIndex == null) return;
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      toast.error("End date must be after start date.");
      return;
    }
    const isNew = editingIndex < 0;

    // No required fields check: allow partial/incomplete save

    const next = isNew
      ? [...data, draft]
      : data.map((s, i) => (i === editingIndex ? draft : s));

    onChange(next);
    setEditingIndex(null);
    toast.success("Technical skill saved!");
  }, [editingIndex, draft, data, onChange]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast.error("Only JPEG, PNG or PDF allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDraft((d) => ({
          ...d,
          certificateFile: reader.result as string,
          certificateName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Technical Courses & Skills</h2>

      {/* List as cards */}
      {data.map((skill, idx) => (
        <div
          key={idx}
          className="p-6 bg-white rounded-lg shadow flex justify-between items-start space-x-4"
        >
          <div className="flex-1">
            <h3 className="text-lg font-medium">{skill.courseName}</h3>
            <p className="text-sm text-gray-600">
              {formatDateRange(skill.startDate, skill.endDate)}
            </p>
            <p className="mt-2 text-sm">
              Level: <span className="font-medium">{skill.level}</span>
            </p>
            <div className="mt-2 text-sm">
              <ExpandableText value={skill.details} />
            </div>
            {skill.certificateName && (
              <p className="mt-2 text-sm text-indigo-600">
                Certificate: {skill.certificateName}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              toast.custom((t) => (
                <RemoveToast
                  label="Remove this skill?"
                  onConfirm={async () => {
                    await new Promise(r => setTimeout(r, 500)); // Simulate async
                    onChange(data.filter((_, i) => i !== idx));
                    toast.success('Skill removed!');
                  }}
                  onCancel={() => toast.dismiss(t.id)}
                />
              ), { position: 'top-center', duration: 6000 });
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 ml-2"
          >
            Remove
          </button>
          <button
            onClick={() => startEdit(idx)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
        </div>
      ))}

      {/* Overlay form */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Course" : `Edit Course #${editingIndex + 1}`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <Input
                  value={draft.courseName || ""}
                  onChange={(e: { target: { value: any; }; }) =>
                    setDraft((d) => ({ ...d, courseName: e.target.value }))
                  }
                  placeholder="e.g. React Advanced"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={draft.startDate ? draft.startDate.substring(0, 10) : ""}
                  max={draft.endDate ? subDays(new Date(draft.endDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e: { target: { value: any; }; }) =>
                    setDraft((d) => ({ ...d, startDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={draft.endDate ? draft.endDate.substring(0, 10) : ""}
                  min={draft.startDate ? addDays(new Date(draft.startDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e: { target: { value: any; }; }) =>
                    setDraft((d) => ({ ...d, endDate: e.target.value }))
                  }
                />
              </div>

              {/* Level dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Proficiency Level</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                  value={draft.level}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      level: e.target.value as Skill["level"],
                    }))
                  }
                >
                  {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Course Details</label>
                <Textarea
                  rows={4}
                  value={draft.details || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, details: e.target.value }))
                  }
                />
              </div>

              {/* Certificate Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Certificate (JPEG, PNG, PDF)
                </label>
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,.pdf"
                  className="block w-full text-sm border border-gray-300 rounded-lg p-2 cursor-pointer bg-gray-50"
                  onChange={handleFileChange}
                  title="Upload certificate file (JPEG, PNG, PDF)"
                  placeholder="Choose a certificate file"
                />
                {draft.certificateName && (
                  <p className="mt-2 text-sm text-green-700">
                    {draft.certificateName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
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

      {/* Add button */}
      {editingIndex === null && (
        <button
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Course
        </button>
      )}
    </div>
  );
}