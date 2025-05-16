// components/studetentsForm/TechnicalSkillsForm.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type Skill = {
  courseName: string;
  startDate: string;
  endDate: string;
  details: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  certificateFile?: string;      // base64 or URL
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

export default function TechnicalSkillsForm({ data, onChange }: Props) {
  // -1 = new, null = no form open, >=0 = editing that index
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Skill>(emptySkill);

  // when we open the form, populate draft
  useEffect(() => {
    if (editingIndex == null) return;
    setDraft(
      editingIndex >= 0
        ? data[editingIndex]
        : emptySkill
    );
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((i: number) => setEditingIndex(i), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  // diff helper
  const diffFields = (orig: Skill, upd: Skill) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof Skill)[]).forEach((k) => {
      const ov = orig[k] ?? "";
      const nv = upd[k] ?? "";
      if (ov !== nv) diffs.push(`${k}: "${ov}" → "${nv}"`);
    });
    return diffs;
  };

  // confirm & save
  const handleSave = useCallback(() => {
    if (editingIndex == null) return;
    const isNew = editingIndex < 0;
    let message = "";

    if (isNew) {
      message = `Add this course?\n\n` +
        `Name: "${draft.courseName}"\n` +
        `Duration: ${draft.startDate} → ${draft.endDate}\n` +
        `Level: ${draft.level}\n` +
        `Details: "${draft.details}"\n` +
        (draft.certificateName ? `Certificate: ${draft.certificateName}` : "");
    } else {
      const orig = data[editingIndex];
      const changes = diffFields(orig, draft);
      if (changes.length === 0) {
        alert("No changes detected.");
        return;
      }
      message = "Confirm update:\n\n" + changes.join("\n");
    }

    if (!window.confirm(message)) return;

    const next = isNew
      ? [...data, draft]
      : data.map((s, i) =>
          i === editingIndex ? draft : s
        );

    onChange(next);
    setEditingIndex(null);
  }, [editingIndex, draft, data, onChange]);

  // read file input
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        alert("Only JPEG, PNG or PDF allowed.");
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
              {skill.startDate} → {skill.endDate}
            </p>
            <p className="mt-2 text-sm">
              Level: <span className="font-medium">{skill.level}</span>
            </p>
            <p className="mt-2 text-sm">{skill.details}</p>
            {skill.certificateName && (
              <p className="mt-2 text-sm text-indigo-600">
                Certificate: {skill.certificateName}
              </p>
            )}
          </div>
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
                  value={draft.courseName}
                  onChange={(e) =>
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
                  value={draft.startDate}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, startDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) =>
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
                  value={draft.details}
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
