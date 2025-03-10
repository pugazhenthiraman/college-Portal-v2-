"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

const REQUIRED_HEADERS = [
  
  "email",

  "name",
  "collegeId",
  "college",
  "departmentId",
  "facultyId",
  "faculty",
];

export default function UploadDetailsCandidatesPage() {
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

  const validateExcelHeaders = (headers: string[]): boolean => {
    return REQUIRED_HEADERS.every((header) => headers.includes(header));
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = json[0] as string[];

      if (!validateExcelHeaders(headers)) {
        showPopup("❌ Invalid Excel template. Headers do not match.", true);
        setLoading(false);
        return;
      }

      localStorage.setItem("uploadedCandidates", JSON.stringify(json));
      showPopup("Excel file uploaded successfully!");
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      showPopup("Please select a file before uploading.", true);
      return;
    }

    if (confirm(`Are you sure you want to upload ${fileName}?`)) {
      setLoading(true);
      handleFileUpload(selectedFile);
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const removeFile = () => {
    if (confirm("Are you sure you want to remove the uploaded file?")) {
      localStorage.removeItem("uploadedCandidates");
      setFileName("");
      setSelectedFile(null);
      showPopup("File removed successfully!");
    }
  };

  const showPopup = (message: string, error: boolean = false) => {
    const popup = document.createElement("div");
    popup.innerText = message;
    popup.className = `fixed bottom-4 right-4 ${error ? "bg-red-500" : "bg-green-500"} text-white p-4 rounded shadow-lg`;
    document.body.appendChild(popup);
    setTimeout(() => document.body.removeChild(popup), 3000);
  };

  return (
    <div className="pt-28 px-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold">Upload Your Excel</h2>
        <a
          href="/collegePortalExcel/collegePortal-test1.xlsx"
          download="college-template.xlsx"
          onClick={() => showPopup("Template download started!")}
        >
          <Button>
            Download Excel Template
          </Button>
        </a>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl shadow-md">
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="w-full mb-4 p-2 border rounded-md bg-gray-100 cursor-pointer"
        />

        {fileName && (
          <div className="flex justify-between bg-white p-2 rounded-md shadow-sm mb-4">
            <span className="font-medium">Selected File: {fileName}</span>
            <Button variant="destructive" onClick={removeFile}>Remove</Button>
          </div>
        )}

        <Button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
            <div className="mt-8 text-sm text-gray-600">
        <h4 className="font-semibold">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Download the Excel template.</li>
          <li>Fill in the Excel sheet as per the provided columns only.</li>
          <li>Ensure columns are named exactly: <b>id, email, password, name, collegeId, college, departmentId, facultyId, faculty</b>.</li>
          <li>Upload the completed Excel file above.</li>
        </ol>
      </div>
    </div>
  );
}
