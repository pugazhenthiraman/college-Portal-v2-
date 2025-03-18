
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Download } from "lucide-react";
import { StudentEditModal } from "@/components/StudentEditModal";
import { Student } from "@prisma/client";

export default function UploadDetailsCandidatesPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sorting States
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleSearch(search); // Apply search on data load
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
      Object.values(row).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after search
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
          alert("✅ File uploaded successfully!");
          fetchData();
        } else {
          alert("❌ Upload failed.");
        }
      } catch (error) {
        console.error(error);
        alert("❌ Error uploading file. Please try again.");
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
    { key: "countryCode", label: "Country Code" },
    { key: "departmentName", label: "Department Name" },
  ];

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

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);



  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleEditClick = (student: any) => {
    console.log(student)
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (updatedStudent: Student) => {
    try {
      const response = await fetch(`/api/college/update-student/${updatedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
  
      if (response.ok) {
        alert("✅ Student updated successfully!");
        fetchData(); // Refresh data after update
        setIsEditModalOpen(false);
      } else {
        alert("❌ Failed to update student.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("❌ An error occurred.");
    }
  };
  

  


  return (
    <div className="pt-28 px-6">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin h-16 w-16 text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Upload Section (Keeps its Original Layout) */}
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📁 <span className="text-indigo-600">Upload Students</span> Informations
              </h2>
  
              <div className="flex space-x-2">
                <a href="/collegePortalExcel/collegePortal-test1.xlsx" download="college-template.xlsx">
                  <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all duration-300 transform hover:scale-105">
                    <Download className="h-5 w-5" />
                    Download Template
                  </Button>
                </a>
                <Input
                  type="text"
                  placeholder="🔍 Search students..."
                  className="w-56 h-10 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 transition-all mt-3"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
  
            {/* Upload Section (Limited to max-w-6xl) */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-md mb-6">
              <label htmlFor="file-upload" className="block mb-2 font-medium text-gray-700">
                Upload Excel File 📂
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                className="w-full mb-4 p-2 border rounded-md bg-gray-100 cursor-pointer"
              />
              {fileName && (
                <div className="flex justify-between bg-white p-2 rounded-md shadow-sm mb-4">
                  <span className="font-medium">📂 Selected File: {fileName}</span>
                  <Button variant="destructive" onClick={() => { setFileName(""); setSelectedFile(null); }}>
                    Remove
                  </Button>
                </div>
              )}
              <Button className="py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-md w-full" onClick={handleUpload}>
                {loading ? "Uploading..." : "📤 Upload"}
              </Button>
            </div>
          </div>
  
          {/* Full-Width Table Section */}
          <div className="w-full">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border p-5 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse table-auto">
                  {/* Table Header */}
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm uppercase">
                    <tr>
                      {columns.map(({ key, label }) => (
                        <th
                          key={key}
                          className="p-4 text-center font-semibold tracking-wide border-b border-blue-300"
                          onClick={() => handleSort(key)}
                        >
                          {label} {sortColumn === key ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
  
                  {/* Table Body */}
                  <tbody>
                    {currentRows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b text-gray-800 text-center hover:bg-indigo-50 transition duration-200"
                      >
                        {columns.map(({ key }) => (
                          <td
                          key={key}
                          className="p-4 border text-gray-700 break-words whitespace-normal max-w-xs"
                        >
                          {key === "email" || key === "password"
                            ? row.user?.[key] || "N/A"
                            : key === "DOB"
                            ? new Date(row[key]).toLocaleDateString("en-GB") // Converts to DD/MM/YYYY format
                            : row[key]}
                        </td>
                        ))}
                         <td className="p-4 border">
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={() => handleEditClick(row)}
        >
          ✏️ Edit
        </Button>
        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  Prev
                </button>
  
                <span className="text-md font-semibold text-gray-700">Page {currentPage}</span>
  
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={indexOfLastRow >= filteredData.length}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                    indexOfLastRow >= filteredData.length
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  Next
                </button>
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
