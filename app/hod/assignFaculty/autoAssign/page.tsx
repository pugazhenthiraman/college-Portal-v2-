"use client";

import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Dialog } from "@headlessui/react";

type Faculty   = { userId: number; name: string };
type AssignmentMap = Record<number, string[]>;

export default function AutoAssignPage() {
  const [faculty,    setFaculty]    = useState<Faculty[]>([]);
  const [sections,   setSections]   = useState<string[]>([]);
  const [assignMap,  setAssignMap]  = useState<AssignmentMap>({});
  const [editing,    setEditing]    = useState<Faculty | null>(null);
  const [selSecs,    setSelSecs]    = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        const [fRes, sRes, aRes] = await Promise.all([
          fetch("/api/hod/upload-faculty").then(r => r.json()),
          fetch("/api/hod/students").then(r => r.json()),
          fetch("/api/hod/assignFaculty/autoAssign").then(r => r.json()),
        ]);

        if (!fRes.faculty || !sRes.students || !aRes.assignments) {
          throw new Error("Incomplete data from server");
        }

        setFaculty(
          fRes.faculty.map((f: any) => ({ userId: f.userId, name: f.name }))
        );

        setSections(
          Array.from(new Set(sRes.students.map((s: any) => s.section).filter(Boolean)))
        );

        setAssignMap(aRes.assignments as AssignmentMap);
      } catch (err: any) {
        toast.error("Load error: " + err.message);
      }
    }
    load();
  }, []);

  // Sections already assigned to *other* faculty
  const usedSections = useMemo(
    () => Object.entries(assignMap).flatMap(([uid, secs]) =>
      editing && Number(uid) === editing.userId ? [] : secs
    ),
    [assignMap, editing]
  );

  // Start editing one faculty
  function openEdit(f: Faculty) {
    setEditing(f);
    setSelSecs(assignMap[f.userId] || []);
  }

  // Toggle one section checkbox
  function toggleSec(sec: string) {
    setSelSecs(curr =>
      curr.includes(sec) ? curr.filter(s => s !== sec) : [...curr, sec]
    );
  }

  // Persist for this one faculty (without redirect)
  async function save() {
    if (!editing) return;
    setLoading(true);
    try {
      // Build payload array
      const payload = faculty.map(f => ({
        userId:   f.userId,
        sections: f.userId === editing.userId ? selSecs : assignMap[f.userId] || []
      }));

      const res  = await fetch("/api/hod/assignFaculty/autoAssign", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Update local map
      setAssignMap(prev => ({ ...prev, [editing.userId]: selSecs }));
      toast.success("Saved!");
      setEditing(null);
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center mt-16">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6">Auto-Assign by Section</h1>
      <div className="grid gap-6 w-full max-w-4xl sm:grid-cols-2 lg:grid-cols-3">
        {faculty.map(f => (
          <div key={f.userId} className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold mb-2">{f.name}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {(assignMap[f.userId] || []).length
                ? assignMap[f.userId].map(sec => (
                    <span
                      key={sec}
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
                    >
                      {sec}
                    </span>
                  ))
                : <span className="text-gray-400 text-sm">— none —</span>
              }
            </div>
            <button
              onClick={() => openEdit(f)}
              className="text-indigo-600 hover:underline text-sm"
            >
              Edit…
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30"
      >
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Assign Sections to {editing?.name}
          </Dialog.Title>
          <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
            {sections.map(sec => {
              const disabled = usedSections.includes(sec) && !selSecs.includes(sec);
              return (
                <label key={sec} className={`flex items-center space-x-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selSecs.includes(sec)}
                    onChange={() => toggleSec(sec)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-gray-800">{sec}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
