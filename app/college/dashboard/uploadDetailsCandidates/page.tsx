"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assume this is your UI button
import { Input } from "@/components/ui/input";
import { Loader, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { StudentEditModal } from "@/components/StudentEditModal";

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/college/upload-student");
      const result = await response.json();
      console.log("Fetched Data:", result.students);
      setData(result.students || []);
      setFilteredData(result.students || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1);
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
      alert("❌ Please select a file before uploading.");
      return;
    }
    if (confirm(`Are you sure you want to upload ${fileName}?`)) {
      setLoading(true);
      const formData = new FormData();
      formData.append("studentsExcelData", selectedFile);
      try {
        const response = await fetch("/api/college/upload-student", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          toast.success("✅ File uploaded successfully!");
          fetchData();
        } else {
          toast.error("❌ Upload failed.");
        }
      } catch (error) {
        console.error(error);
        toast.error("❌ Error uploading file. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "rollNo", label: "Roll No" },
    { key: "personalEmail", label: "Personal Email" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "nationality", label: "Nationality" },
    { key: "departmentName", label: "Department Name" },
  ];

  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
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

  const handleEditClick = (student: any) => {
    console.log(student);
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (updatedStudent: any) => {
    try {
      const response = await fetch(`/api/college/upload-student/${updatedStudent.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      if (response.ok) {
        toast.success("✅ Student updated successfully!");
        fetchData();
        setIsEditModalOpen(false);
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
          {/* Upload & File Section */}
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800"></h2>
              <div className="flex justify-end items-center">
                <a
                  href="/collegePortalExcel/collegePortal-test1.xlsx"
                  download="college-template.xlsx"
                  className="mr-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all duration-300">
                      <Download className="h-5 w-5" />
                      Download Template
                    </Button>
                  </motion.div>
                </a>
              </div>
            </div>
            {/* Modern Upload File Section */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 justify-start">
                <label htmlFor="file-upload" className="block text-2xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-shine">
                    Upload Excel
                  </span>{" "}
                  File 📂
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors duration-300">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  <p className="mt-2 text-gray-600 text-sm">
                    Drag and drop your file here, or click to select
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <motion.label
                    htmlFor="file-upload"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-4 rounded-lg transition transform cursor-pointer text-sm"
                  >
                    Choose File
                  </motion.label>
                </div>
                {fileName && (
                  <div className="mt-3 flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
                    <span className="text-gray-700 font-medium text-sm">{fileName}</span>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setFileName("");
                          setSelectedFile(null);
                        }}
                        className="px-3 py-1 text-xs"
                      >
                        Remove
                      </Button>
                    </motion.div>
                  </div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Button
                    className="mt-4 w-full py-2 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition transform"
                    onClick={handleUpload}
                  >
                    {loading ? "Uploading..." : "📤 Upload"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
          {/* Search Input Section (Aligned to Right) */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Input
                  type="text"
                  placeholder="🔍 Search students..."
                  className="w-56 h-12 px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition transform"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </motion.div>
            </div>
          </div>
          {/* Table Section in One Scrollable Container */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg border p-5 w-full">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full border-collapse table-auto text-sm">
                  <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase">
                    <tr>
                      {columns.map(({ key, label }) => (
                        <motion.th
                          key={key}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                          className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 cursor-pointer whitespace-nowrap"
                          onClick={() => handleSort(key)}
                        >
                          {label} {sortColumn === key ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                        </motion.th>
                      ))}
                      <motion.th
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 whitespace-nowrap"
                      >
                        Actions
                      </motion.th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    {currentRows.map((row, index) => (
                      <motion.tr
                        key={row.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-indigo-50 transition duration-200"
                      >
                        {columns.map(({ key }) => (
                          <td key={key} className="px-2 py-2 border text-gray-700 break-words whitespace-normal">
                            {key === "email" || key === "password"
                              ? row.user?.[key] || "N/A"
                              : key === "DOB"
                              ? new Date(row[key]).toLocaleDateString("en-GB")
                              : row[key]}
                          </td>
                        ))}
                        <td className="px-2 py-2 border">
                          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                            <Button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                              onClick={() => handleEditClick(row)}
                            >
                              ✏️ Edit
                            </Button>
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                    currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  Prev
                </motion.button>
                <span className="text-md font-semibold text-gray-700">Page {currentPage}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={indexOfLastRow >= filteredData.length}
                  className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                    indexOfLastRow >= filteredData.length ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}
      <StudentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onSave={handleSaveChanges}
      />
    </div>
  );
}
