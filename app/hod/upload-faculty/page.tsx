// File: app/hod/upload-faculty/page.tsx
"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import toast, { Toaster } from "react-hot-toast";
import ModernFileUpload from "@/components/ModernFileUpload";
import DownloadTemplateButton from "@/components/DownloadTemplateButton";
import FacultyTable from "@/components/studentTable";
import FacultyViewModal, { FacultyViewData } from "@/components/hod/facultyViewModal";
import { generateInitialPassword } from "@/lib/generatePassword";
import { UserRole } from "@prisma/client";

const MANDATORY_HEADERS = ["Name", "Email", "Mobile No", "Aadhaar No"];

export default function HodUploadFacultyPage() {
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName]         = useState("");
  const [loading, setLoading]           = useState(false);

  // Faculty data & modal
  const [facultyData, setFacultyData]   = useState<any[]>([]);
  const [viewing, setViewing]           = useState<(FacultyViewData & { userId: number }) | null>(null);

  // 1️⃣ Fetch existing faculty
  useEffect(() => {
    fetch("/api/hod/upload-faculty")
      .then(res => res.json())
      .then(data => setFacultyData(data.faculty))
      .catch(err => toast.error("Error fetching faculty: " + err.message));
  }, []);

  // 2️⃣ Excel validation
  const validateFile = async (file: File): Promise<string[]> => {
    const errs: string[] = [];
    try {
      const buf = await file.arrayBuffer();
      const wb  = XLSX.read(buf, { type: "array" });
      if (!wb.SheetNames.length) return ["No sheets found"];
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
      if (!raw.length) return ["Empty sheet"];

      const headers = raw[0].map(h => String(h).trim());
      const missing = MANDATORY_HEADERS.filter(h => !headers.includes(h));
      const extra   = headers.filter(h => !MANDATORY_HEADERS.includes(h));
      if (missing.length) errs.push(`Missing columns: ${missing.join(", ")}`);
      if (extra.length)   errs.push(`Unexpected columns: ${extra.join(", ")}`);
      if (errs.length) return errs;

      const rows = XLSX.utils.sheet_to_json(sheet, { header: headers, defval: "", range: 1 });
      const seen = { e: new Set<string>(), p: new Set<string>(), a: new Set<string>() };
      rows.forEach((r: any, i: number) => {
        const row = i + 2;
        const e = String(r.Email || "").trim();
        const p = String(r["Mobile No"] || "").trim();
        const a = String(r["Aadhaar No"] || "").trim();
        if (!e||!p||!a) errs.push(`Row ${row}: missing field`);
        if (e && seen.e.has(e)) errs.push(`Row ${row}: duplicate Email`);
        if (p && seen.p.has(p)) errs.push(`Row ${row}: duplicate Mobile`);
        if (a && seen.a.has(a)) errs.push(`Row ${row}: duplicate Aadhaar`);
        seen.e.add(e); seen.p.add(p); seen.a.add(a);
      });
      return errs;
    } catch (e: any) {
      return [`Parse error: ${e.message}`];
    }
  };

  // 3️⃣ Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setFileName(f.name);
    }
  };

  // 4️⃣ Upload & generate passwords client-side
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Select a file first");
      return;
    }
    const errs = await validateFile(selectedFile);
    if (errs.length) {
      toast.error(errs.join(" | "));
      return;
    }
    if (!confirm(`Upload ${fileName}?`)) return;

    setLoading(true);
    try {
      // parse spreadsheet
      const buf   = await selectedFile.arrayBuffer();
      const wb    = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows  = XLSX.utils.sheet_to_json<any>(sheet, {
        header: MANDATORY_HEADERS,
        defval: "",
        range: 1,
      });

      // build payload with generated passwords
      const payload = rows.map(r => {
        const name      = String(r.Name).trim();
        const email     = String(r.Email).trim();
        const contactNo = String(r["Mobile No"]).trim();
        const aadhaarNo = String(r["Aadhaar No"]).trim();
        const password  = generateInitialPassword({
          role:      UserRole.FACULTY,
          fullName:  name,
          contactNo: contactNo,
        });
        return { name, email, contactNo, aadhaarNo, password };
      });

      const res  = await fetch("/api/hod/upload-faculty", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success(`Upserted ${json.faculty.length} records`);
      setFacultyData(json.faculty);
      setSelectedFile(null);
      setFileName("");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 5️⃣ “View” button opens modal
  const handleView = (row: any) => {
    setViewing({
      userId:    row.userId,
      name:      row.name,
      email:     row.email,
      contactNo: row.contactNo,
      aadhaarNo: row.aadhaarNo,
    });
  };

  // 6️⃣ Save from modal → PUT + local update
  const handleSave = async (upd: FacultyViewData) => {
    if (!viewing) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/hod/upload-faculty/${viewing.userId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(upd),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setFacultyData(fd =>
        fd.map(f => f.userId === viewing.userId ? { ...f, ...upd } : f)
      );
      toast.success("Updated!");
      setViewing(null);
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name",      label: "Name"       },
    { key: "email",     label: "Email"      },
    { key: "contactNo", label: "Mobile No"  },
    { key: "aadhaarNo", label: "Aadhaar No" },
  ];

  return (
    <div className="pt-28 px-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-8">
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
        onRemoveFile={() => { setSelectedFile(null); setFileName(""); }}
      />

      <FacultyTable
        students={facultyData}
        columns={columns}
        onView={handleView}
        sortColumn=""
        sortDirection=""
        onSort={() => {}}
        showCheckbox={false}
      />

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
