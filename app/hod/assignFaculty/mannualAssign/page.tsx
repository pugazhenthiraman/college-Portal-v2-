"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import SearchBar from "@/components/searchBar";
import ModernFileUpload from "@/components/ModernFileUpload";
import StudentTable from "@/components/studentTable";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { StudentViewModal } from "@/components/studentViewModel";

export default function ManualAssignPage() {
  // 📁 File‐upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 👩‍🎓 Table data + UI state
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  // 📊 Pagination & sorting
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // 🖥️ View/Edit modal
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // — Fetch students on mount —
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/hod/students");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setStudents(data.students);
        setFiltered(data.students);
        setSections(
          Array.from(
            new Set(
              data.students
                .map((s: { section: string }) => s.section)
                .filter((sec: unknown): sec is string => typeof sec === "string" && sec.length > 0)
            )
          )
        );
        setYears(
          Array.from(
            new Set(
              data.students
                .map((s: { academicYear: string }) => s.academicYear)
                .filter((yr: unknown): yr is string => typeof yr === "string" && yr.length > 0)
            )
          )
        );
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // — Apply search + filters —
  useEffect(() => {
    let out = students;
    if (searchTerm) {
      const lc = searchTerm.toLowerCase();
      out = out.filter(s =>
        Object.values(s).some(v =>
          v?.toString().toLowerCase().includes(lc)
        )
      );
    }
    if (sectionFilter) out = out.filter(s => s.section === sectionFilter);
    if (yearFilter)    out = out.filter(s => s.academicYear === yearFilter);
    setFiltered(out);
    setCurrentPage(1);
  }, [searchTerm, sectionFilter, yearFilter, students]);

  // — Sorting handler —
  function handleSort(col: string) {
    const dir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    setSortCol(col);
    setSortDir(dir);
    setFiltered([...filtered].sort((a, b) => {
      const A = a[col] || "", B = b[col] || "";
      return dir === "asc"
        ? A.toString().localeCompare(B.toString())
        : B.toString().localeCompare(A.toString());
    }));
  }

  // — Pagination slice —
  const idxEnd   = currentPage * rowsPerPage;
  const idxStart = idxEnd - rowsPerPage;
  const pageRows = filtered.slice(idxStart, idxEnd);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // — View/Edit modal —
  function openView(student: any) {
    setSelectedStudent(student);
    setIsViewOpen(true);
  }
  async function saveStudent(updated: any) {
    try {
      const res = await fetch(`/api/college/upload-student/${updated.userId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updated),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success("Saved!");
      setIsViewOpen(false);
      setStudents(students.map(s => s.userId === updated.userId ? updated : s));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // — Download Excel template/data —
  function downloadExcel() {
    window.open("/api/hod/downloadXL", "_blank");
  }

  // — Upload processed Excel back to server —
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch("/api/hod/assignFaculty/mannualAssign", {
      method: "POST",
      body:   formData,
    });
    const json = await res.json();
    if (res.ok) {
      toast.success("Excel processed! Reloading table…");
      // re-fetch students
      const r2 = await fetch("/api/hod/students");
      const d2 = await r2.json();
      if (r2.ok) {
        setStudents(d2.students);
        setFiltered(d2.students);
      }
    } else {
      // Show up to 5 errors, then "etc" if more
      if (Array.isArray(json.details) && json.details.length > 0) {
        const shown = json.details.slice(0, 5);
        const msg = shown.join("\n") + (json.details.length > 5 ? "\n...etc" : "");
        toast.error(msg);
      } else {
        toast.error(json.error || "Upload failed");
      }
    }
    setUploading(false);
  }

  const tableCols = [
    { key: "rollNo",          label: "Roll No" },
    { key: "firstName",       label: "First Name" },
    { key: "lastName",        label: "Last Name" },
    { key: "email",           label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "facultyName",     label: "Faculty" },
    { key: "DOB",             label: "DOB" },
    { key: "phoneNo",         label: "Phone No" },
    { key: "academicYear",    label: "Academic Year" },
    { key: "section",         label: "Section" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6 pb-12">
      <Toaster position="top-right"/>

      {/* Centered title */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900">
          Manual Assign Faculty
        </h1>
      </div>

      {/* File upload */}
      <div className="max-w-4xl mx-auto mb-4">
        <ModernFileUpload
          fileName={file?.name || ""}
          loading={uploading}
          onFileChange={e => setFile(e.target.files?.[0] ?? null)}
          onRemoveFile={() => setFile(null)}
          onUpload={handleUpload}
        />
      </div>

      {/* Controls: Search, Filters, Download */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end space-x-4">
        <div className="w-64">
          <SearchBar
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border px-3 py-2 rounded-md"
          value={sectionFilter}
          onChange={e => setSectionFilter(e.target.value)}
          aria-label="Filter by Section"
        >
          <option value="">All Sections</option>
          {sections.map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
        <select
          className="border px-3 py-2 rounded-md"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          aria-label="Filter by Year"
        >
          <option value="">All Years</option>
          {years.map(yr => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
        <button
          onClick={downloadExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          Download Table
        </button>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto">
        {loading
          ? <div className="flex justify-center py-20"><LoadingSpinner/></div>
          : <StudentTable
              students={pageRows}
              columns={tableCols}
              onSort={handleSort}
              sortColumn={sortCol}
              sortDirection={sortDir}
              onView={openView}
            />
        }
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mt-4">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-indigo-500 text-white disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-indigo-500 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* View/Edit Modal */}
      <AnimatePresence>
        {isViewOpen && selectedStudent && (
          <StudentViewModal
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            student={selectedStudent}
            onSave={saveStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}