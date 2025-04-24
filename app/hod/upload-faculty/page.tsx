// File: app/hod/upload-faculty/page.tsx
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ModernFileUpload from "@/components/ModernFileUpload";
import DownloadTemplateButton from "@/components/DownloadTemplateButton";
import FacultyTable from "@/components/studentTable";
import FacultyViewModal, { FacultyViewData } from "@/components/hod/facultyViewModal";

const MANDATORY_HEADERS = [
  "Name",
  "Email",
  "Password",
  "Mobile No",
  "Aadhaar No",
];

export default function HodUploadFacultyPage() {
  // --- Upload state ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName]         = useState("");
  const [loading, setLoading]           = useState(false);

  // --- Faculty / modal state ---
  const [facultyData, setFacultyData]   = useState<any[]>([]);
  const [viewing, setViewing] = useState< (FacultyViewData & { userId: number }) | null >(null);

  // 1️⃣ Fetch existing faculty on mount
  useEffect(() => {
    fetch("/api/hod/upload-faculty")
      .then((res) => res.json())
      .then((data) => setFacultyData(data.faculty))
      .catch((err) => alert(`Error fetching faculty: ${err.message}`));
  }, []);

  // 2️⃣ Excel validation (unchanged)
  const validateFile = async (file: File): Promise<string[]> => {
    const errs: string[] = [];
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: "array" });
      if (!wb.SheetNames.length) return ["No sheets found"];
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
      if (!raw.length) return ["Empty sheet"];
      const headers = (raw[0] as string[]).map((h) => h.trim());

      const missing = MANDATORY_HEADERS.filter((h) => !headers.includes(h));
      const extra   = headers.filter((h) => !MANDATORY_HEADERS.includes(h));
      if (missing.length) errs.push(`Missing columns: ${missing.join(", ")}`);
      if (extra.length)   errs.push(`Unexpected columns: ${extra.join(", ")}`);
      if (errs.length) return errs;

      const rows = XLSX.utils.sheet_to_json(sheet, { header: headers, defval: "", range: 1 });
      const seen = { e: new Set<string>(), p: new Set<string>(), a: new Set<string>() };
      rows.forEach((r: any, i: number) => {
        const rnum = i + 2;
        const e = String(r["Email"]      || "").trim();
        const p = String(r["Mobile No"]   || "").trim();
        const a = String(r["Aadhaar No"]  || "").trim();
        if (!e||!p||!a) errs.push(`Row ${rnum}: missing Email/Phone/Aadhaar`);
        if (e && seen.e.has(e)) errs.push(`Row ${rnum}: duplicate Email ${e}`); else seen.e.add(e);
        if (p && seen.p.has(p)) errs.push(`Row ${rnum}: duplicate Mobile No ${p}`); else seen.p.add(p);
        if (a && seen.a.has(a)) errs.push(`Row ${rnum}: duplicate Aadhaar No ${a}`); else seen.a.add(a);
      });

      return errs;
    } catch (err: any) {
      return [`Failed to parse Excel: ${err.message}`];
    }
  };

  // 3️⃣ File-upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setSelectedFile(f);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Select a file first.");
      return;
    }
    const errs = await validateFile(selectedFile);
    if (errs.length) {
      alert("Fix errors before upload:\n" + errs.join("\n"));
      return;
    }
    if (!confirm(`Upload ${fileName}?`)) return;

    setLoading(true);
    try {
      const buf   = await selectedFile.arrayBuffer();
      const clone = new File([buf], selectedFile.name, { type: selectedFile.type });
      const fm    = new FormData();
      fm.append("facultyExcelData", clone);

      const res  = await fetch("/api/hod/upload-faculty", { method: "POST", body: fm });
      const json = await res.json();
      if (!res.ok) {
        alert(`Upload failed: ${json.error}`);
      } else {
        alert(`Upserted ${json.faculty.length} records`);
        setFacultyData(json.faculty);
        setFileName("");
        setSelectedFile(null);
      }
    } catch (e: any) {
      alert(`Error uploading: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ Table “View” button → open modal
  const handleView = (row: any) => {
    setViewing({
      userId:    row.userId,
      name:      row.name,
      email:     row.email,
      contactNo: row.contactNo,
      aadhaarNo: row.aadhaarNo,
    });
  };

  // 5️⃣ “Save” from modal → PUT → update table locally
  const handleSave = async (updated: FacultyViewData) => {
    if (!viewing) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/hod/upload-faculty/${viewing.userId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // update local state
      setFacultyData((prev) =>
        prev.map((f) =>
          f.userId === viewing.userId ? { ...f, ...updated } : f
        )
      );
      alert("Updated successfully!");
      setViewing(null);
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // table columns
  const columns = [
    { key: "name",      label: "Name" },
    { key: "email",     label: "Email" },
    { key: "contactNo", label: "Mobile No" },
    { key: "aadhaarNo", label: "Aadhaar No" },
  ];

  return (
    <div className="pt-28 px-6">
      {/* Header + Upload */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold">Upload Faculty Excel</h2>
        <DownloadTemplateButton
          endpoint="/api/hod/download-faculty-template"
          filename="faculty-template.xlsx"
          buttonText="Download Template"
        />
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

      {/* Table */}
      <FacultyTable
        students={facultyData}
        columns={columns}
        onView={handleView}
        sortColumn=""
        sortDirection=""
        onSort={() => {}}
        showCheckbox={false}
      />

      {/* View/Edit Modal */}
      {viewing && (
        <FacultyViewModal
          isOpen={true}
          faculty={viewing}
          onClose={() => setViewing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
