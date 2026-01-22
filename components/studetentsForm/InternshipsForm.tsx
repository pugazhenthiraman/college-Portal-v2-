"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import villageData from '../../utils/village-location.json';
import { addDays, subDays } from "date-fns";
import { formatDateRange } from "@/utils/helper";
import { useFormActions } from '@/hooks/useFormActions';
import { Combobox } from '@headlessui/react';
import { CheckCircle2, Loader2 } from "lucide-react";
import ExpandableText from "../ExpandableText";

export type Internship = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  state?: string;
  district?: string;
  block?: string;
  responsibilities: string;
  certificate?: string; // Base64 or URL, for potential preview
  certificateName?: string; // Original file name
  mode?: 'ONSITE' | 'WORK_FROM_HOME';
  stipend?: string; // Optional
  supervisorName?: string; // Optional
  companyEmail: string; // Required
};

interface Props {
  data: Internship[];
  onChange: (data: Internship[]) => void;
}

const emptyInternship: Internship = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  state: "",
  district: "",
  block: "",
  responsibilities: "",
  certificate: undefined,
  certificateName: undefined,
  mode: undefined,
  stipend: "",
  supervisorName: "",
  companyEmail: "",
};

// Helper: compare two internship objects for changes
function diffFields(orig: Internship, upd: Internship) {
  const keys = Object.keys(orig) as (keyof Internship)[];
  return keys.filter(k => (orig[k] ?? "") !== (upd[k] ?? ""));
}

// Helper: get missing required fields (excluding optional ones)
function getMissingFields(d: Internship) {
  const required: (keyof Internship)[] = [
    "company", "role", "startDate", "endDate", "district", "block", "responsibilities", "companyEmail", "mode"
  ];
  return required.filter(k => !d[k] || String(d[k]).trim() === "");
}

// Helper: format field name to be more readable
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

// Helper function to ensure all required fields are present
function ensureInternship(data: Partial<Internship>): Internship {
  return {
    company: data.company || "",
    role: data.role || "",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    state: data.state || "Tamil Nadu",
    district: data.district || "",
    block: data.block || "",
    responsibilities: data.responsibilities || "",
    certificate: data.certificate,
    certificateName: data.certificateName,
    mode: data.mode,
    stipend: data.stipend || "",
    supervisorName: data.supervisorName || "",
    companyEmail: data.companyEmail || "",
  };
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

export default function InternshipsForm({ data, onChange }: Props) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [blockQuery, setBlockQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = useState(false);

  const {
    editingIndex,
    draft,
    setDraft,
    startEdit,
    startAdd,
    cancel,
    save
  } = useFormActions<Internship>({
    getMissingFields,
    diffFields,
    onSave: onChange
  });

  // Update draft with proper typing
  const updateDraft = useCallback((updates: Partial<Internship>) => {
    setDraft((current) => {
      if (!current) return null;
      return ensureInternship({ ...current, ...updates });
    });
  }, [setDraft]);

  // Populate district/block when editing
  useEffect(() => {
    if (!draft) return;
    setSelectedDistrict(draft.district || '');
    setSelectedBlock(draft.block || '');
  }, [draft]);

  // Get blocks for selected district
  const blocks =
    villageData.find(d => d.district === selectedDistrict)?.blocks.map(b => b.block) || [];
  const filteredDistricts = districtQuery === ''
    ? villageData
    : villageData.filter(d => d.district.toLowerCase().includes(districtQuery.toLowerCase()));
  const filteredBlocks = blockQuery === ''
    ? blocks
    : blocks.filter(b => b.toLowerCase().includes(blockQuery.toLowerCase()));

  // Save with date validation
  const handleSave = useCallback(() => {
    // Allow empty companyEmail, but if filled, must be valid format
    if (draft.companyEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.companyEmail)) {
      toast.error("Please enter a valid company email address.");
      return;
    }
    save(data); // Only update local state, no backend sync here
  }, [draft, data, save]);

  // Handle certificate file upload
  const handleCertificateUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!draft) return;
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast.error("Only JPEG, PNG, or PDF allowed");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", "internshipCertificate");
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (result.path) {
          updateDraft({
            certificate: result.path,
            certificateName: file.name,
          });
        } else {
          toast.error(result.error || "Upload failed");
        }
      } catch {
        toast.error("Upload failed");
      }
    },
    [draft, updateDraft]
  );

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateDraft({ [name]: value } as Partial<Internship>);
  }, [updateDraft]);

  return (
    <div className="space-y-8">
      {/* Existing internship entries */}
      {data.map((item, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{item.company}</h3>
              <p className="text-sm text-gray-600">{item.role}</p>
            </div>
            <div>
              <button
                onClick={() => startEdit(i, item)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  toast.custom((t) => (
                    <RemoveToast
                      label="Remove this internship?"
                      onConfirm={async () => {
                        try {
                          const res = await fetch('/api/students/studetnsMultiSetForm', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: item.id, type: 'internship' }),
                          });
                          const result = await res.json();
                          if (res.ok && result.success) {
                            onChange(data.filter((_, idx) => idx !== i));
                            toast.success('Internship removed!');
                          } else {
                            toast.error(result.error || 'Failed to remove internship');
                          }
                        } catch (err) {
                          toast.error('Failed to remove internship');
                        }
                      }}
                      onCancel={() => toast.dismiss(t.id)}
                    />
                  ), { position: 'top-center', duration: 6000 });
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 ml-2"
              >
                Remove
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Duration:</dt>
            <dd>{formatDateRange(item.startDate, item.endDate)}</dd>
            <dt className="font-medium">Location:</dt>
            <dd>{item.state || 'Tamil Nadu'}, {item.district}, {item.block}</dd>
            <dt className="font-medium col-span-2">Responsibilities:</dt>
            <dd className="col-span-2"><ExpandableText value={item.responsibilities} /></dd>
            {item.certificateName && (
              <>
                <dt className="font-medium">Certificate:</dt>
                <dd>{item.certificateName}</dd>
              </>
            )}
            {item.mode && (
              <>
                <dt className="font-medium">Mode:</dt>
                <dd>{item.mode}</dd>
              </>
            )}
            {item.stipend && (
              <>
                <dt className="font-medium">Stipend:</dt>
                <dd>{item.stipend}</dd>
              </>
            )}
            {item.supervisorName && (
              <>
                <dt className="font-medium">Supervisor:</dt>
                <dd>{item.supervisorName}</dd>
              </>
            )}
            {item.companyEmail && (
              <>
                <dt className="font-medium">Company Email:</dt>
                <dd>{item.companyEmail}</dd>
              </>
            )}
          </dl>
        </div>
      ))}

      {/* Add/Edit overlay */}
      {editingIndex !== null && draft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Internship" : `Edit Internship #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input
                  type="text"
                  name="role"
                  value={draft.role}
                  onChange={handleInputChange}
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  type="text"
                  name="company"
                  value={draft.company}
                  onChange={handleInputChange}
                />
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Company Email</label>
                <Input
                  type="email"
                  name="companyEmail"
                  value={draft.companyEmail}
                  onChange={handleInputChange}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  name="startDate"
                  value={draft.startDate ? draft.startDate.substring(0, 10) : ""}
                  max={draft.endDate ? subDays(new Date(draft.endDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={handleInputChange}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  name="endDate"
                  value={draft.endDate ? draft.endDate.substring(0, 10) : ""}
                  min={draft.startDate ? addDays(new Date(draft.startDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={handleInputChange}
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <Combobox value={selectedDistrict} onChange={(value) => {
                  setSelectedDistrict(value ?? "");
                  updateDraft({ district: value ?? "", block: "" });
                  setSelectedBlock("");
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

              {/* Block */}
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
                <Combobox value={selectedBlock} onChange={(value) => {
                  setSelectedBlock(value ?? "");
                  updateDraft({ block: value ?? "" });
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
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
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

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  name="mode"
                  value={draft.mode || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  title="Select Mode"
                >
                  <option value="">Select Mode</option>
                  <option value="ONSITE">On-site</option>
                  <option value="WORK_FROM_HOME">Work-from-Home</option>
                </select>
              </div>
            </div>

            {/* Stipend */}
            <div>
              <label className="block text-sm font-medium mb-1">Stipend (optional)</label>
              <Input
                type="text"
                name="stipend"
                value={draft.stipend}
                onChange={handleInputChange}
              />
            </div>

            {/* Supervisor Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Supervisor Name (optional)</label>
              <Input
                type="text"
                name="supervisorName"
                value={draft.supervisorName}
                onChange={handleInputChange}
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium mb-1">Responsibilities</label>
              <Textarea
                name="responsibilities"
                rows={4}
                value={draft.responsibilities}
                onChange={handleInputChange}
              />
            </div>

            {/* Certificate */}
            <div>
              <label className="block text-sm font-medium mb-1">Certificate (JPEG, PNG, PDF)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpeg,.jpg,.png,.pdf"
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                onChange={handleCertificateUpload}
                title="Upload certificate (JPEG, PNG, or PDF)"
              />
              {draft.certificateName && (
                <div className="mt-2 text-sm text-green-700">
                  {draft.certificateName}
                </div>
              )}
            </div>

            {/* Actions */}
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

      {/* Add new button */}
      {editingIndex === null && (
        <button
          onClick={() => startAdd(emptyInternship)}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Internship
        </button>
      )}
    </div>
  );
}
