// components/studetentsForm/PublicationsForm.tsx
"use client";

import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle2, Loader2 } from "lucide-react";
import { useFormActions } from "@/hooks/useFormActions";
import { useState } from "react";
import ExpandableText from "../ExpandableText";

export type Publication = {
  title: string;
  abstract: string;
  publisher: string;
  link?: string; // Make optional
  publishedDate?: string;
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
  publishedDate: "",
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

export default function PublicationsForm({ data, onChange }: Props) {
  // Custom validation and field checking logic
  const getMissingFields = (pub: Publication) => {
    const required: (keyof Publication)[] = ["title", "abstract", "publisher"];
    return required.filter(field => !pub[field] || !pub[field].trim());
  };

  const diffFields = (orig: Publication, updated: Publication) => {
    return (Object.keys(orig) as (keyof Publication)[])
      .filter(k => orig[k] !== updated[k]);
  };

  // Use the shared form actions hook
  const {
    editingIndex,
    draft,
    setDraft,
    startEdit,
    startAdd,
    cancel,
    save,
    isEditing,
    isNew
  } = useFormActions<Publication>({
    onSave: onChange,
    getMissingFields,
    diffFields,
    toastDuration: 4000,
    allowPartialSave: true
  });

  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = useState(false);

  // Handle copying link to clipboard
  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Publications / Patents</h2>

      {/* List existing publications */}
      {data.map((pub, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{pub.title}</h3>
              <p className="text-sm text-gray-600">Publisher: {pub.publisher}</p>
              {pub.publishedDate && (
                <p className="text-xs text-gray-500">Published: {pub.publishedDate.substring(0, 10)}</p>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(i, pub)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  toast.custom((t) => (
                    <RemoveToast
                      label="Remove this publication?"
                      onConfirm={async () => {
                        await new Promise(r => setTimeout(r, 500)); // Simulate async
                        onChange(data.filter((_, idx) => idx !== i));
                        toast.success('Publication removed!');
                      }}
                      onCancel={() => toast.dismiss(t.id)}
                    />
                  ), { position: 'top-center', duration: 6000 });
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium">Abstract:</dt>
            <dd><ExpandableText value={pub.abstract} /></dd>
            {pub.link && (
              <>
                <dt className="font-medium">Link:</dt>
                <dd className="flex items-center gap-2">
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {pub.link}
                  </a>
                  <button
                    onClick={() => copyLink(pub.link)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </dd>
              </>
            )}
          </dl>
        </div>
      ))}

      {/* Edit/Add Form */}
      {isEditing && draft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold mb-4">
              {isNew ? "Add Publication" : "Edit Publication"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Publisher</label>
                <Input
                  value={draft.publisher}
                  onChange={e => setDraft({ ...draft, publisher: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Abstract</label>
                <Textarea
                  value={draft.abstract}
                  onChange={e => setDraft({ ...draft, abstract: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                <Input
                  value={draft.link}
                  onChange={e => setDraft({ ...draft, link: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Published Date</label>
                <Input
                  type="date"
                  value={draft.publishedDate ? draft.publishedDate.substring(0, 10) : ""}
                  onChange={e => setDraft({ ...draft, publishedDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={cancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => save(data)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new button */}
      {!isEditing && (
        <button
          onClick={() => startAdd(emptyPub)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Publication
        </button>
      )}
    </div>
  );
}
