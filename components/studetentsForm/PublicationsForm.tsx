// components/studetentsForm/PublicationsForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy} from "lucide-react";

export type Publication = {
  title: string;
  abstract: string;
  publisher: string;
  link: string;
};

interface Props {
  data: Publication[];
  onChange: (data: Publication[]) => void;
}

const emptyPub: Publication = {
  title: "",
  abstract: "",
  publisher: "",
  link: "",
};

export default function PublicationsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Publication>(emptyPub);

  // When starting to edit or add, seed draft
  useEffect(() => {
    if (editingIndex === null) return;
    if (editingIndex >= 0) {
      setDraft(data[editingIndex]);
    } else {
      setDraft(emptyPub);
    }
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((idx: number) => setEditingIndex(idx), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  const diffFields = (orig: Publication, upd: Publication) => {
    const diffs: string[] = [];
    (Object.keys(orig) as (keyof Publication)[]).forEach((k) => {
      if (orig[k] !== upd[k]) diffs.push(`${k}: "${orig[k]}" → "${upd[k]}"`);
    });
    return diffs;
  };

  const handleSave = useCallback(() => {
    if (editingIndex === null) return;
    const isNew = editingIndex < 0;
    let confirmMsg: string;
    if (isNew) {
      confirmMsg = `Add this publication?\n\n` +
        Object.entries(draft)
          .map(([k, v]) => `${k}: "${v}"`)
          .join("\n");
    } else {
      const changes = diffFields(data[editingIndex], draft);
      if (changes.length === 0) {
        alert("No changes detected.");
        return;
      }
      confirmMsg = `Confirm update:\n\n` + changes.join("\n");
    }
    if (!window.confirm(confirmMsg)) return;
    const next = isNew
      ? [...data, draft]
      : data.map((p, i) => (i === editingIndex ? draft : p));
    onChange(next);
    setEditingIndex(null);
  }, [data, draft, editingIndex, onChange]);

  const removePub = useCallback((idx: number) => {
    if (!window.confirm("Remove this publication?")) return;
    onChange(data.filter((_, i) => i !== idx));
    toast.success("Publication removed");
  }, [data, onChange]);

  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Publications / Patents</h2>

      {/* List existing */}
      {data.map((pub, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{pub.title}</h3>
              <p className="text-sm text-gray-600">Publisher: {pub.publisher}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(i)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => removePub(i)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-y-2 text-sm">
            <div>
              <dt className="font-medium">Abstract:</dt>
              <dd>{pub.abstract}</dd>
            </div>
            <div className="flex items-center space-x-2">
              <dt className="font-medium">Link:</dt>
              <dd className="flex-1">
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline truncate"
                >
                  {pub.link}
                </a>
              </dd>
              <button
                onClick={() => copyLink(pub.link)}
                title="Copy link"
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy size={16} />
              </button>
            </div>
          </dl>
        </div>
      ))}

      {/* Overlay add/edit form */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Publication" : `Edit Publication #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={draft.title}
                  onChange={(e: { target: { value: any; }; }) => setDraft(d => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Publisher Details</label>
                <Input
                  value={draft.publisher}
                  onChange={(e: { target: { value: any; }; }) => setDraft(d => ({ ...d, publisher: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Abstract</label>
                <Textarea
                  rows={4}
                  value={draft.abstract}
                  onChange={(e) => setDraft(d => ({ ...d, abstract: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium mb-1">Publication Link</label>
                <Input
                  placeholder="https://..."
                  value={draft.link}
                  onChange={(e: { target: { value: any; }; }) => setDraft(d => ({ ...d, link: e.target.value }))}
                  className="flex-1"
                />
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

      {/* Add new */}
      {editingIndex === null && (
        <button
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Publication
        </button>
      )}
    </div>
  );
}
