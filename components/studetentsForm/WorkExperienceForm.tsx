"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { formatDateRange } from "@/utils/helper";
import { addDays, subDays } from "date-fns";
import villageData from '../../utils/village-location.json';
import { Combobox } from '@headlessui/react';
import { CheckCircle2, Loader2 } from "lucide-react";
import React from "react";

export type Experience = {
  employer: string;
  startDate: string;
  endDate: string;
  role: string;
  responsibilities: string;
  ctc: string;
  certificate?: string;      // file path or URL
  certificateName?: string;  // display name
  id: string;
  state: string;
  district: string;
  block: string;
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
  certificate: "",
  certificateName: "",
  id: "",
  state: "Tamil Nadu",
  district: "",
  block: "",
};

function sanitizeExperience(exp: Partial<Experience>): Experience {
  return {
    employer: exp.employer ?? "",
    startDate: exp.startDate ?? "",
    endDate: exp.endDate ?? "",
    role: exp.role ?? "",
    responsibilities: exp.responsibilities ?? "",
    ctc: exp.ctc ?? "",
    certificate: exp.certificate ?? "",
    certificateName: exp.certificateName ?? "",
    id: exp.id ?? "",
    state: exp.state ?? "Tamil Nadu",
    district: exp.district ?? "",
    block: exp.block ?? "",
  };
}

// Helper to format number as Indian currency (lakhs/crores)
function formatIndianNumber(num: string) {
  if (!num) return '';
  const [intPart, decPart] = num.split('.');
  let x = intPart.replace(/\D/g, '');
  let lastThree = x.substring(x.length - 3);
  let otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') lastThree = ',' + lastThree;
  let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  if (decPart) formatted += '.' + decPart.replace(/\D/g, '');
  return formatted;
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

export default function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Experience>(emptyExperience);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>('');
  const [selectedBlock, setSelectedBlock] = React.useState<string>('');
  const [districtQuery, setDistrictQuery] = React.useState('');
  const [blockQuery, setBlockQuery] = React.useState('');
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = useState(false);

  // Populate draft, always sanitize to avoid null/undefined
  useEffect(() => {
    if (editingIndex === null) return;
    if (editingIndex >= 0) {
      setDraft(sanitizeExperience(data[editingIndex]));
    } else {
      setDraft(emptyExperience);
    }
  }, [editingIndex, data]);

  React.useEffect(() => {
    if (!draft) return;
    setSelectedDistrict(draft.district || '');
    setSelectedBlock(draft.block || '');
  }, [draft]);

  const blocks =
    villageData.find(d => d.district === selectedDistrict)?.blocks.map(b => b.block) || [];
  const filteredDistricts = districtQuery === ''
    ? villageData
    : villageData.filter(d => d.district.toLowerCase().includes(districtQuery.toLowerCase()));
  const filteredBlocks = blockQuery === ''
    ? blocks
    : blocks.filter(b => b.toLowerCase().includes(blockQuery.toLowerCase()));

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
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      toast.error("End date must be after start date.");
      return;
    }
    const isNew = editingIndex < 0;
    const next = isNew
      ? [...data, draft]
      : data.map((it, i) => (i === editingIndex ? draft : it));
    onChange(next); // Only update local state, no backend sync here
    setEditingIndex(null);
    toast.success("Experience saved!");
  }, [data, draft, editingIndex, onChange]);

  // Handle certificate upload
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow PDF, JPG, PNG (not GIF, not video)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png"
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Optional: size limit (e.g., 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size should be less than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", "workExperienceCertificate");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.path) {
        setDraft(d => ({
          ...d,
          certificate: result.path,
          certificateName: file.name,
        }));
        toast.success("Certificate uploaded!");
      } else {
        toast.error(result.error || "Upload failed");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error("Upload failed");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove certificate
  const handleRemoveCertificate = () => {
    setDraft(d => ({
      ...d,
      certificate: "",
      certificateName: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
     

      {/* List existing */}
      {data.map((item, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{item.employer ?? ""}</h3>
              <p className="text-sm text-gray-600">{item.role ?? ""}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(i)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  toast.custom((t) => (
                    <RemoveToast
                      label="Remove this experience?"
                      onConfirm={async () => {
                        try {
                          const res = await fetch('/api/students/studetnsMultiSetForm', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: item.id, type: 'workExperience' }),
                          });
                          const result = await res.json();
                          if (res.ok && result.success) {
                            const next = data.filter((_, idx) => idx !== i);
                            onChange(next);
                            toast.success('Experience removed!');
                          } else {
                            toast.error(result.error || 'Failed to remove experience');
                          }
                        } catch (err) {
                          toast.error('Failed to remove experience');
                        }
                      }}
                      onCancel={() => toast.dismiss(t.id)}
                    />
                  ), { position: 'top-center', duration: 6000 });
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Duration</dt>
            <dd>{formatDateRange(item.startDate, item.endDate)}</dd>
            <dt className="font-medium">CTC</dt>
            <dd>{formatIndianNumber(item.ctc ?? "")} LPA</dd>
            <dt className="font-medium col-span-2">Responsibilities</dt>
            <dd className="col-span-2 whitespace-pre-wrap">{item.responsibilities ?? ""}</dd>
            <dt className="font-medium">Certificate</dt>
            <dd>
              {item.certificate ? (
                <a
                  href={item.certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {item.certificateName || "View Certificate"}
                </a>
              ) : (
                <span className="text-gray-400">No certificate</span>
              )}
            </dd>
            <dt className="font-medium">Location:</dt>
            <dd>{item.state || 'Tamil Nadu'}, {item.district}, {item.block}</dd>
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
                <label className="block text-sm font-medium mb-1">Employer Name (Optional)</label>
                <Input
                  value={draft.employer ?? ""}
                  onChange={(e) => setDraft(d => ({ ...d, employer: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role / Position (Optional)</label>
                <Input
                  value={draft.role ?? ""}
                  onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                <Input
                  type="date"
                  value={draft.startDate ? draft.startDate.substring(0, 10) : ""}
                  max={draft.endDate ? subDays(new Date(draft.endDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e) => setDraft(d => ({ ...d, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                <Input
                  type="date"
                  value={draft.endDate ? draft.endDate.substring(0, 10) : ""}
                  min={draft.startDate ? addDays(new Date(draft.startDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e) => setDraft(d => ({ ...d, endDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">CTC Offered (Optional)</label>
                <div className="relative flex items-center">
                <Input
                    value={formatIndianNumber(draft.ctc ?? "")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      let val = e.target.value.replace(/,/g, '');
                      if (/^\d*\.?\d*$/.test(val)) {
                        setDraft(d => ({ ...d, ctc: val }));
                      } else {
                        toast.error("Please enter a valid number for CTC, e.g., 5 or 6.5");
                      }
                    }}
                    placeholder="e.g. 6"
                    inputMode="decimal"
                    pattern="^\\d*\\.?\\d*$"
                  />
                  <span className="absolute right-3 text-gray-500 select-none pointer-events-none">LPA</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Responsibilities (Optional)</label>
                <Textarea
                  rows={4}
                  value={draft.responsibilities ?? ""}
                  onChange={(e) => setDraft(d => ({ ...d, responsibilities: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Experience Certificate (Optional, PDF/JPG/PNG)</label>
                {draft.certificate ? (
                  <div className="flex items-center space-x-2">
                    <a
                      href={draft.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm truncate max-w-[180px]"
                      title={draft.certificateName}
                    >
                      {draft.certificateName || "View Certificate"}
                    </a>
                    <button
                      type="button"
                      onClick={handleRemoveCertificate}
                      className="text-red-500 hover:text-red-700 text-lg font-bold"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpeg,.jpg,.png,.pdf"
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1"
                    onChange={handleCertificateUpload}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State (Optional)</label>
                <Input
                  value={draft.state || 'Tamil Nadu'}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District (Optional)</label>
                <Combobox value={selectedDistrict} onChange={(value) => {
                  setSelectedDistrict(value ?? "");
                  setDraft({ ...draft, district: value ?? "", block: '' });
                  setSelectedBlock('');
                  setDistrictQuery('');
                }}>
                  {({ open }) => (
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border rounded px-2 py-1"
                        displayValue={(district: string) => district}
                        onFocus={e => { if (!open) e.target.select(); }}
                        onChange={e => setDistrictQuery(e.target.value)}
                        placeholder="Select District"
                        value={districtQuery || selectedDistrict}
                      />
                      {open && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                          {filteredDistricts.length === 0 ? (
                            <div className="px-4 py-2 text-gray-500">No districts found</div>
                          ) : (
                            filteredDistricts.map((d: any) => (
                              <Combobox.Option
                                key={d.district}
                                value={d.district}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'}`
                                }
                              >
                                {d.district}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      )}
                    </div>
                  )}
                </Combobox>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Block (Optional)</label>
                <Combobox value={selectedBlock} onChange={(value) => {
                  setSelectedBlock(value ?? "");
                  setDraft({ ...draft, block: value ?? "" });
                  setBlockQuery('');
                }} disabled={!selectedDistrict}>
                  {({ open }) => (
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border rounded px-2 py-1"
                        displayValue={(block: string) => block}
                        onFocus={e => { if (!open) e.target.select(); }}
                        onChange={e => setBlockQuery(e.target.value)}
                        placeholder="Select Block"
                        disabled={!selectedDistrict}
                        value={blockQuery || selectedBlock}
                      />
                      {open && (
                        <Combobox.Options className="absolute z-10 bottom-full mb-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                          {filteredBlocks.length === 0 ? (
                            <div className="px-4 py-2 text-gray-500">No blocks found</div>
                          ) : (
                            filteredBlocks.map((b: string) => (
                              <Combobox.Option
                                key={b}
                                value={b}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'}`
                                }
                              >
                                {b}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      )}
                    </div>
                  )}
                </Combobox>
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