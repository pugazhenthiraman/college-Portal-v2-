"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ProjectsForm, { Project } from "@/components/studetentsForm/ProjectsForm";

import Generalinfo from "@/components/studetentsForm/Generalinfo";
import UGDetailsForm from "@/components/studetentsForm/UGdetaisl";
import TechnicalSkillsForm from "@/components/studetentsForm/TechnicalSkillsForm";
import InternshipsForm from "@/components/studetentsForm/InternshipsForm";
import EventsForm from "@/components/studetentsForm/EngancementPrograme";
import SocialProfilesForm from "@/components/studetentsForm/SocialProfilesForm";
import PlacementsForm from "@/components/studetentsForm/PlacementsForm";
import WorkExperienceForm from "@/components/studetentsForm/WorkExperienceForm";
import PublicationsForm from "@/components/studetentsForm/PublicationsForm";
import ReviewForm from "@/components/studetentsForm/ReviewForm";
import isEqual from "lodash.isequal";

const steps = [
  "General Info",
  "UG Details",
  "Internships",
  "Projects",
  "Skills",
  "Social",
  "Publications",
  "Enhancement Program",
  "Work Experience",
  "Placements",
  "Review",
];

const dataKeys: (keyof FormData)[] = [
  "general",
  "ugDetails",
  "internships",
  "projects", 
  "technicalSkills",
  "socialProfiles",
  "publications",
  "events",
  "workExperience",
  "placements",
];

interface FormData {
  general: any;
  ugDetails: any;
  technicalSkills: any[];
  internships: any[];
  projects: Project[];  
  events: any[];
  socialProfiles: any;
  placements: any[];
  workExperience: any[];
  publications: any[];
}

const OPTIONAL_INTERNSHIP_FIELDS = ["stipend", "supervisorName"];
const OPTIONAL_PROJECT_FIELDS = ["link"];
const OPTIONAL_PUBLICATION_FIELDS = ["link"];

function getUnansweredFields(data: FormData): string[] {
  const keys = Object.keys(data).filter(k => k !== 'review' && k !== 'socialProfiles') as (keyof FormData)[];
  const missing: string[] = [];
  for (const key of keys) {
    const value = data[key];
    if (key === 'ugDetails' && value && typeof value === 'object') {
      // PG fields conditional logic
      const pgFields = [
        'pgBatch',
        'pgSemesterNo',
        'pgSemesterMarksheet',
        'pgOverallCGPA',
        'pgOverallPercentage',
      ];
      for (const [field, v] of Object.entries(value)) {
        // Only require PG fields if isPG is true
        if (
          pgFields.includes(field) &&
          (!value.isPG || value.isPG === false)
        ) {
          continue; // skip PG fields if isPG is not checked
        }
        if (v === undefined || v === null || v === "") {
          missing.push(`${key}.${field}`);
        }
      }
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          // All fields optional for workExperience
          if (key === "workExperience") return;
          for (const [field, v] of Object.entries(item)) {
            if (
              (v === undefined || v === null || v === "") &&
              !(
                (key === "internships" && OPTIONAL_INTERNSHIP_FIELDS.includes(field)) ||
                (key === "projects" && OPTIONAL_PROJECT_FIELDS.includes(field)) ||
                (key === "publications" && OPTIONAL_PUBLICATION_FIELDS.includes(field))
              )
            ) {
              missing.push(`${key}[${idx}].${field}`);
            }
          }
        } else if (item === undefined || item === null || item === "") {
          if (key !== "workExperience") {
            missing.push(`${key}[${idx}]`);
          }
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      for (const v of Object.values(value)) {
        if (v === undefined || v === null || v === "") {
          missing.push(`${key}`);
        }
      }
    } else if (value === undefined || value === null || value === "") {
      missing.push(key);
    }
  }
  return missing;
}

// Utility: Get all visible fields for percentage calculation
function getVisibleFields(data: FormData) {
  let total = 0;
  let filled = 0;

  // Required sections only
  // General Info
  if (data.general) {
    for (const v of Object.values(data.general)) {
      total++;
      if (v !== undefined && v !== null && String(v).trim() !== "") filled++;
    }
  }

  // UG/PG Details
  if (data.ugDetails) {
    const UG_FIELDS = [
      "ugBatch",
      "semesterNo",
      "semesterMarksheet",
      "overallCGPA",
      "overallPercentage",
    ];
    for (const field of UG_FIELDS) {
      total++;
      const v = data.ugDetails[field];
      if (v !== undefined && v !== null && String(v).trim() !== "") filled++;
    }
    if (data.ugDetails.isPG) {
      const PG_FIELDS = [
        "pgBatch",
        "pgSemesterNo",
        "pgSemesterMarksheet",
        "pgOverallCGPA",
        "pgOverallPercentage",
      ];
      for (const field of PG_FIELDS) {
        total++;
        const v = data.ugDetails[field];
        if (v !== undefined && v !== null && String(v).trim() !== "") filled++;
      }
    }
  }

  // Helper for array sections, skips optional fields for internships and projects
  function countRequiredArraySection(arr: any[], sectionKey: string) {
    if (!arr || arr.length === 0) {
      // Section is required but empty
      return [1, 0];
    }
    let t = 0, f = 0;
    for (const item of arr) {
      for (const [field, v] of Object.entries(item)) {
        // Skip optional fields
        if (
          (sectionKey === "internships" && OPTIONAL_INTERNSHIP_FIELDS.includes(field)) ||
          (sectionKey === "projects" && OPTIONAL_PROJECT_FIELDS.includes(field)) ||
          (sectionKey === "publications" && OPTIONAL_PUBLICATION_FIELDS.includes(field))
        ) continue;
        t++;
        if (v !== undefined && v !== null && String(v).trim() !== "") f++;
      }
    }
    return [t, f];
  }

  // Only count required array sections
  if (Array.isArray(data.technicalSkills)) {
    const [t, f] = countRequiredArraySection(data.technicalSkills, "technicalSkills");
    total += t;
    filled += f;
  }
  if (Array.isArray(data.internships)) {
    const [t, f] = countRequiredArraySection(data.internships, "internships");
    total += t;
    filled += f;
  }
  if (Array.isArray(data.projects)) {
    const [t, f] = countRequiredArraySection(data.projects, "projects");
    total += t;
    filled += f;
  }
  if (Array.isArray(data.events)) {
    const [t, f] = countRequiredArraySection(data.events, "events");
    total += t;
    filled += f;
  }
  if (Array.isArray(data.placements)) {
    const [t, f] = countRequiredArraySection(data.placements, "placements");
    total += t;
    filled += f;
  }
  if (Array.isArray(data.publications)) {
    const [t, f] = countRequiredArraySection(data.publications, "publications");
    total += t;
    filled += f;
  }

  // socialProfiles and workExperience are optional, so skip them

  return { total, filled };
}

// Helper to capitalize first letter
function capitalizeFirst(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper to prettify field names
function prettifyFieldName(str: string) {
  if (!str) return str;
  // Convert camelCase or snake_case to Title Case
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to get item title for array sections
function getItemTitle(sectionKey: string, item: any, idx: number) {
  if (!item) return `Item ${idx + 1}`;
  if (sectionKey === 'internships') return item.company ? item.company : `Item ${idx + 1}`;
  if (sectionKey === 'projects') return item.title ? item.title : `Item ${idx + 1}`;
  if (sectionKey === 'placements') return item.employer ? item.employer : `Item ${idx + 1}`;
  if (sectionKey === 'publications') return item.title ? item.title : `Item ${idx + 1}`;
  if (sectionKey === 'events') return item.name ? item.name : `Item ${idx + 1}`;
  if (sectionKey === 'workExperience') return item.company ? item.company : `Item ${idx + 1}`;
  if (sectionKey === 'technicalSkills') return item.courseName ? item.courseName : `Item ${idx + 1}`;
  return `Item ${idx + 1}`;
}

export default function StudentMultiStepForm() {
  console.log("🛠 [frontend] StudentMultiStepForm mounted");

  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    general: {},
    ugDetails: {},
    technicalSkills: [],
    internships: [],
    projects: [], 
    events: [],
    socialProfiles: {},
    placements: [],
    workExperience: [],
    publications: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [unansweredFields, setUnansweredFields] = useState<string[]>([]);

  // Fetch existing data
  useEffect(() => {
    console.log("🛠 [frontend] fetchData useEffect fired");

    async function fetchData() {
      try {
        const res = await fetch("/api/students/studetnsMultiSetForm");
        console.log("🛠 [frontend] fetch() returned status", res.status);
        if (!res.ok) throw new Error("Fetch failed");

        const result = await res.json();

        // 1️⃣ raw array from backend
        console.log(
          "🛠 [frontend] raw socialProfiles array →",
          result.student.socialProfiles
        );

        // 2️⃣ unwrap into a single object
        const raw = result.student.socialProfiles;
        const socialObj = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw || {};
        console.log("🛠 [frontend] unwrapped socialProfiles →", socialObj);

        // Map into your FormData shape
        if (result.student) {
          const ugRaw = result.student.ugDetails;
          const ug = Array.isArray(ugRaw) && ugRaw.length > 0 ? ugRaw[0] : ugRaw;

          console.log("[frontend] ugDetails raw data →", ugRaw);
            const mappedData: FormData = {
              general: {
                candidate_first_name: result.student.firstName || "",
                candidate_last_name: result.student.lastName || "",
                candidate_id: result.student.id?.toString() || "",
                email: result.student.personalEmailId || "",
                current_degree: result.student.department?.name || "",
                affiliate_university: result.student.college?.affiliatedUniversity || "",
                college_name: result.student.college?.name || "",
                roll_reg_no: result.student.rollNo || "",
                sslc_percentage: result.student.sslcPercentage || "",
                hsc_percentage: result.student.hscPercentage || "",
                photo: result.student.photo || "",
                country: result.student.country || "",
                district: result.student.district || "",
                state: result.student.state || "",
                departmentName: result.student.departmentName || "",
                section: result.student.section || "",
                academicYear: result.student.academicYear || "",
                adhaarNo: result.student.adhaarNo || "",
                passportNo: result.student.passportNo || "",
                passportExpiryDate: result.student.passportExpiryDate
                  ? new Date(result.student.passportExpiryDate).toISOString().substring(0, 10)
                  : "",
                DOB: result.student.DOB
                  ? new Date(result.student.DOB).toISOString().substring(0, 10)
                  : "",
                phoneNo: result.student.phoneNo || "",
                secondaryPhoneNo: result.student.secondaryPhoneNo || "",
                panNo: result.student.panNo || "",
              },
              ugDetails: ug
                ? {
                    ugBatch: ug.ugBatch || "",
                    pgBatch: ug.pgBatch || "",
                    semesterNo: ug.semesterNo || "",
                    semesterMarksheet: ug.semesterMarksheet || "",
                    overallCGPA: ug.overallCGPA || "",
                    overallPercentage: ug.overallPercentage || "",
                    isPG: ug.isPG || false,
                    pgSemesterNo: ug.pgSemesterNo || "",
                    pgSemesterMarksheet: ug.pgSemesterMarksheet || "",
                    pgOverallCGPA: ug.pgOverallCGPA || "",
                    pgOverallPercentage: ug.pgOverallPercentage || "",
                  }
                : {},
              technicalSkills: result.student.technicalSkills || [],
              internships: result.student.internships || [],
              projects:      result.student.projects      || [],
              events: result.student.events || [],
              socialProfiles: socialObj,
              placements: result.student.placements || [],
              workExperience: result.student.workExperiences || [],
              publications: result.student.publications || [],
            };

          // 3️⃣ confirm what goes into state
          console.log(
            "🛠 [frontend] mappedData.socialProfiles →",
            mappedData.socialProfiles
          );

          setData(mappedData);
        }
      } catch (err: any) {
        console.error("🛠 [frontend] fetchData error:", err);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update data and mark as unsaved
  const update = useCallback(
    <K extends keyof FormData>(k: K, v: FormData[K]) => {
      setData((d) => ({ ...d, [k]: v }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const saveDraft = useCallback(async () => {
    const key = dataKeys[step];
    if (!key) {
      toast.error("Invalid step.");
      return;
    }
    let payloadData = data[key];
    if (key === "general" && (payloadData.photo === undefined || payloadData.photo === "")) {
      payloadData = { ...payloadData, photo: null };
    }
    if (key === "ugDetails") {
      payloadData = {
        ...payloadData,
        ugBatch: payloadData.ugBatch,
        pgBatch: payloadData.pgBatch,
      };
    }
    const payload = { section: key, data: payloadData };
    try {
      const res = await fetch("/api/students/studetnsMultiSetForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Saved!");
        setHasUnsavedChanges(false);
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch (err: any) {
      console.error("🛠 [frontend] saveDraft error:", err);
      toast.error("Network error: Could not save draft.");
    }
  }, [data, step]);

  // Helper: get unanswered fields for current step (all empty fields, not just required)
  function getUnansweredFieldsForStep(stepIdx: number): string[] {
    const key = dataKeys[stepIdx];
    if (!key) return [];
    const value = data[key];
    const missing: string[] = [];
    if (key === 'ugDetails' && value && typeof value === 'object') {
      // UG fields (always visible)
      const UG_FIELDS = [
        'ugBatch',
        'semesterNo',
        'semesterMarksheet',
        'overallCGPA',
        'overallPercentage',
      ];
      for (const field of UG_FIELDS) {
        if (value[field] === undefined || value[field] === null || value[field] === "") missing.push(prettifyFieldName(field));
      }
      // PG fields (only if isPG is true)
      if (value.isPG) {
        const PG_FIELDS = [
          'pgBatch',
          'pgSemesterNo',
          'pgSemesterMarksheet',
          'pgOverallCGPA',
          'pgOverallPercentage',
        ];
        for (const field of PG_FIELDS) {
          if (value[field] === undefined || value[field] === null || value[field] === "") missing.push(prettifyFieldName(field));
        }
      }
      return missing;
    }
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const itemTitle = getItemTitle(key, item, idx);
          for (const [field, v] of Object.entries(item)) {
            let isOptional = false;
            if (key === "internships" && OPTIONAL_INTERNSHIP_FIELDS.includes(field)) isOptional = true;
            if (key === "projects" && OPTIONAL_PROJECT_FIELDS.includes(field)) isOptional = true;
            if (key === "publications" && OPTIONAL_PUBLICATION_FIELDS.includes(field)) isOptional = true;
            // For workExperience, treat all as optional
            if (key === "workExperience") isOptional = true;
            if (v === undefined || v === null || v === "") {
              missing.push(`${itemTitle} – ${prettifyFieldName(field)}${isOptional ? ' (Optional)' : ''}`);
            }
          }
        }
      });
      return missing;
    }
    if (typeof value === 'object' && value !== null) {
      for (const [field, v] of Object.entries(value)) {
        if (v === undefined || v === null || v === "") missing.push(prettifyFieldName(field));
      }
      return missing;
    }
    return missing;
  }

  // Modified next function
  const next = () => {
    if (hasUnsavedChanges) {
      toast.error("You have unsaved changes. Please click 'Save Draft' before proceeding.");
      return;
    }
    const missing = getUnansweredFieldsForStep(step);
    if (missing.length > 0) {
      setUnansweredFields(missing);
      setShowUnansweredModal(true);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  // Handler for skipping unanswered fields
  const handleSkipUnanswered = () => {
    setShowUnansweredModal(false);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  // Handler for filling now
  const handleFillNow = () => {
    setShowUnansweredModal(false);
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  // compute percent complete (excluding review)
  const { total, filled } = getVisibleFields(data);
  const percent = total === 0 ? 0 : Math.floor((filled / total) * 100);

  // Helper: is a step complete?
  const isStepComplete = (idx: number) => {
    const key = dataKeys[idx];
    if (!key) return false;
    const v = data[key];
    return Array.isArray(v) ? v.length > 0 : Object.values(v || {}).some(Boolean);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Generalinfo data={data.general} onChange={(d) => update("general", d)} />;
      case 1:
        return <UGDetailsForm data={data.ugDetails} onChange={(d) => update("ugDetails", d)} />;
      case 2:
        return <InternshipsForm data={data.internships} onChange={(d) => update("internships", d)} />;
      case 3:
        return <ProjectsForm data={data.projects} onChange={(d) => update("projects", d)} />;
      case 4:
        return <TechnicalSkillsForm data={data.technicalSkills} onChange={(d) => update("technicalSkills", d)} />;
      case 5:
        return <SocialProfilesForm data={data.socialProfiles} onChange={(d) => update("socialProfiles", d)} />;
      case 6:
        return <PublicationsForm data={data.publications} onChange={(d) => update("publications", d)} />;
      case 7:
        return <EventsForm data={data.events} onChange={(d) => update("events", d)} />;
      case 8:
        return <WorkExperienceForm data={data.workExperience} onChange={(d) => update("workExperience", d)} />;
      case 9:
        return <PlacementsForm data={data.placements} onChange={(d) => update("placements", d)} />;
      case 10:
        return (
          <ReviewForm
            data={data}
            labels={steps}
            onEdit={setStep}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    // Check for required array sections being empty
    const requiredArrays: { key: keyof FormData; label: string }[] = [
      { key: "technicalSkills", label: "Technical Skills" },
      { key: "internships", label: "Internship" },
      { key: "projects", label: "Project" },
      { key: "events", label: "Enhancement Program" },
      { key: "placements", label: "Placement" },
      { key: "publications", label: "Publication" },
    ];
    for (const { key, label } of requiredArrays) {
      if (Array.isArray(data[key]) && data[key].length === 0) {
        toast.error(`Please add at least one ${label} entry before submitting.`);
        return;
      }
    }
    // Check for changes since last submit
    const last = typeof window !== 'undefined' ? localStorage.getItem('lastSubmittedStudentData') : null;
    if (last && isEqual(data, JSON.parse(last))) {
      toast.error("No changes detected. Please update your details before resubmitting.");
      return;
    }
    const missingFields = getUnansweredFields(data);
    if (missingFields.length > 0) {
      // User-friendly missing fields message
      const grouped: Record<string, string[]> = {};
      missingFields.forEach(m => {
        const match = m.match(/([a-zA-Z]+)\[(\d+)\]\.(.+)/);
        if (match) {
          const [, section, idx, field] = match;
          const sectionMap: Record<string, string> = {
            technicalSkills: 'Technical Skill',
            internships: 'Internship',
            projects: 'Project',
            events: 'Enhancement Program',
            placements: 'Placement',
            workExperience: 'Work Experience',
            publications: 'Publication',
          };
          const sectionLabel = sectionMap[section] || section;
          const key = `${sectionLabel} #${parseInt(idx, 10) + 1}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(prettifyFieldName(field));
        } else {
          // Fallback for non-array fields
          grouped['General'] = grouped['General'] || [];
          grouped['General'].push(prettifyFieldName(m));
        }
      });
      let message = 'Please fill all required fields:';
      for (const [section, fields] of Object.entries(grouped)) {
        message += `\n${section}: ${(fields as string[]).join(', ')}`;
      }
      toast.error(message);
      return;
    }
    try {
      console.log("[Submit] Sending POST request to /api/students/submit");
      const res = await fetch("/api/students/submit", {
        method: "POST",
      });
      const result = await res.json();
      console.log("[Submit] Response status:", res.status, "Response body:", result);
      if (res.ok && result.success) {
        toast.success(capitalizeFirst("Profile Submitted For Faculty Review!"));
        setSubmitted(true);
        // Save snapshot of last submitted data
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastSubmittedStudentData', JSON.stringify(data));
        }
      } else {
        toast.error(result.error || "Submission failed.");
      }
    } catch (e) {
      console.error("[Submit] Network error:", e);
      toast.error("Network error. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <Toaster position="top-right" />
      {/* Unanswered Fields Modal */}
      {showUnansweredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">Unanswered Fields</h2>
            <ul className="list-disc ml-6 mb-4 text-gray-700 text-left w-full">
              {unansweredFields.slice(0, 5).map((field, idx) => (
                <li key={idx}>{field}</li>
              ))}
              {unansweredFields.length > 5 && (
                <li className="italic text-gray-500">
                  +{unansweredFields.length - 5} more...
                </li>
              )}
            </ul>
            <div className="flex gap-4 mt-2 w-full justify-center">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                onClick={handleFillNow}
              >
                Fill Now
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={handleSkipUnanswered}
              >
                Skip & Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-4xl space-y-6">
        {/* Sticky Stepper */}
        <div className="sticky top-4 bg-white border-b-2 border-blue-200 z-10 py-2 px-6">
          {/* first 5 steps */}
          <div className="flex justify-between">
            {steps.slice(0, 5).map((label, i) => {
              const idx = i;
              const complete = isStepComplete(idx);
              return (
                <motion.div
                  key={idx}
                  onClick={() => setStep(idx)}
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold transition ${
                      complete
                        ? idx === step
                          ? "bg-indigo-600 border-4 border-indigo-300 text-white"
                          : "bg-indigo-600 text-white"
                        : idx === step
                        ? "border-2 border-indigo-600 text-indigo-600 bg-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="mt-1 text-xs font-medium text-center w-20">
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* next 5 steps */}
          <div className="flex justify-between mt-2">
            {steps.slice(5).map((label, i) => {
              const idx = i + 5;
              const complete = isStepComplete(idx);
              return (
                <motion.div
                  key={idx}
                  onClick={() => setStep(idx)}
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold transition ${
                      complete
                        ? idx === step
                          ? "bg-indigo-600 border-4 border-indigo-300 text-white"
                          : "bg-indigo-600 text-white"
                        : idx === step
                        ? "border-2 border-indigo-600 text-indigo-600 bg-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="mt-1 text-xs font-medium text-center w-20">
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {steps[step]}
              {step === 8 && <span className="text-base text-gray-500 ml-2">(Optional)</span>}
            </h2>
            {step < steps.length - 1 && (
              <span className="text-indigo-600 font-medium">{percent}% complete</span>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-8 flex justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Back
            </button>
            <div className="space-x-3">
              {step < steps.length - 1 && (
                <button
                  onClick={saveDraft}
                  className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Save Draft
                </button>
              )}
              <button
                onClick={step === steps.length - 1 ? handleSubmit : next}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                disabled={step === steps.length - 1 && submitted}
              >
                {step === steps.length - 1 ? (submitted ? "Submitted" : "Submit") : "Next"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}