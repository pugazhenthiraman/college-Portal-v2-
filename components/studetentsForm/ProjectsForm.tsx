"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Copy, Edit2, X, Eye, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateRange } from "@/utils/helper";
import { addDays, subDays } from "date-fns";

export type Project = {
  title: string;
  link?: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string;
  githubRepo?: string;
};

interface Props {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const CATEGORY_OPTIONS = [
  "Freelance",
  "Company",
  "College",
  "Consultant",
  "Other",
];

const emptyProject: Project = {
  title: "",
  link: "",
  startDate: "",
  endDate: "",
  description: "",
  category: "",
  githubRepo: "",
};

// Add a helper to validate GitHub URLs
function isValidGithubUrl(url: string) {
  return /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/.test(url.trim());
}

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

export default function ProjectsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Project>(emptyProject);
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubDraft, setGithubDraft] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = useState(false);

  // Populate draft when editingIndex changes
  useEffect(() => {
    if (editingIndex === null) return;
    if (editingIndex >= 0) {
      setDraft(data[editingIndex]);
      setGithubDraft(data[editingIndex].githubRepo || "");
      setLinkDraft(data[editingIndex].link || "");
      setEditingGithub(false);
      setEditingLink(false);
    } else {
      setDraft(emptyProject);
      setGithubDraft("");
      setLinkDraft("");
      setEditingGithub(true);
      setEditingLink(true);
    }
  }, [editingIndex, data]);

  // Open modal to add new
  const startAdd = useCallback(() => setEditingIndex(-1), []);
  // Open modal to edit existing
  const startEdit = useCallback((idx: number) => setEditingIndex(idx), []);
  // Cancel add/edit
  const cancel = useCallback(() => setEditingIndex(null), []);

  // Save draft into the list
  const handleSave = useCallback(() => {
    if (!draft.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      toast.error("End date must be after start date.");
      return;
    }
    if (draft.githubRepo && !isValidGithubUrl(draft.githubRepo)) {
      toast.error("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)");
      return;
    }
    if (editingIndex === null) return;
    let next: Project[];
    const projectToSave = {
      ...draft,
      githubRepo: githubDraft.trim() || undefined,
      link: linkDraft.trim() || undefined,
    };
    if (editingIndex < 0) {
      next = [...data, projectToSave];
    } else {
      next = data.map((it, i) => (i === editingIndex ? projectToSave : it));
    }
    onChange(next);
    setEditingIndex(null);
    toast.success("Project saved.");
  }, [data, draft, editingIndex, onChange, githubDraft, linkDraft]);

  const remove = useCallback((idx: number) => {
    toast.custom((t) => (
      <RemoveToast
        label="Remove this project?"
        onConfirm={async () => {
          await new Promise(r => setTimeout(r, 500)); // Simulate async
          onChange(data.filter((_, i) => i !== idx));
          toast.success("Project removed!");
        }}
        onCancel={() => toast.dismiss(t.id)}
      />
    ), { position: 'top-center', duration: 6000 });
  }, [data, onChange]);

  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  }, []);

  // GitHub repo link UI logic
  const handleGithubSave = () => {
    if (githubDraft.trim() && !isValidGithubUrl(githubDraft.trim())) {
      toast.error("Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)");
      return;
    }
    setDraft((d) => ({ ...d, githubRepo: githubDraft.trim() || undefined }));
    setEditingGithub(false);
  };

  const handleGithubRemove = () => {
    setGithubDraft("");
    setDraft((d) => ({ ...d, githubRepo: undefined }));
    setEditingGithub(true);
  };

  // Project link UI logic
  const handleLinkSave = () => {
    setDraft((d) => ({ ...d, link: linkDraft.trim() || undefined }));
    setEditingLink(false);
  };

  const handleLinkRemove = () => {
    setLinkDraft("");
    setDraft((d) => ({ ...d, link: undefined }));
    setEditingLink(true);
  };

  return (
    <div className="space-y-8">
      {/* Existing cards */}
      {data.map((p, i) => (
        <div key={i} className="rounded-xl border bg-white shadow flex flex-col md:flex-row md:items-stretch md:justify-between p-6 gap-6">
          {/* Left: Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-xl text-indigo-800 truncate">{p.title || `Project #${i + 1}`}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(i)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => remove(i)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Remove"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="text-gray-600 text-sm mt-1">{formatDateRange(p.startDate, p.endDate)}</div>
            <div className="text-gray-500 text-xs mt-1">
              <span className="font-medium">Category:</span> {p.category || <span className="text-gray-400">Not set</span>}
            </div>
            <div className="mt-3">
              <span className="block font-medium text-gray-700 mb-1">Description:</span>
              <div className="text-gray-800 whitespace-pre-line text-sm">{p.description}</div>
            </div>
          </div>
          {/* Right: Links */}
          <div className="flex flex-col justify-center min-w-[220px] md:border-l md:pl-6 border-blue-100 mt-4 md:mt-0">
            <div>
              <span className="block font-medium text-gray-700">Project Link:</span>
              <div className="flex items-center space-x-2 mt-1">
                {p.link?.trim() ? (
                  <>
                    <span className="flex items-center px-2 py-1 bg-green-50 rounded text-green-700 font-medium">
                      Link attached
                      <CheckCircle2 className="ml-1 text-green-500" size={18} />
                    </span>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                      title="View"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(p.link!)}
                      title="Copy link"
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400">No link</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <span className="block font-medium text-gray-700">GitHub Repository:</span>
              <div className="flex items-center space-x-2 mt-1">
                {p.githubRepo?.trim() ? (
                  <>
                    <span className="flex items-center px-2 py-1 bg-green-50 rounded text-green-700 font-medium">
                      Link attached
                      <CheckCircle2 className="ml-1 text-green-500" size={18} />
                    </span>
                    <a
                      href={p.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                      title="View"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(p.githubRepo!)}
                      title="Copy link"
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400">No link</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modal form for Add/Edit */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Project" : `Edit Project #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={draft.title}
                  onChange={e =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={draft.category}
                  onChange={e =>
                    setDraft((d) => ({ ...d, category: e.target.value }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={draft.startDate ? draft.startDate.substring(0, 10) : ""}
                  max={draft.endDate ? subDays(new Date(draft.endDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={e =>
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
                  onChange={e =>
                    setDraft((d) => ({ ...d, endDate: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  rows={4}
                  value={draft.description}
                  onChange={e =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="Describe the project..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project Link (Optional)</label>
                {draft.link && !editingLink ? (
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center px-2 py-1 bg-green-50 rounded text-green-700 font-medium">
                      Link attached
                      <CheckCircle2 className="ml-1 text-green-500" size={18} />
                    </span>
                    <a
                      href={draft.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                      title="View"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(draft.link!)}
                      title="Copy link"
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLink(true)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLink(true)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      value={linkDraft}
                      onChange={e => setLinkDraft(e.target.value)}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={handleLinkSave}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    {draft.link && (
                      <button
                        type="button"
                        onClick={() => setEditingLink(false)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Repository Link</label>
                {draft.githubRepo && !editingGithub ? (
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center px-2 py-1 bg-green-50 rounded text-green-700 font-medium">
                      Link attached
                      <CheckCircle2 className="ml-1 text-green-500" size={18} />
                    </span>
                    <a
                      href={draft.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                      title="View"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(draft.githubRepo!)}
                      title="Copy link"
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGithub(true)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleGithubRemove}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      value={githubDraft}
                      onChange={e => setGithubDraft(e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                    <button
                      type="button"
                      onClick={handleGithubSave}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    {draft.githubRepo && (
                      <button
                        type="button"
                        onClick={() => setEditingGithub(false)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
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

      {/* Add new project */}
      {editingIndex === null && (
        <button
          type="button"
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Project
        </button>
      )}
    </div>
  );
}