"use client";

import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import { ChevronRightIcon, XIcon } from "lucide-react";
import SearchBar from "@/components/searchBar";

type Faculty = { userId: number; name: string; id?: number };
type Student = { userId: number; section: string; year?: string; facultyId?: number };
type AssignmentMap = Record<number, string[]>;

export default function AutoAssignPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignMap, setAssignMap] = useState<AssignmentMap>({});
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [selSecs, setSelSecs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [showUnassigned, setShowUnassigned] = useState(false);

  // Unassigned students per section from backend
  const [unassignedSections, setUnassignedSections] = useState<
    { section: string; academicYear: string; total: number; assigned: number; unassigned: number }[]
  >([]);

  // Assign Faculty Modal states
  const [showAssignFaculty, setShowAssignFaculty] = useState(false);
  const [assignYear, setAssignYear] = useState("");
  const [assignSection, setAssignSection] = useState("");
  const [assignFacultyId, setAssignFacultyId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Load all data
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [fRes, sRes, aRes] = await Promise.all([
        fetch("/api/hod/upload-faculty").then(r => r.json()),
        fetch("/api/hod/students").then(r => r.json()),
        fetch("/api/hod/assignFaculty/autoAssign").then(r => r.json()),
      ]);
      if (!fRes.faculty || !sRes.students || !aRes.assignments)
        throw new Error("Incomplete data");
      setFaculty(
        fRes.faculty.map((f: any) => ({
          userId: f.userId,
          name: f.name,
          id: f.id,
        }))
      );
      setStudents(
        sRes.students.map((s: any) => ({
          userId: s.userId,
          section: s.section,
          year: s.academicYear,
          facultyId: s.facultyId,
        }))
      );
      setAssignMap(aRes.assignments);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Group sections by year
  const sectionsByYear = useMemo(() => {
    const map: Record<string, string[]> = {};
    students.forEach(s => {
      const year = s.year || "Unknown Year";
      if (!map[year]) map[year] = [];
      if (!map[year].includes(s.section)) map[year].push(s.section);
    });
    return map;
  }, [students]);

  const usedSections = useMemo(
    () =>
      Object.entries(assignMap).flatMap(([uid, secs]) =>
        editing && Number(uid) === editing.userId ? [] : secs
      ),
    [assignMap, editing]
  );

  // Fetch unassigned students per section from backend when dialog opens
  async function fetchUnassignedSections() {
    const res = await fetch("/api/hod/assignFaculty/unassigned");
    const data = await res.json();
    setUnassignedSections(data.sections || []);
  }

  useEffect(() => {
    if (showUnassigned) {
      fetchUnassignedSections();
    }
  }, [showUnassigned]);

  // Group unassigned by year for dialog display
  const unassignedByYear = useMemo(() => {
    const map: Record<string, typeof unassignedSections> = {};
    unassignedSections.forEach(s => {
      if (!map[s.academicYear]) map[s.academicYear] = [];
      map[s.academicYear].push(s);
    });
    return map;
  }, [unassignedSections]);

  // For Assign Faculty Modal: get all year/section pairs with unassigned students
  const unassignedOptions = useMemo(() => {
    return Object.entries(unassignedByYear)
      .flatMap(([year, secs]) =>
        secs.filter(s => s.unassigned > 0).map(s => ({
          year,
          section: s.section,
        }))
      );
  }, [unassignedByYear]);

  const facultyOptions = faculty.filter(f => f.id);

  function openEdit(f: Faculty) {
    setEditing(f);
    setSelSecs(assignMap[f.userId] || []);
  }
  function toggleSec(sec: string) {
    setSelSecs(curr =>
      curr.includes(sec) ? curr.filter(s => s !== sec) : [...curr, sec]
    );
  }

  // Fetch students only (for live update after save)
  async function fetchStudentsOnly() {
    const res = await fetch("/api/hod/students");
    const data = await res.json();
    setStudents(
      data.students.map((s: any) => ({
        userId: s.userId,
        section: s.section,
        year: s.academicYear,
        facultyId: s.facultyId,
      }))
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

      // Show toasts for removed sections
      if (json.removedSections && json.removedSections.length > 0) {
        json.removedSections.forEach((r: any) => {
          const facultyName = faculty.find(f => f.userId === r.faculty)?.name || "Unknown";
          toast(
            `Section "${r.section}" removed from ${facultyName}`,
            { icon: "❌" }
          );
        });
      }

      // Show toasts for assigned sections
      if (json.assignedSections && json.assignedSections.length > 0) {
        json.assignedSections.forEach((a: any) => {
          const facultyName = faculty.find(f => f.userId === a.faculty)?.name || "Unknown";
          toast(
            `Section "${a.section}" assigned to ${facultyName}`,
            { icon: "✅" }
          );
        });
      }

      // Live update students after save!
      await fetchStudentsOnly();

      toast.success("✔️ Saved!");
      setEditing(null);
      // Refresh unassigned sections if dialog is open
      if (showUnassigned) await fetchUnassignedSections();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Assign Faculty to Unassigned Students Handler
  async function handleAssignFaculty() {
  if (!assignYear || !assignSection || !assignFacultyId) {
    toast.error("Please select all fields.");
    return;
  }
  setAssignLoading(true);
  try {
    const res = await fetch("/api/hod/assignFaculty/assignUnassigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: assignYear,
        section: assignSection,
        facultyId: Number(assignFacultyId),
      }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Failed");
    toast.success("Assigned successfully!");
    setShowAssignFaculty(false);
    setAssignYear("");
    setAssignSection("");
    setAssignFacultyId("");
    // Refresh students and grid data
    await fetchStudentsOnly();
    await fetchUnassignedSections();
    await loadAll(); // <-- This will update the grid cards
  } catch (e: any) {
    toast.error(e.message);
  } finally {
    setAssignLoading(false);
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
      {/* Search bar and unassigned button */}
      <div className="flex justify-between mb-6">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
        <button
          className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          onClick={() => setShowUnassigned(true)}
        >
          View Unassigned Sections
        </button>
      </div>
      <Toaster position="top-right" />
      <h1 className="text-4xl font-extrabold text-indigo-900 text-center mb-10">
        🎓 Auto-Assign by Section
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map(f => {
          const secs = assignMap[f.userId] || [];
          // Group assigned sections by year for this faculty
          const yearSectionMap: Record<string, string[]> = {};
          secs.forEach(sec => {
            const student = students.find(s => s.section === sec);
            const year = student?.year || "Unknown";
            if (!yearSectionMap[year]) yearSectionMap[year] = [];
            yearSectionMap[year].push(sec);
          });
          // Find faculty DB id for this userId
          const facObj = faculty.find(facItem => facItem.userId === f.userId);
          return (
            <div
              key={f.userId}
              className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-1 transition "
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{f.name}</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Academic Years & Sections</span>
                  <span>{secs.length || "—"}</span>
                </div>
                {/* Section badges with year */}
                <div>
                  <div className="text-xs font-semibold text-indigo-700 mb-1">Academic Year</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...new Set(
                        secs
                          .map(sec => {
                            const student = students.find(s => s.section === sec);
                            return student?.year || "Unknown";
                          })
                          .filter(Boolean)
                      ),
                    ].map(year => (
                      <span
                        key={year}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {year}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-indigo-700 mb-1">Section</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {secs.length
                      ? secs.map(sec => {
                          const student = students.find(s => s.section === sec);
                          const year = student?.year || "Unknown";
                          return (
                            <span
                              key={sec}
                              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {sec} <span className="text-gray-500">({year})</span>
                            </span>
                          );
                        })
                      : <span className="text-gray-400 italic">no sections</span>
                    }
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-3">
                  <span>Total Students</span>
                  <span>
                    {
                      students.filter(s => s.facultyId === facObj?.id).length
                    }
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

      {/* Unassigned Sections Dialog */}
      <Dialog open={showUnassigned} onClose={() => setShowUnassigned(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Unassigned Students by Section & Year
            </Dialog.Title>
            <button onClick={() => setShowUnassigned(false)} className="text-gray-400 hover:text-gray-600" title="Close">
              <XIcon size={20} />
            </button>
          </div>
          <div className="grid gap-3 max-h-64 overflow-y-auto mb-6">
            {Object.entries(unassignedByYear).length === 0 && (
              <div className="text-gray-400 italic">All students are assigned</div>
            )}
            {Object.entries(unassignedByYear).map(([year, secs]) => (
              <div key={year}>
                <div className="font-semibold text-indigo-700 mb-1">{year}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {secs.map(({ section, total, unassigned }) => (
                    <span
                      key={section}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {section} <span className="ml-1 text-gray-500">
                        {unassigned} unassigned / {total} total
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Assign Faculty Button */}
          {unassignedOptions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setShowAssignFaculty(true)}
              >
                Assign Faculty to Unassigned
              </button>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>

 {/* Modern Assign Faculty Modal */}
<Dialog
  open={showAssignFaculty}
  onClose={() => setShowAssignFaculty(false)}
  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
>
  <Dialog.Panel className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
    <div className="flex items-center justify-between mb-6">
      <Dialog.Title className="text-xl font-bold text-indigo-900 flex items-center gap-2">
        <ChevronRightIcon size={20} className="text-indigo-600" />
        Assign Faculty to Unassigned Students
      </Dialog.Title>
      <button
        onClick={() => setShowAssignFaculty(false)}
        className="text-gray-400 hover:text-gray-600"
        title="Close"
        type="button"
      >
        <XIcon size={22} />
      </button>
    </div>
    <form
      onSubmit={e => {
        e.preventDefault();
        handleAssignFaculty();
      }}
      className="space-y-5"
    >
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Academic Year
        </label>
        <select
          className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-3 py-2 rounded-lg transition"
          value={assignYear}
          onChange={e => {
            setAssignYear(e.target.value);
            setAssignSection("");
          }}
          required
        >
          <option value="">Select Year</option>
          {[...new Set(unassignedOptions.map(o => o.year))].map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Section
        </label>
        <select
          className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-3 py-2 rounded-lg transition"
          value={assignSection}
          onChange={e => setAssignSection(e.target.value)}
          disabled={!assignYear}
          required
        >
          <option value="">Select Section</option>
          {unassignedOptions
            .filter(o => o.year === assignYear)
            .map(o => (
              <option key={o.section} value={o.section}>
                {o.section}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Faculty
        </label>
        <select
          className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-3 py-2 rounded-lg transition"
          value={assignFacultyId}
          onChange={e => setAssignFacultyId(e.target.value)}
          required
        >
          <option value="">Select Faculty</option>
          {facultyOptions.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          onClick={() => setShowAssignFaculty(false)}
          disabled={assignLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-60"
          disabled={assignLoading}
        >
          {assignLoading && (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {assignLoading ? "Assigning..." : "Assign"}
        </button>
      </div>
    </form>
  </Dialog.Panel>
</Dialog>

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
            {Object.entries(sectionsByYear).map(([year, secs]) => (
              <div key={year}>
                <div className="font-semibold text-indigo-700 mb-1">{year}</div>
                <div className="grid gap-2 mb-3">
                  {secs.length === 0 && (
                    <div className="text-gray-400 italic">No sections</div>
                  )}
                  {secs.map(sec => {
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
                        <span className="ml-2 text-xs text-gray-500">({year})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
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