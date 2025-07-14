"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast, { Toaster } from "react-hot-toast";

export type Internship = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string;
  certificate?: string; // Base64 or URL, for potential preview
  certificateName?: string; // Original file name
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
  location: "",
  responsibilities: "",
  certificate: undefined,
  certificateName: undefined,
};

// Static JSON data for states, districts, and places (replace with API if needed)
const locationData = {
  states: [
    {
      name: "State1",
      districts: [
        {
          name: "District1",
          places: ["Place1", "Place2"]
        },
        {
          name: "District2",
          places: ["Place3", "Place4"]
        }
      ]
    },
    {
      name: "State2",
      districts: [
        {
          name: "District3",
          places: ["Place5", "Place6"]
        },
        {
          name: "District4",
          places: ["Place7", "Place8"]
        }
      ]
    }
  ]
};

export default function InternshipsForm({ data, onChange }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Internship>(emptyInternship);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [places, setPlaces] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate draft on edit/add
  useEffect(() => {
    if (editingIndex === null) return;
    setDraft(editingIndex >= 0 ? data[editingIndex] : emptyInternship);
    setSelectedState(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setPlaces([]);
  }, [editingIndex, data]);

  const startAdd = useCallback(() => setEditingIndex(-1), []);
  const startEdit = useCallback((i: number) => setEditingIndex(i), []);
  const cancel = useCallback(() => setEditingIndex(null), []);

  // Handle location updates when state is selected
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const selected = locationData.states.find((s) => s.name === state);
    if (selected) {
      setDistricts(selected.districts);
      setSelectedDistrict(null);
      setPlaces([]);
    }
  };

  // Handle district selection
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    const selected = districts.find((d) => d.name === district);
    if (selected) {
      setPlaces(selected.places);
    }
  };

  // Confirm & save the internship
  const handleSave = useCallback(async () => {
    if (editingIndex === null) return;
    const isNew = editingIndex < 0;

    // Validation
    if (!draft.company || !draft.role || !draft.startDate || !draft.endDate || !draft.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let confirmMsg: string;
    if (isNew) {
      confirmMsg =
        "Add this internship?\n\n" +
        (Object.entries(draft) as [keyof Internship, any][]).filter(([k]) => k !== "certificate")
          .map(([k, v]) => `${k}: "${v ?? ""}"`)
          .join("\n");
    } else {
      confirmMsg = "Confirm update:\n\n" + Object.entries(draft).map(([k, v]) => `${k}: "${v ?? ""}"`).join("\n");
    }

    if (!window.confirm(confirmMsg)) return;

    const next = isNew ? [...data, draft] : data.map((it, idx) => (idx === editingIndex ? draft : it));

    // Save to backend
    try {
      const res = await fetch("/api/students/studetnsMultiSetForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "internships", data: next }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to save internships. Please try again.");
      } else {
        toast.success("Internship saved successfully!");
        onChange(next);
        setEditingIndex(null);
      }
    } catch (err) {
      toast.error("Network error: Could not save internship.");
    }
  }, [editingIndex, draft, data, onChange]);

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
            <dd>{item.startDate} – {item.endDate}</dd>
            <dt className="font-medium">Location:</dt>
            <dd>{item.location}</dd>
            <dt className="font-medium col-span-2">Responsibilities:</dt>
            <dd className="col-span-2">{item.responsibilities}</dd>
            {item.certificateName && (
              <>
                <dt className="font-medium">Certificate:</dt>
                <dd>{item.certificateName}</dd>
              </>
            )}
          </dl>
        </div>
      ))}

      {/* Add/Edit overlay */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-6">
            <h3 className="text-xl font-semibold">
              {editingIndex < 0 ? "Add Internship" : `Edit Internship #${editingIndex + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select
                  value={selectedState ?? ""}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select State</option>
                  {locationData.states.map((state) => (
                    <option key={state.name} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <select
                  value={selectedDistrict ?? ""}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!selectedState}
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.name} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Place Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Place</label>
                <select
                  value={draft.location}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  className="w-full p-2 border rounded"
                  disabled={!selectedDistrict}
                >
                  <option value="">Select Place</option>
                  {places.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other fields */}
              <div className="md:col-span-2">
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
              <div className="md:col-span-2">
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
