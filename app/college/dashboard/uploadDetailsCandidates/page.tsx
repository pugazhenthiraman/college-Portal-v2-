"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { StudentViewModal } from "@/components/studentViewModel";
import SearchBar from "@/components/searchBar";
import StudentTable from "@/components/studentTable";
import FilterSidebar from "@/components/filterBar";
import ModernFileUpload from "@/components/ModernFileUpload";
import DownloadTemplateButton from "@/components/DownloadTemplateButton";

export default function UploadDetailsCandidatesPage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "personalEmailId", label: "Personal Email" },
    { key: "rollNo", label: "Roll No" },
    { key: "departmentName", label: "Department" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
  ];

  const filterableFields = [...columns];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/college/upload-student");
      const result = await response.json();
      if (response.ok && result.students) {
        const studentsNormalized = result.students.map((student: any) => ({
          ...student,
          facultyName: student.facultyName || "N/A",
          email: student.user?.email || student.email || "",
        }));
        setData(studentsNormalized);
        setFilteredData(studentsNormalized);
      } else {
        toast.error(result.error || "Failed to load students");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some(
          (value) => value && value.toString().toLowerCase().includes(term)
        )
      );
    }

    if (Object.values(columnFilters).some((val) => val)) {
      filtered = filtered.filter((row) =>
        Object.entries(columnFilters).every(([key, filterValue]) => {
          if (!filterValue) return true;
          const rowValue = row[key] ? row[key].toString().toLowerCase() : "";
          return rowValue.includes(filterValue.toLowerCase());
        })
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, search, columnFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("❌ Please select a file before uploading.");
      return;
    }
    if (!confirm(`Are you sure you want to upload ${fileName}?`)) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("studentsExcelData", selectedFile);
    try {
      const response = await fetch("/api/college/upload-student", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "✅ File uploaded successfully!");
        fetchData();
      } else {
        toast.error(`❌ Upload failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(`❌ Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    const sortedData = [...filteredData].sort((a, b) => {
      const valueA = a[column] || "";
      const valueB = b[column] || "";
      return newDirection === "asc"
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });
    setFilteredData(sortedData);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleViewClick = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

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
        toast.success("✅ Student updated successfully!");
        fetchData();
        setIsViewModalOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(`❌ Failed to update student: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("❌ An error occurred.");
    }
  };

  return (
    <div className="pt-28 px-6">
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin h-16 w-16 text-indigo-600" />
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-shine">
              Upload Students
            </span>{" "}
            Excel
          </h2>

          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex justify-end items-center">
                <DownloadTemplateButton
                  endpoint="/api/college/download-template"
                  filename="college-template.xlsx"
                  buttonText="Download Template"
                />
              </div>
            </div>
            <ModernFileUpload
              fileName={fileName}
              loading={loading}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onRemoveFile={() => {
                setFileName("");
                setSelectedFile(null);
              }}
            />
          </div>

          <div className="max-w-xl mx-auto mb-6 flex items-center gap-2">
            <SearchBar value={search} onChange={handleSearchChange} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFilterSidebarOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Filters
            </motion.button>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <StudentTable
              students={currentRows}
              columns={columns}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onView={handleViewClick}
            />
            <div className="flex justify-between items-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
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
                disabled={indexOfLastRow >= filteredData.length}
                className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                  indexOfLastRow >= filteredData.length
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                Next
              </motion.button>
            </div>
          </div>
        </>
      )}

      <StudentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        student={selectedStudent}
        onSave={handleSaveChanges}
      />

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