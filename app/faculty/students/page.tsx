"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import StudentTable from "@/components/studentTable";
import SearchBar from "@/components/searchBar";
import FilterSidebar from "@/components/filterBar";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { StudentViewModal } from "@/components/studentViewModel";

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalSearch, setGlobalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  // Table columns for faculty
  const tableColumns = [
    { key: "rollNo", label: "Roll No" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "academicYear", label: "Academic Year" },
    { key: "section", label: "Section" },
  ];

  const filterableFields = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "rollNo", label: "Roll No" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "academicYear", label: "Academic Year" },
    { key: "section", label: "Section" },
  ];

  // Fetch students from backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/faculty/students");
      const data = await response.json();
      if (response.ok && data.students) {
        setStudents(data.students);
        setDepartmentName(data.department || "");
      } else {
        toast.error(data.error || "Failed to load students");
      }
    } catch {
      toast.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Combine global search and column filters
  useEffect(() => {
    let filtered = [...students];
    // Global search
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((student) =>
        Object.values(student).some(
          (value) =>
            value && value.toString().toLowerCase().includes(term)
        )
      );
    }
    // Column filters
    if (Object.values(columnFilters).some(val => val)) {
      filtered = filtered.filter((student) =>
        Object.entries(columnFilters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const studentValue = student[key]
            ? student[key].toString().toLowerCase()
            : "";
          return studentValue.includes(filterValue.toLowerCase());
        })
      );
    }
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [globalSearch, columnFilters, students]);

  // Sorting
  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    const sortedData = [...filteredStudents].sort((a, b) => {
      const valueA = a[column] || "";
      const valueB = b[column] || "";
      return newDirection === "asc"
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });
    setFilteredStudents(sortedData);
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));

  // Modal open
  const handleViewClick = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Save changes from modal (optional)
  const handleSaveChanges = async () => {
    setIsViewModalOpen(false);
  };

  return (
    <div className="relative flex flex-col w-full scrollbar-hide">
      <Toaster position="top-right" />

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <>
{/* Department Name */}
<div className="flex justify-center mb-6">
  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl px-10 py-5 shadow-lg border border-indigo-300">
    <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">
      {departmentName ? `Department: ${departmentName}` : "Department"}
    </span>
  </div>
</div>

          {/* Controls */}
          <div className="flex justify-end items-center space-x-4 relative mb-2">
            <div className="w-64">
              <SearchBar
                value={globalSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGlobalSearch(e.target.value)
                }
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFilterSidebarOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Filters
            </motion.button>
          </div>

          {/* Student Table */}
          <div className="max-w-6xl mx-auto mt-6">
            <StudentTable
              students={currentRows}
              columns={tableColumns}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onView={handleViewClick}
            />
          </div>

          {/* Pagination */}
          <div className="w-full flex items-center justify-between mt-6 px-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`ml-6 px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              Prev
            </motion.button>
            <span className="font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastRow >= filteredStudents.length}
              className={`mr-6 px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                indexOfLastRow >= filteredStudents.length
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              Next
            </motion.button>
          </div>
        </>
      )}

      {/* Student View Modal */}
      {isViewModalOpen && selectedStudent && (
        <StudentViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          student={selectedStudent}
          onSave={handleSaveChanges}
        />
      )}

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto"
          >
            <FilterSidebar
              fields={filterableFields}
              onFilterChange={(filters) => setColumnFilters(filters)}
              onClose={() => setIsFilterSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}