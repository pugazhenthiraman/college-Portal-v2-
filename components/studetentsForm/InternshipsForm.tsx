"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";
import villageData from '../../utils/village-location.json';
import { addDays, subDays } from "date-fns";
import { formatDateRange } from "@/utils/helper";

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

export default function InternshipsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Internship>(emptyInternship);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate draft on edit/add
  useEffect(() => {
    if (editingIndex === null) return;
    if (editingIndex >= 0) {
      const item = data[editingIndex];
      setDraft({
        company: item.company || "",
        role: item.role || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        state: item.state || "",
        district: item.district || "",
        block: item.block || "",
        responsibilities: item.responsibilities || "",
        certificate: item.certificate ?? undefined,
        certificateName: item.certificateName ?? undefined,
        mode: item.mode ?? undefined,
        stipend: item.stipend || "",
        supervisorName: item.supervisorName || "",
        companyEmail: item.companyEmail || "",
      });
      setSelectedDistrict(item.district || '');
      setSelectedBlock(item.block || '');
    } else {
      setDraft(emptyInternship);
      setSelectedDistrict('');
      setSelectedBlock('');
    }
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((i: number) => setEditingIndex(i), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  // Get blocks for selected district
  const blocks =
    villageData.find(d => d.district === selectedDistrict)?.blocks.map(b => b.block) || [];

  // Confirm & save the internship
  const handleSave = useCallback(() => {
    if (editingIndex === null) return;
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      toast.error("End date must be after start date.");
      return;
    }
    const isNew = editingIndex < 0;
    const normalizedDraft: Internship = {
      company: draft.company || "",
      role: draft.role || "",
      startDate: draft.startDate || "",
      endDate: draft.endDate || "",
      state: 'Tamil Nadu',
      district: draft.district || selectedDistrict || "",
      block: draft.block || selectedBlock || "",
      responsibilities: draft.responsibilities || "",
      certificate: draft.certificate ?? undefined,
      certificateName: draft.certificateName ?? undefined,
      mode: draft.mode ?? undefined,
      stipend: draft.stipend || "",
      supervisorName: draft.supervisorName || "",
      companyEmail: draft.companyEmail || "",
    };
    let confirmMsg: string;
    if (isNew) {
      confirmMsg =
        "Add this internship?\n\n" +
        (Object.entries(normalizedDraft) as [keyof Internship, any][]).filter(([k]) => k !== "certificate")
          .map(([k, v]) => `${k}: "${v ?? ""}"`)
          .join("\n");
    } else {
      confirmMsg = "Confirm update:\n\n" + Object.entries(normalizedDraft).map(([k, v]) => `${k}: "${v ?? ""}"`).join("\n");
    }
    if (!window.confirm(confirmMsg)) return;
    const next = isNew ? [...data, normalizedDraft] : data.map((it, idx) => (idx === editingIndex ? normalizedDraft : it));
    onChange(next);
    setEditingIndex(null);
    toast.success("Internship saved!");
  }, [editingIndex, draft, data, onChange, selectedDistrict, selectedBlock]);

  // Handle certificate file upload
  const handleCertificateUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type)) {
        alert("Only JPEG, PNG, or PDF allowed");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDraft((d) => ({
          ...d,
          certificate: reader.result as string,
          certificateName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  return (
    <div className="space-y-8">
      {/* Existing internship entries */}
      {data.map((item, i) => (
        <div key={i} className="p-6 border rounded-lg bg-white shadow-sm">
          <Toaster position="top-right" />
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{item.company}</h3>
              <p className="text-sm text-gray-600">{item.role}</p>
            </div>
            <button
              onClick={() => startEdit(i)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Duration:</dt>
            <dd>{formatDateRange(item.startDate, item.endDate)}</dd>
            <dt className="font-medium">Location:</dt>
            <dd>{item.state}, {item.district}, {item.block}</dd>
            <dt className="font-medium col-span-2">Responsibilities:</dt>
            <dd className="col-span-2">{item.responsibilities}</dd>
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
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Internship" : `Edit Internship #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Internship Title/Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Internship Title / Role</label>
                <Input
                  type="text"
                  value={draft.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, role: e.target.value }))}
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input
                  type="text"
                  value={draft.company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, company: e.target.value }))}
                />
              </div>

              {/* Company Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Company Email</label>
                <Input
                  type="email"
                  value={draft.companyEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, companyEmail: e.target.value }))}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={draft.startDate}
                  max={draft.endDate ? subDays(new Date(draft.endDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, startDate: e.target.value }))}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={draft.endDate}
                  min={draft.startDate ? addDays(new Date(draft.startDate), 1).toISOString().slice(0, 10) : undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, endDate: e.target.value }))}
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  type="text"
                  value="Tamil Nadu"
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedDistrict}
                  onChange={e => {
                    setSelectedDistrict(e.target.value);
                    setDraft(d => ({ ...d, district: e.target.value, block: "" }));
                    setSelectedBlock("");
                  }}
                  title="Select District"
                >
                  <option value="">Select District</option>
                  {villageData.map((d: any) => (
                    <option key={d.district} value={d.district}>{d.district}</option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block text-sm font-medium mb-1">Block/Town</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedBlock}
                  onChange={e => {
                    setSelectedBlock(e.target.value);
                    setDraft(d => ({ ...d, block: e.target.value }));
                  }}
                  disabled={!selectedDistrict}
                  title="Select Block"
                >
                  <option value="">Select Block</option>
                  {blocks.map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Mode Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={draft.mode || ''}
                  onChange={e => setDraft(d => ({ ...d, mode: e.target.value as 'ONSITE' | 'WORK_FROM_HOME' }))}
                  className="w-full p-2 border rounded"
                  title="Select Mode"
                >
                  <option value="">Select Mode</option>
                  <option value="ONSITE">On-site</option>
                  <option value="WORK_FROM_HOME">Work-from-Home</option>
                </select>
              </div>
            </div>

            {/* Stipend (optional) */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Stipend (optional)</label>
              <Input
                type="text"
                value={draft.stipend}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, stipend: e.target.value }))}
              />
            </div>

            {/* Supervisor/Mentor Name (optional) */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Supervisor/Mentor Name (optional)</label>
              <Input
                type="text"
                value={draft.supervisorName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, supervisorName: e.target.value }))}
              />
            </div>

            {/* Responsibilities / Details */}
            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Responsibilities / Details</label>
                <Textarea
                  rows={4}
                  value={draft.responsibilities}
                  onChange={(e) => setDraft((d) => ({
                    ...d,
                    responsibilities: e.target.value,
                  }))}
                />
              </div>

              {/* Certificate */}
            <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Certificate (JPEG, PNG, PDF)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.jpg,.png,.pdf"
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  onChange={handleCertificateUpload}
                  title="Upload certificate (JPEG, PNG, or PDF)"
                  placeholder="Choose a certificate file"
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
          onClick={startAdd}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Internship
        </button>
      )}
    </div>
  );
}
