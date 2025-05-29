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

          const mappedData: FormData = {
            general: {
              candidate_first_name: result.student.firstName || "",
              candidate_last_name: result.student.lastName || "",
              candidate_id: result.student.id?.toString() || "",
              email: result.student.personalEmailId || "",
              current_degree: result.student.department?.name || "",
              affiliate_university:
                result.student.college?.affiliatedUniversity || "",
              college_name: result.student.college?.name || "",
              batch: result.student.batch || "",
              roll_reg_no: result.student.rollNo || "",
              sslc_percentage: result.student.sslcPercentage || "",
              hsc_percentage: result.student.hscPercentage || "",
              photo: result.student.photo || "",
            },
            ugDetails: ug
              ? {
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

  const update = useCallback(
    <K extends keyof FormData>(k: K, v: FormData[K]) =>
      setData((d) => ({ ...d, [k]: v })),
    []
  );

  const saveDraft = useCallback(async () => {
    const key = dataKeys[step];
    if (!key) {
      toast.error("Invalid step.");
      return;
    }
    const payload = { section: key, data: data[key] };
    try {
      const res = await fetch("/api/students/studetnsMultiSetForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🛠 [frontend] saveDraft response status", res.status);
      const result = await res.json();
      if (res.ok) {
        toast.success("Saved!");
      } else {
        toast.error(result.error || "Save failed");
      }
    } catch (err: any) {
      console.error("🛠 [frontend] saveDraft error:", err);
      toast.error("Network error: Could not save draft.");
    }
  }, [data, step]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // compute percent complete (excluding review)
  const keys = Object.keys(data).slice(0, -1) as (keyof FormData)[];
  const percent = Math.floor(
    keys.filter((k) => {
      const v = data[k];
      return Array.isArray(v) ? v.length > 0 : Object.values(v || {}).some(Boolean);
    }).length /
      keys.length *
      100
  );

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
            onSaveDraft={saveDraft}
            onSubmit={() => {}}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-4xl space-y-6">
        {/* Sticky Stepper */}
        <div className="sticky top-4 bg-white border-b-2 border-blue-200 z-10 py-2 px-6">
          {/* first 5 steps */}
          <div className="flex justify-between">
            {steps.slice(0, 5).map((label, i) => {
              const idx = i;
              return (
                <motion.div
                  key={idx}
                  onClick={() => setStep(idx)}
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold transition ${
                      idx < step
                        ? "bg-indigo-600 text-white"
                        : idx === step
                        ? "border-2 border-indigo-600 text-indigo-600"
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
              return (
                <motion.div
                  key={idx}
                  onClick={() => setStep(idx)}
                  className="flex flex-col items-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-base font-semibold transition ${
                      idx < step
                        ? "bg-indigo-600 text-white"
                        : idx === step
                        ? "border-2 border-indigo-600 text-indigo-600"
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
            <h2 className="text-2xl font-semibold">{steps[step]}</h2>
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
                  className="px-5 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                >
                  Save Draft
                </button>
              )}
              <button
                onClick={step === steps.length - 1 ? () => {} : next}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {step === steps.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
