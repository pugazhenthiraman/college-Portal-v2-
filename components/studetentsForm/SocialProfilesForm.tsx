"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Copy, X, Edit2, CheckCircle2 } from "lucide-react";

export type SocialProfiles = {
  github?: string;
  gitlab?: string;
  bitbucket?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
};

interface Props {
  data?: Partial<SocialProfiles>;
  onChange: (data: SocialProfiles) => void;
}

const PLATFORM_LABELS: { key: keyof SocialProfiles; label: string }[] = [
  { key: "github",    label: "GitHub URL" },
  { key: "gitlab",    label: "GitLab URL" },
  { key: "bitbucket", label: "Bitbucket URL" },
  { key: "linkedin",  label: "LinkedIn URL" },
  { key: "twitter",   label: "Twitter URL" },
  { key: "portfolio", label: "Portfolio / Website" },
];

export default function SocialProfilesForm({ data = {}, onChange }: Props) {
  const [profiles, setProfiles] = useState<SocialProfiles>({});
  const [editingKey, setEditingKey] = useState<keyof SocialProfiles | null>(null);
  const [draftValue, setDraftValue] = useState("");

  // Mirror incoming prop into local state
  useEffect(() => {
    setProfiles({ ...data });
  }, [data]);

  const startEdit = useCallback(
    (key: keyof SocialProfiles) => {
      setEditingKey(key);
      setDraftValue(profiles[key] || "");
    },
    [profiles]
  );

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setDraftValue("");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingKey) return;
    const trimmed = draftValue.trim();
    const next = { ...profiles };
    if (trimmed) {
      next[editingKey] = trimmed;
      toast.success("Link saved");
    } else {
      delete next[editingKey];
      toast.success("Link removed");
    }
    setProfiles(next);
    onChange(next);
    setEditingKey(null);
    setDraftValue("");
  }, [draftValue, editingKey, onChange, profiles]);

  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  }, []);

  const removeKey = useCallback(
    (key: keyof SocialProfiles) => {
      const next = { ...profiles };
      delete next[key];
      setProfiles(next);
      onChange(next);
      toast.success("Link removed");
    },
    [onChange, profiles]
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">
        Social & Code Links <span className="text-gray-500 text-base">(optional)</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORM_LABELS.map(({ key, label }) => {
          const current = profiles[key] || "";
          const isEditing = editingKey === key;

          return (
            <div key={key} className="flex items-start space-x-4">
              <label className="w-32 font-medium pt-1">{label}:</label>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="https://..."
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {current ? (
                      <>
                        {/* show the raw link */}
                        <span className="flex items-center px-2 py-1 bg-green-50 rounded text-green-700 font-medium">
                          Link attached
                          <CheckCircle2 className="ml-1 text-green-500" size={18} />
                        </span>
                        {/* copy / edit / remove controls */}
                        <button
                          onClick={() => copyLink(current)}
                          title="Copy link"
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => startEdit(key)}
                          title="Edit link"
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => removeKey(key)}
                          title="Remove link"
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(key)}
                        className="text-indigo-600 hover:underline"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
