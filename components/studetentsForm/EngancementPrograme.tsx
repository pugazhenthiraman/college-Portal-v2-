// components/stud​etentsForm/EnhancementProgramForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import villageData from '../../utils/village-location.json';
import { Combobox } from '@headlessui/react';
import { RemoveToast } from './InternshipsForm';
import ExpandableText from "../ExpandableText";

export type EnhancementProgram = {
  name: string;
  district: string;
  block: string;
  details: string;
  contribution: string;
  startDate?: string;
  endDate?: string;
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
  startDate: "",
  endDate: "",
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
}

export default function EnhancementProgramForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<EnhancementProgram>(emptyProgram);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [blockQuery, setBlockQuery] = useState('');

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
    const isNew = editingIndex < 0;
    const next = isNew
      ? [...data, draft]
      : data.map((it, idx) => (idx === editingIndex ? draft : it));
    onChange(next);
    setEditingIndex(null);
    toast.success(isNew ? "Event added" : "Event updated");
  }, [data, draft, editingIndex, onChange]);

  // Add RemoveToast component (copied from ProjectsForm)
  function RemoveToast({ label, onConfirm, onCancel }: { label: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
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

  // Replace handleRemove with toast-based confirmation
  const handleRemove = useCallback(
    (i: number) => {
      toast.custom((t) => (
        <RemoveToast
          label="Remove this event?"
          onConfirm={async () => {
            onChange(data.filter((_, idx) => idx !== i));
            toast.success("Event removed");
          }}
          onCancel={() => toast.dismiss(t.id)}
        />
      ), { position: 'top-center', duration: 6000 });
    },
    [data, onChange]
  );

  const blocks =
    villageData.find(d => d.district === selectedDistrict)?.blocks.map(b => b.block) || [];
  const filteredDistricts = districtQuery === ''
    ? villageData
    : villageData.filter(d => d.district.toLowerCase().includes(districtQuery.toLowerCase()));
  const filteredBlocks = blockQuery === ''
    ? blocks
    : blocks.filter(b => b.toLowerCase().includes(blockQuery.toLowerCase()));

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
              <p className="text-sm text-gray-600">{'Tamil Nadu'}, {ev.district}, {ev.block}</p>
              <p className="text-xs text-gray-500">
                {ev.startDate && ev.endDate
                  ? `${formatDisplayDate(ev.startDate)} to ${formatDisplayDate(ev.endDate)}`
                  : ''}
              </p>
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
              <dd><ExpandableText value={ev.details} /></dd>
            </div>
            <div>
              <dt className="font-medium">Your Contribution:</dt>
              <dd><ExpandableText value={ev.contribution} /></dd>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Combobox value={selectedDistrict} onChange={(value) => {
                  setSelectedDistrict(value ?? "");
                  setDraft(d => ({ ...d, district: value ?? "", block: "" }));
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
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
                <Combobox value={selectedBlock} onChange={(value) => {
                  setSelectedBlock(value ?? "");
                  setDraft(d => ({ ...d, block: value ?? "" }));
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
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={draft.startDate ? draft.startDate.substring(0, 10) : ""}
                  max={draft.endDate ? draft.endDate : undefined}
                  onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={draft.endDate ? draft.endDate.substring(0, 10) : ""}
                  min={draft.startDate ? draft.startDate : undefined}
                  onChange={e => setDraft(d => ({ ...d, endDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
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
              <div className="md:col-span-2">
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
