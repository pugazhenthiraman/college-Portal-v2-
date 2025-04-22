// File: app/hod/upload-faculty/page.tsx
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ModernFileUpload from "@/components/ModernFileUpload";
import DownloadTemplateButton from "@/components/DownloadTemplateButton";
import FacultyTable from "@/components/studentTable";

const MANDATORY_HEADERS = [
  "Name",
  "Email",
  "Password",
  "Mobile No",
  "Aadhaar No",
];

export default function HodUploadFacultyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [facultyData, setFacultyData]   = useState<any[]>([]);

  // Fetch existing faculty on mount
  useEffect(() => {
    fetch("/api/hod/upload-faculty")
      .then((res) => res.json())
      .then((data) => setFacultyData(data.faculty))
      .catch((err) => alert(`Error fetching faculty: ${err.message}`));
  }, []);

  /** 
   * Client‑side validation:
   * 1) Read & TRIM the header row 
   * 2) Ensure mandatory headers 
   * 3) Parse rows using trimmed headers
   * 4) Check missing values & duplicates
   */
  const validateFile = async (file: File): Promise<string[]> => {
    const errs: string[] = [];
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: "array" });
      if (!wb.SheetNames.length) return ["No sheets found in Excel file"];

      const sheet = wb.Sheets[wb.SheetNames[0]];

      // 1) Extract raw header row & trim whitespace
      const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
      if (!raw.length) return ["Excel file is empty"];

      const trimmedHeaders = (raw[0] as string[]).map((h) => String(h).trim());

      // 2) Check for missing/extra headers
      const missing = MANDATORY_HEADERS.filter((h) => !trimmedHeaders.includes(h));
      const extra   = trimmedHeaders.filter((h) => !MANDATORY_HEADERS.includes(h));
      if (missing.length) errs.push(`Missing columns: ${missing.join(", ")}`);
      if (extra.length)   errs.push(`Unexpected columns: ${extra.join(", ")}`);
      if (errs.length) return errs;

      // 3) Parse data rows *using* trimmedHeaders, skipping the header row
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: trimmedHeaders,
        defval: "",
        range: 1,
      });

      // 4) Row‑level checks for missing fields & duplicates
      const seenEmail = new Set<string>();
      const seenPhone = new Set<string>();
      const seenAad   = new Set<string>();

      rows.forEach((r, idx) => {
        const rowNum = idx + 2; // +2 because idx=0 is Excel row 2
        const email = String(r["Email"] || "").trim();
        const phone = String(r["Mobile No"] || "").trim();
        const aad   = String(r["Aadhaar No"] || "").trim();

        if (!email || !phone || !aad) {
          errs.push(`Row ${rowNum}: missing Email, Mobile No or Aadhaar No`);
        }
        if (email) {
          if (seenEmail.has(email)) errs.push(`Row ${rowNum}: duplicate Email ${email}`);
          else seenEmail.add(email);
        }
        if (phone) {
          if (seenPhone.has(phone)) errs.push(`Row ${rowNum}: duplicate Mobile No ${phone}`);
          else seenPhone.add(phone);
        }
        if (aad) {
          if (seenAad.has(aad)) errs.push(`Row ${rowNum}: duplicate Aadhaar No ${aad}`);
          else seenAad.add(aad);
        }
      });

      return errs;
    } catch (e: any) {
      return [`Failed to parse Excel: ${e.message}`];
    }
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
      alert("Please select a file before uploading.");
      return;
    }

    // 1) Validate on client
    const errs = await validateFile(selectedFile);
    if (errs.length) {
      alert("Please fix the following errors before upload:\n\n" + errs.join("\n"));
      return;
    }

    // 2) Confirm
    if (!confirm(`Are you sure you want to upload ${fileName}?`)) return;

    setLoading(true);
    try {
      // Clone to avoid Chrome quirk
      const buf    = await selectedFile.arrayBuffer();
      const cloned = new File([buf], selectedFile.name, { type: selectedFile.type });

      const formData = new FormData();
      formData.append("facultyExcelData", cloned);

      const response = await fetch("/api/hod/upload-faculty", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        alert(`Upload failed: ${result.error}`);
      } else {
        alert(`Success! Upserted ${result.faculty.length} records.`);
        setFacultyData(result.faculty);
        setFileName("");
        setSelectedFile(null);
      }
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const facultyColumns = [
    { key: "name",      label: "Name" },
    { key: "email",     label: "Email" },
    { key: "contactNo", label: "Mobile No" },
    { key: "aadhaarNo", label: "Aadhaar No" },
  ];

  return (
    <div className="pt-28 px-6 w-full h-full">
      {/* Header & Download */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <h2 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 
                            bg-clip-text text-transparent animate-shine">
            Upload Faculty Excel
          </span>
        </h2>
        <DownloadTemplateButton
          endpoint="/api/hod/download-faculty-template"
          filename="faculty-template.xlsx"
          buttonText="Download Faculty Template"
        />
      </div>

      {/* File Upload */}
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

      {/* Faculty Table */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-3xl">
          <FacultyTable
            students={facultyData}
            columns={facultyColumns}
            onView={() => {}}
            sortColumn=""
            sortDirection=""
            onSort={() => {}}
            showCheckbox={false}
          />
        </div>
      </div>
    </div>
  );
}
