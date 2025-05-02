// File: app/hod/assignFaculty/autoAssign/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import { ChevronRightIcon, XIcon } from "lucide-react";
import SearchBar from "@/components/searchBar"; // Import the SearchBar

type Faculty = { userId: number; name: string };
type Student = { userId: number; section: string };
type AssignmentMap = Record<number, string[]>;

export default function AutoAssignPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [assignMap, setAssignMap] = useState<AssignmentMap>({});
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [selSecs, setSelSecs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  // Load all data
  useEffect(() => {
    async function load() {
      try {
        const [fRes, sRes, aRes] = await Promise.all([
          fetch("/api/hod/upload-faculty").then(r => r.json()),
          fetch("/api/hod/students").then(r => r.json()),
          fetch("/api/hod/assignFaculty/autoAssign").then(r => r.json()),
        ]);
        if (!fRes.faculty || !sRes.students || !aRes.assignments)
          throw new Error("Incomplete data");
        setFaculty(fRes.faculty.map((f: any) => ({ userId: f.userId, name: f.name })));
        setStudents(sRes.students.map((s: any) => ({ userId: s.userId, section: s.section })));
        setSections(Array.from(new Set(sRes.students.map((s: any) => s.section as string)).values()).filter(Boolean) as string[]);
        setAssignMap(aRes.assignments);
      } catch (e: any) {
        toast.error(e.message);
      }
    }
    load();
  }, []);

  const usedSections = useMemo(() =>
    Object.entries(assignMap).flatMap(([uid, secs]) =>
      editing && Number(uid) === editing.userId ? [] : secs
    ), [assignMap, editing]
  );

  function countStudents(sec: string) {
    return students.filter(s => s.section === sec).length;
  }

  function openEdit(f: Faculty) {
    setEditing(f);
    setSelSecs(assignMap[f.userId] || []);
  }
  function toggleSec(sec: string) {
    setSelSecs(curr =>
      curr.includes(sec) ? curr.filter(s => s !== sec) : [...curr, sec]
    );
  }

  async function save() {
    if (!editing) return;
    setLoading(true);
    try {
      const payload = faculty.map(f => ({
        userId: f.userId,
        sections: f.userId === editing.userId ? selSecs : assignMap[f.userId] || []
      }));
      const res = await fetch("/api/hod/assignFaculty/autoAssign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAssignMap(m => ({ ...m, [editing.userId]: selSecs }));
      toast.success("✔️ Saved!");
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

    const filteredFaculty = useMemo(
    () =>
      faculty.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      ),
    [faculty, search]
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
      {/* Search bar at the very top */}
      <div className="flex justify-end mb-6">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Toaster position="top-right"/>
      <h1 className="text-4xl font-extrabold text-indigo-900 text-center mb-10">
        🎓 Auto-Assign by Section
      </h1>
      


      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {filteredFaculty.map(f => {
    const secs = assignMap[f.userId] || [];
    return (
      <div
        key={f.userId}
        className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-1 transition "
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{f.name}</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sections</span>
                  <span>{secs.length || "—"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {secs.length
                    ? secs.map(sec => (
                        <span
                          key={sec}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {sec}
                        </span>
                      ))
                    : (
                      <span className="text-gray-400 italic">no sections</span>
                    )}
                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-3">
                  <span>Total Students</span>
                  <span>
                    {secs.length
                      ? secs.reduce((sum, sec) => sum + countStudents(sec), 0)
                      : "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openEdit(f)}
                className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800"
                aria-label="Edit"
              >
                <ChevronRightIcon size={20} />
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onClose={() => setEditing(null)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-800">
              Assign Sections to {editing?.name}
            </Dialog.Title>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600" title="Close">
              <XIcon size={20} />
            </button>
          </div>

          <div className="grid gap-3 max-h-64 overflow-y-auto mb-6">
            {sections.map(sec => {
              const disabled = usedSections.includes(sec) && !selSecs.includes(sec);
              return (
                <label
                  key={sec}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50"}`}
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-indigo-600"
                    disabled={disabled}
                    checked={selSecs.includes(sec)}
                    onChange={() => toggleSec(sec)}
                  />
                  <span className="text-gray-800">{sec}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
