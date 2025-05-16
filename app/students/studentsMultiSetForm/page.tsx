"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import Generalinfo from "@/components/studetentsForm/Generalinfo";
import ScholarshipForm from "@/components/studetentsForm/UGdetaisl";
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
  "Skills",
  "Social",
  "Publications",
  "Engancement Program",
  "Work Experience",
  "Placements",
  "Review",
];

interface FormData {
  general: any;
  scholarship: any;
  technicalSkills: any[];
  internships: any[];
  events: any[];
  socialProfiles: any;
  placements: any[];
  workExperience: any[];
  publications: any[];
}

export default function StudentMultiStepForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    general: {},
    scholarship: {},
    technicalSkills: [],
    internships: [],
    events: [],
    socialProfiles: {},
    placements: [],
    workExperience: [],
    publications: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch and map existing data from API on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/students/studetnsMultiSetForm");
        const result = await res.json();
        console.log("Received data from API:", result);

        if (result.student) {
          setData((prev) => ({
            ...prev,
            general: {
              candidate_first_name: result.student.firstName || "",
              candidate_last_name: result.student.lastName || "",
              candidate_id: result.student.id?.toString() || "",
              email: result.student.personalEmailId || "",
              current_degree: result.student.department?.name || "",
              affiliate_university: result.student.college?.affiliatedUniversity || "",
              college_name: result.student.college?.name || "",
              batch: result.student.academicYear || "",
              roll_reg_no: result.student.rollNo || "",
              sslc_percentage: result.student.sslcPercentage || "",
              hsc_percentage: result.student.hscPercentage || "",
              photo: result.student.photo || "",
            },
          }));
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const update = useCallback(
    <K extends keyof FormData>(k: K, v: FormData[K]) => setData(d => ({ ...d, [k]: v })),
    []
  );

  const saveDraft = useCallback(async () => {
    const key = Object.keys(data)[step] as keyof FormData;
    const payload = { section: key, data: data[key] };
    console.log("Sending data to API:", payload);
    try {
      const res = await fetch("/api/students/studetnsMultiSetForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("API response:", result);
      if (!res.ok) throw new Error();
      toast.success("Draft saved");
    } catch {
      toast.error("Save failed");
    }
  }, [data, step]);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // percentage complete (excluding review)
  const keys = Object.keys(data).slice(0, -1) as (keyof FormData)[];
  const percent = Math.floor(
    keys.filter(k => {
      const v = data[k];
      return Array.isArray(v) ? v.length > 0 : Object.values(v || {}).some(x => !!x);
    }).length / keys.length * 100
  );

  const renderStep = () => {
    switch (step) {
      case 0: return <Generalinfo data={data.general} onChange={d => update("general", d)} />;
      case 1: return <ScholarshipForm data={data.scholarship} onChange={d => update("scholarship", d)} />;
      case 2: return <InternshipsForm data={data.internships} onChange={d => update("internships", d)} />;
      case 3: return <TechnicalSkillsForm data={data.technicalSkills} onChange={d => update("technicalSkills", d)} />;
      case 4: return <SocialProfilesForm data={data.socialProfiles} onChange={d => update("socialProfiles", d)} />;
      case 5: return <PublicationsForm data={data.publications} onChange={d => update("publications", d)} />;
      case 6: return <EventsForm data={data.events} onChange={d => update("events", d)} />; // Engancement Program
      case 7: return <WorkExperienceForm data={data.workExperience} onChange={d => update("workExperience", d)} />;
      case 8: return  <PlacementsForm data={data.placements} onChange={d => update("placements", d)} />;
      case 9: return <ReviewForm data={data} labels={steps} onEdit={setStep} onSaveDraft={saveDraft} onSubmit={() => {}} />;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Stepper */}
        <div className="bg-white shadow rounded-lg overflow-x-auto border-blue-200 border-2 shadow-2xl">
          <div className="flex space-x-4 p-4 justify-center">
            {steps.map((label, i) => (
              <motion.div
                key={i}
                onClick={() => setStep(i)}
                className="cursor-pointer text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                  i <= step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i+1}
                </div>
                <div className="mt-1 text-xs truncate w-16">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{steps[step]}</h2>
            {step < steps.length-1 && (
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
              {step < steps.length-1 && (
                <button
                  onClick={saveDraft}
                  className="px-5 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
                >
                  Save Draft
                </button>
              )}
              <button
                onClick={step === steps.length-1 ? () => {/* final submission */} : next}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {step === steps.length-1 ? "Submit" : "Next"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}