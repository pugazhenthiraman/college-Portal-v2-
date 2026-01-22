// components/studetentsForm/PlacementsForm.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useFormActions } from "@/hooks/useFormActions";
import villageData from '../../utils/village-location.json';
import { Combobox } from '@headlessui/react';
import { CheckCircle2, Loader2 } from "lucide-react";

export type Placement = {
  employer: string;
  onCampus: boolean;
  ctc: string;
  state?: string;
  district?: string;
  block?: string;
};

interface Props {
  data: Placement[];
  onChange: (data: Placement[]) => void;
}

const emptyPlacement: Placement = {
  employer: "",
  onCampus: true,
  ctc: "",
  state: "Tamil Nadu",
  district: "",
  block: "",
};

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

export default function PlacementsForm({ data, onChange }: Props) {
  // Custom validation and field checking logic
  const getMissingFields = (placement: Placement) => {
    const required: (keyof Placement)[] = ["employer", "ctc"];
    return required.filter(field => !placement[field] || !String(placement[field]).trim());
  };

  const diffFields = (orig: Placement, updated: Placement) => {
    return (Object.keys(orig) as (keyof Placement)[])
      .filter(k => String(orig[k]) !== String(updated[k]));
  };

  // Use the shared form actions hook
  const {
    draft,
    setDraft,
    startEdit,
    startAdd,
    cancel,
    save,
    isEditing,
    isNew
  } = useFormActions<Placement>({
    onSave: onChange,
    getMissingFields,
    diffFields,
    toastDuration: 4000,
    allowPartialSave: true
  });

  const [selectedDistrict, setSelectedDistrict] = React.useState<string>('');
  const [selectedBlock, setSelectedBlock] = React.useState<string>('');
  const [districtQuery, setDistrictQuery] = React.useState('');
  const [blockQuery, setBlockQuery] = React.useState('');
  const [removingIdx, setRemovingIdx] = React.useState<number | null>(null);
  const [removalSuccess, setRemovalSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!draft) return;
    setSelectedDistrict(draft.district || '');
    setSelectedBlock(draft.block || '');
  }, [draft]);

  const blocks =
    villageData.find(d => d.district === selectedDistrict)?.blocks.map(b => b.block) || [];

  // Filtering logic
  const filteredDistricts = districtQuery === ''
    ? villageData
    : villageData.filter(d => d.district.toLowerCase().includes(districtQuery.toLowerCase()));
  const filteredBlocks = blockQuery === ''
    ? blocks
    : blocks.filter(b => b.toLowerCase().includes(blockQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Existing cards */}
      {data.map((pl, i) => (
        <div
          key={i}
          className="p-6 border rounded-lg bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">{pl.employer}</h3>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(i, pl)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  toast.custom((t) => (
                    <RemoveToast
                      label="Remove this placement?"
                      onConfirm={async () => {
                        await new Promise(r => setTimeout(r, 500)); // Simulate async
                        onChange(data.filter((_, idx) => idx !== i));
                        toast.success('Placement removed!');
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
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="font-medium">Type:</dt>
            <dd>{pl.onCampus ? "On-campus" : "Off-campus"}</dd>
            <dt className="font-medium">CTC Offered:</dt>
            <dd>{formatIndianNumber(pl.ctc)} LPA</dd>
            <dt className="font-medium">Location:</dt>
            <dd>{pl.state || 'Tamil Nadu'}, {pl.district}, {pl.block}</dd>
          </dl>
        </div>
      ))}

      {/* Modal form for Add/Edit */}
      {isEditing && draft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {isNew ? "Add Placement" : "Edit Placement"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employer Name</label>
                <Input
                  value={draft.employer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setDraft({ ...draft, employer: e.target.value })}
                />
              </div>
              {/* State (read-only) */}
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Input
                  value={draft.state || 'Tamil Nadu'}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              {/* District */}
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
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
              {/* Block */}
              <div>
                <label className="block text-sm font-medium mb-1">Block</label>
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
              <div className="md:col-span-2">
                <span className="block text-sm font-medium mb-1">Placement Type</span>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="placement-type"
                      checked={draft.onCampus}
                      onChange={() => setDraft({ ...draft, onCampus: true })}
                    />
                    <span>On-campus</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="placement-type"
                      checked={!draft.onCampus}
                      onChange={() => setDraft({ ...draft, onCampus: false })}
                    />
                    <span>Off-campus</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">CTC Offered</label>
                <div className="relative flex items-center">
                  <Input
                    value={formatIndianNumber(draft.ctc)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      let val = e.target.value.replace(/,/g, '');
                      // Allow only numbers and one decimal point
                      if (/^\d*\.?\d*$/.test(val)) {
                        setDraft({ ...draft, ctc: val });
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
                onClick={() => save(data)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new placement */}
      {!isEditing && (
        <button
          type="button"
          onClick={() => startAdd(emptyPlacement)}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Placement
        </button>
      )}
    </div>
  );
}
