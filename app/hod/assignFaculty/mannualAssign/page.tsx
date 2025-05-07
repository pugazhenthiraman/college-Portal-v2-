"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "@/components/searchBar";
import ModernFileUpload from "@/components/ModernFileUpload";
import StudentTable from "@/components/studentTable";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { StudentViewModal } from "@/components/studentViewModel";

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function ManualAssignPage() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);

  const [sectionFilter, setSectionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState(""); // NEW
  const [sections, setSections] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [facultyList, setFacultyList] = useState<string[]>([]); // NEW

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fetch students on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/hod/students")
      .then(res => res.json())
      .then(data => {
        if (!data.students) throw new Error(data.error || "Failed to load");
        setStudents(data.students);
        setSections([...new Set(data.students.map((s: any) => s.section).filter(Boolean))]);
        setYears([...new Set(data.students.map((s: any) => s.academicYear).filter(Boolean))]);
        // Faculty list (with N/A)
        const faculties = [
          ...new Set(
            data.students.map((s: any) => s.facultyName || "N/A")
          ),
        ];
        setFacultyList(faculties);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtered and searched students (memoized)
  const filtered = useMemo(() => {
    let out = students;
    if (debouncedSearch) {
      const lc = debouncedSearch.toLowerCase();
      out = out.filter(s =>
        Object.values(s).some(v =>
          v?.toString().toLowerCase().includes(lc)
        )
      );
    }
    if (sectionFilter) out = out.filter(s => s.section === sectionFilter);
    if (yearFilter) out = out.filter(s => s.academicYear === yearFilter);
    if (facultyFilter) {
      out = out.filter(s =>
        (facultyFilter === "N/A" && (!s.facultyName || s.facultyName === "N/A")) ||
        s.facultyName === facultyFilter
      );
    }
    if (sortCol) {
      out = [...out].sort((a, b) => {
        const A = a[sortCol] || "", B = b[sortCol] || "";
        return sortDir === "asc"
          ? A.toString().localeCompare(B.toString())
          : B.toString().localeCompare(A.toString());
      });
    }
    return out;
  }, [students, debouncedSearch, sectionFilter, yearFilter, facultyFilter, sortCol, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageRows = useMemo(
    () => filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filtered, currentPage]
  );

  // Sorting handler
  function handleSort(col: string) {
    setSortCol(col);
    setSortDir(prev => (sortCol === col && prev === "asc" ? "desc" : "asc"));
  }

  // View/Edit modal
  function openView(student: any) {
    setSelectedStudent(student);
    setIsViewOpen(true);
  }
  async function saveStudent(updated: any) {
    try {
      const res = await fetch(`/api/college/upload-student/${updated.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
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

  // Download Excel (optimized, no new tab)
  async function downloadExcel() {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (sectionFilter) params.append("section", sectionFilter);
      if (yearFilter) params.append("year", yearFilter);
      if (facultyFilter) params.append("faculty", facultyFilter); // NEW
      const url = `/api/hod/downloadXL${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to download Excel");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "students-with-faculty-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  // Upload Excel
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/hod/assignFaculty/mannualAssign", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Excel processed! Reloading table…");
        // re-fetch students
        const r2 = await fetch("/api/hod/students");
        const d2 = await r2.json();
        if (r2.ok) {
          setStudents(d2.students);
        }
      } else {
        if (Array.isArray(json.details) && json.details.length > 0) {
          const shown = json.details.slice(0, 5);
          const msg = shown.join("\n") + (json.details.length > 5 ? "\n...etc" : "");
          toast.error(msg);
        } else {
          toast.error(json.error || "Upload failed");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
    setUploading(false);
  }

  const tableCols = [
    { key: "rollNo", label: "Roll No" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "facultyName", label: "Faculty" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "academicYear", label: "Academic Year" },
    { key: "section", label: "Section" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6 pb-12">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900">
          Manual Assign Faculty
        </h1>
      </div>
      <div className="max-w-4xl mx-auto mb-4">
        <ModernFileUpload
          fileName={file?.name || ""}
          loading={uploading}
          onFileChange={e => setFile(e.target.files?.[0] ?? null)}
          onRemoveFile={() => setFile(null)}
          onUpload={handleUpload}
        />
      </div>
      <div className="max-w-4xl mx-auto mb-8 flex justify-end space-x-4">
        <div className="w-64">
          <SearchBar
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
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
          value={facultyFilter}
          onChange={e => setFacultyFilter(e.target.value)}
          aria-label="Filter by Faculty"
        >
          <option value="">All Faculty</option>
          {facultyList.map(fac => (
            <option key={fac} value={fac}>{fac}</option>
          ))}
        </select>
        <button
          onClick={downloadExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center"
          disabled={downloading}
        >
          {downloading ? (
            <span className="flex items-center">
              <LoadingSpinner small />&nbsp;Downloading...
            </span>
          ) : (
            "Download Table"
          )}
        </button>
      </div>
      <div className="max-w-6xl mx-auto">
        {loading
          ? <div className="flex justify-center py-20"><LoadingSpinner /></div>
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