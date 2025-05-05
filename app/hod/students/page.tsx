"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { StudentViewModal } from "@/components/studentViewModel";
import SearchBar from "@/components/searchBar";
import StudentTable from "@/components/studentTable";
import FilterSidebar from "@/components/filterBar";
import LoadingSpinner from "@/components/ui/loadingSpinner";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Global search state (for quick search)
  const [globalSearch, setGlobalSearch] = useState("");
  const [departmentName, setDepartmentName] = useState(""); // Department name state

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal state for view/editing a student
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // State for column filters (each field’s filter value)
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});

  // State to control the visibility of the filter sidebar (moved to right)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Dropdown state for Assign Faculty
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const assignDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        assignDropdownRef.current &&
        !assignDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAssignDropdownOpen(false);
      }
    }
    if (isAssignDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAssignDropdownOpen]);

  // Define the table columns (displayed in the StudentTable)
  const tableColumns = [
    { key: "rollNo", label: "Roll No" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "facultyName", label: "Faculty Name" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "academicYear", label: "Academic Year" },
    { key: "section", label: "Section" },
  ];

  // Define extra filterable fields (including the additional fields from the view)
  const filterableFields = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "rollNo", label: "Roll No" },
    { key: "facultyName", label: "Faculty Name" },
    { key: "departmentName", label: "Department" },
    { key: "DOB", label: "DOB" },
    { key: "academicYear", label: "Academic Year" },
    { key: "section", label: "Section" },
  ];

  // Fetch student data from the backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hod/students");
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      if (response.ok && data.students) {
        setDepartmentName(data.department || "N/A");
        setStudents(data.students); // Use students as-is, they already have facultyName
      } else {
        toast.error(data.error || "Failed to load students");
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Combine global search and column filters.
  useEffect(() => {
    let filtered = [...students];

    // Apply global search filtering.
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      filtered = filtered.filter((student) =>
        Object.values(student).some(
          (value) =>
            value && value.toString().toLowerCase().includes(term)
        )
      );
    }

    // Apply column-specific filters.
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

  // Sorting function for table columns.
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

  // Pagination calculations.
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  // Debug log for table data
  console.log("Current rows for table:", currentRows);

  // Open modal for a student (view/edit).
  const handleViewClick = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Save changes from the modal.
  const handleSaveChanges = async (updatedStudent: any) => {
    try {
      const response = await fetch(`/api/college/upload-student/${updatedStudent.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      if (response.ok) {
        toast.success("Student updated successfully!");
        fetchStudents();
        setIsViewModalOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Error updating student");
    }
  };

  // Handlers for dropdown options
  const handleAutoAssign = () => {
    setIsAssignDropdownOpen(false);
    router.push("/hod/assignFaculty/autoAssign");
  };

  const handleManualAssign = () => {
    setIsAssignDropdownOpen(false);
     router.push("/hod/assignFaculty/mannualAssign");
  };

  return (
    <div className="relative flex flex-col w-full px-6 pt-28 scrollbar-hide">
      <Toaster position="top-right" />

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Header with Department Name */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-black">{departmentName}</span>
          </div>

          {/* Controls (Global Search and Buttons) */}
          <div className="flex justify-end items-center space-x-4 mb-6 relative">
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
            <div className="relative" ref={assignDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsAssignDropdownOpen((prev) => !prev)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
              >
                Assign Faculty
              </motion.button>
              <AnimatePresence>
                {isAssignDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20"
                  >
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleAutoAssign}
                    >
                      Auto Assign Faculty
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleManualAssign}
                    >
                      Manual Assign Faculty
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Student Table Section */}
          <div className="max-w-6xl mx-auto">
            <StudentTable
              students={currentRows}
              columns={tableColumns}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onView={handleViewClick}
            />
          </div>

          {/* Pagination Controls */}
          <div className="w-full flex items-center justify-between mt-4 px-6">
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

      {/* Filter Sidebar (slides in from the right) */}
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