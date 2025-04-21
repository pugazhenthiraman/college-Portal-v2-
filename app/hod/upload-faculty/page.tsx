"use client";

import { useState } from "react";
import ModernFileUpload from "@/components/ModernFileUpload";
import DownloadTemplateButton from "@/components/DownloadTemplateButton";
import StudentsTable from "@/components/studentTable";

export default function HodUploadFacultyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }
    if (!confirm(`Are you sure you want to upload ${fileName}?`)) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("facultyExcelData", selectedFile);
    try {
      const response = await fetch("/api/hod/upload-faculty", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("File uploaded successfully!");
        setFileName("");
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.error}`);
      }
    } catch (error: any) {
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Dummy faculty data for demonstration (replace with real data as needed)
  const facultyData = [
    // Example:
    // { name: "John Doe", email: "john@example.com", password: "******", contactNo: "9876543210", aadhaarNo: "123456789012" }
  ];

  const facultyColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
    { key: "contactNo", label: "Mobile Number" },
    { key: "aadhaarNo", label: "Aadhar Number" },
  ];

  return (
    <div className="pt-28 px-6 w-full h-flex">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h2 className="text-2xl font-bold"><span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-shine">Upload Faculty</span> Excel</h2>
        <div className="w-full sm:w-auto sm:ml-auto justify-end flex gap-4">
          <DownloadTemplateButton
            endpoint="/api/hod/download-faculty-template"
            filename="faculty-template.xlsx"
            buttonText="Download Faculty Template"
          />
        </div>
      </div>

      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-full max-w-2xl">
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
      </div>

      {/* Faculty Table always below the upload section */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-3xl">
          <StudentsTable
            students={facultyData}
            columns={facultyColumns}
            onView={() => {}}
            sortColumn={""}
            sortDirection={""}
            onSort={() => {}}
            showCheckbox={false}
          />
        </div>
      </div>
    </div>
  );
}
