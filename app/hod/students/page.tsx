"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { StudentViewModal } from "@/components/studentViewModel";
import SearchBar from "@/components/searchBar"; // Reusable SearchBar Component
import StudentTable from "@/components/studentTable"; // Reusable StudentTable Component

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentName, setDepartmentName] = useState(""); // Department name state

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal state for view/editing a student
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Fetch student data from the backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hod/students");
      const data = await response.json();
      if (response.ok && data.students) {
        // Update the department name from the API response
        setDepartmentName(data.department || "N/A");

        // Add fallback for facultyName if it's null/undefined
        const studentsWithFallback = data.students.map((student: any) => ({
          ...student,
          facultyName: student.facultyName || "N/A",
        }));
        setStudents(studentsWithFallback);
        setFilteredStudents(studentsWithFallback);
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

  // Handle search filtering
  const handleSearch = (term: string) => {
    setSearch(term);
    const filtered = students.filter((student) =>
      Object.values(student).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  // Sorting function
  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
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

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  // Open modal for a student (view/edit)
  const handleViewClick = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Save changes from the modal
  const handleSaveChanges = async (updatedStudent: any) => {
    try {
      const response = await fetch(
        `/api/college/upload-student/${updatedStudent.userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStudent),
        }
      );
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

  const columns = [
    { key: "rollNo", label: "Roll No" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "facultyName", label: "Faculty Name" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
  ];

  return (
    <div className="flex flex-col w-full px-6 pt-28 scrollbar-hide">
      <Toaster position="top-right" />

      {/* Header with Department Name */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-medium text-black">
          {departmentName}
        </span>
      </div>

      {/* Controls (Search and Buttons) */}
      <div className="flex justify-end items-center space-x-4 mb-6">
        <div className="w-64">
          <SearchBar
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearch(e.target.value)
            }
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          Filter
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          Assign Faculty
        </motion.button>
      </div>

      {/* Student Table Section */}
      <div className="max-w-6xl mx-auto">
        <StudentTable
          students={currentRows}
          columns={columns}
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

      {/* Student View Modal */}
      {isViewModalOpen && selectedStudent && (
        <StudentViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          student={selectedStudent}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
}
