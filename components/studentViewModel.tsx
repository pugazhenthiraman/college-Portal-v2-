"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Tab } from "@headlessui/react";
import { UserIcon, AcademicCapIcon, SparklesIcon, BriefcaseIcon, ClipboardIcon, StarIcon, UsersIcon, BuildingOffice2Icon, BookOpenIcon, PhotoIcon } from "@heroicons/react/24/outline";
import ExpandableText from "./ExpandableText";
import { Toaster } from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
  onSave: (updatedStudent: any) => void;
};

export const StudentViewModal = ({ isOpen, onClose, student, onSave }: Props) => {
  // mode can be "view" or "edit"
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editedStudent, setEditedStudent] = useState<any | null>(student);
  // Add state for remark
  const [remark, setRemark] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  // For preview modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [expandedSkillIdx, setExpandedSkillIdx] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{action: 'verify' | 'reject' | null, open: boolean}>({action: null, open: false});
  const [remarkRequiredModal, setRemarkRequiredModal] = useState(false);

  useEffect(() => {
    setEditedStudent(student);
    setMode("view");
  }, [student]);

  if (!isOpen || !student) return null;

  // Overlay click will close the modal.
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Prevent clicks inside modal content from closing the modal.
  const handleContentClick = () => {};

  const handleSave = () => {
    if (editedStudent) {
      // Ensure email is at the top level for backend compatibility
      const payload = {
        ...editedStudent,
        email: editedStudent.email || editedStudent.user?.email,
      };
      onSave(payload);
      onClose();
      setMode("view");
    }
  };

  const toggleEditMode = () => {
    setMode(mode === "view" ? "edit" : "view");
  };

  // Handler for verify/reject
  const handleVerifyReject = async (action: "verify" | "reject") => {
    if (!student?.id) return;
    if (action === "reject" && !remark.trim()) {
      toast.error("Remark is required when rejecting a student.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch("/api/faculty/students/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, action, remarks: remark }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Student ${action === "verify" ? "verified" : "rejected"} successfully`);
        onClose();
        onSave && onSave(student); // Optionally trigger parent refresh
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for confirm modal
  const handleConfirm = (action: 'verify' | 'reject') => {
    if (action === 'reject' && !remark.trim()) {
      setRemarkRequiredModal(true);
      return;
    }
    setConfirmModal({action, open: true});
  };
  const handleConfirmProceed = async () => {
    if (confirmModal.action) {
      await handleVerifyReject(confirmModal.action);
      setConfirmModal({action: null, open: false});
    }
  };
  const handleConfirmCancel = () => {
    setConfirmModal({action: null, open: false});
  };

  // Helper to render images or download links, with preview
  const renderFile = (file: string | null, label = "View") => {
    if (!file) return <span className="text-gray-400">N/A</span>;
    const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = file.match(/\.pdf$/i);
    if (isImage) {
      return (
        <>
          <img
            src={file}
            alt={label}
            className="max-h-24 max-w-xs rounded border shadow cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setPreviewUrl(file);
              setPreviewType('image');
            }}
          />
          <div className="text-xs text-gray-500">Click to enlarge</div>
        </>
      );
    }
    if (isPdf) {
      return (
        <>
          <button
            className="text-indigo-600 underline text-sm font-medium"
            onClick={() => {
              setPreviewUrl(file);
              setPreviewType('pdf');
            }}
          >
            Preview PDF
          </button>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-gray-500 underline text-xs"
          >
            Download
          </a>
        </>
      );
    }
    return (
      <a href={file} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{label}</a>
    );
  };

  // Tab definitions with icons
  const tabs = [
    { name: "General Info", icon: UserIcon },
    { name: "UG/PG Details", icon: AcademicCapIcon },
    { name: "Technical Skills", icon: SparklesIcon },
    { name: "Internships", icon: BriefcaseIcon },
    { name: "Projects", icon: ClipboardIcon },
    { name: "Enhancement Programs", icon: StarIcon },
    { name: "Social Profiles", icon: UsersIcon },
    { name: "Placements", icon: BuildingOffice2Icon },
    { name: "Work Experience", icon: BriefcaseIcon },
    { name: "Publications", icon: BookOpenIcon },
  ];

  // Helper to capitalize first letter
  const capitalize = (str: string | undefined | null) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper to convert snake_case or camelCase to human-friendly label
  const toLabel = (str: string) =>
    str
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());

  // Add this helper at the top (after imports)
  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB'); // DD/MM/YYYY, HH:mm:ss
  }

  // Tab content renderers (same as before, but with section headings and cards)
  const tabContents = [
    // General Info
    <div className="space-y-6" key="general">
      <div className="flex items-center gap-3 mb-2">
        <UserIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">General Info</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[{ label: "First Name", value: student.firstName },
        { label: "Last Name", value: student.lastName },
        { label: "Email", value: student.email || student.user?.email },
        { label: "Personal Email", value: student.personalEmailId },
        { label: "Roll No", value: student.rollNo },
        { label: "Affiliate University", value: student.college?.affiliatedUniversity },
        { label: "College Name", value: student.college?.name },
        { label: "Department", value: student.departmentName },
        { label: "Section", value: student.section },
        { label: "Academic Year", value: student.academicYear },
        { label: "PAN No", value: student.panNo },
        { label: "DOB", value: student.DOB ? new Date(student.DOB).toLocaleDateString("en-GB") : null },
        { label: "Phone No", value: student.phoneNo },
        { label: "Secondary Phone", value: student.secondaryPhoneNo },
        { label: "Country", value: student.country },
        { label: "District", value: student.district },
        { label: "State", value: student.state },
        { label: "Adhaar No", value: student.adhaarNo },
        { label: "Passport No", value: student.passportNo },
        { label: "Passport Expiry", value: student.passportExpiryDate ? new Date(student.passportExpiryDate).toLocaleDateString("en-GB") : null },
        { label: "Created At", value: student.createdAt ? new Date(student.createdAt).toLocaleString() : null },
        { label: "Photo", value: renderFile(student.photo, "Photo") },
      ].map((field, idx) => (
          <div key={idx} className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
            <span className="font-semibold text-gray-700">{toLabel(field.label)}</span>
            <span className="text-gray-900 font-medium">{field.value || "N/A"}</span>
        </div>
      ))}
    </div>
    </div>,
    // UG/PG Details
    <div className="space-y-6" key="ugdetails">
      <div className="flex items-center gap-3 mb-2">
        <AcademicCapIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">UG Details</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
          <span className="font-semibold text-gray-700">Batch</span>
          <span className="text-gray-900 font-medium">{student.ugDetails?.ugBatch || "N/A"}</span>
        </div>
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
          <span className="font-semibold text-gray-700">Semester No</span>
          <span className="text-gray-900 font-medium">{student.ugDetails?.semesterNo || "N/A"}</span>
        </div>
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
          <span className="font-semibold text-gray-700">Marksheet</span>
          <span className="text-gray-900 font-medium">{renderFile(student.ugDetails?.semesterMarksheet, "View Marksheet")}</span>
        </div>
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
          <span className="font-semibold text-gray-700">CGPA</span>
          <span className="text-gray-900 font-medium">{student.ugDetails?.overallCGPA || "N/A"}</span>
        </div>
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
          <span className="font-semibold text-gray-700">Percentage</span>
          <span className="text-gray-900 font-medium">{student.ugDetails?.overallPercentage || "N/A"}</span>
        </div>
        {/* PG Section */}
        {(student.ugDetails?.isPG || student.ugDetails?.pgBatch) && (
          <>
            <div className="col-span-2 flex items-center gap-2 mt-4">
              <AcademicCapIcon className="h-6 w-6 text-indigo-400" />
              <h2 className="text-lg font-bold text-indigo-700">PG Details</h2>
            </div>
            <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-semibold text-gray-700">PG Batch</span>
              <span className="text-gray-900 font-medium">{student.ugDetails?.pgBatch || "N/A"}</span>
            </div>
            <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-semibold text-gray-700">PG Semester No</span>
              <span className="text-gray-900 font-medium">{student.ugDetails?.pgSemesterNo || "N/A"}</span>
            </div>
            <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-semibold text-gray-700">PG Marksheet</span>
              <span className="text-gray-900 font-medium">{renderFile(student.ugDetails?.pgSemesterMarksheet, "View Marksheet")}</span>
            </div>
            <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-semibold text-gray-700">PG CGPA</span>
              <span className="text-gray-900 font-medium">{student.ugDetails?.pgOverallCGPA || "N/A"}</span>
            </div>
            <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
              <span className="font-semibold text-gray-700">PG Percentage</span>
              <span className="text-gray-900 font-medium">{student.ugDetails?.pgOverallPercentage || "N/A"}</span>
            </div>
          </>
        )}
      </div>
    </div>,
    // Technical Skills
    <div className="space-y-6" key="skills">
      <div className="flex items-center gap-3 mb-2">
        <SparklesIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Technical Skills</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {student.technicalSkills && student.technicalSkills.length > 0 ? student.technicalSkills.map((skill: any, idx: number) => (
          <div
            key={skill.id || skill.courseName}
            className="bg-white border border-indigo-100 rounded-2xl shadow-lg p-6 flex flex-col gap-2 transition-transform hover:scale-[1.02] hover:shadow-2xl duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-lg font-bold text-indigo-700">{capitalize(skill.courseName || "N/A")}</span>
            </div>
            <div><span className="font-semibold text-gray-600">Level:</span> <span className="text-indigo-600">{capitalize(skill.level || "N/A")}</span></div>
            <div><span className="font-semibold text-gray-600">Start Date:</span> {skill.startDate ? new Date(skill.startDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div><span className="font-semibold text-gray-600">End Date:</span> {skill.endDate ? new Date(skill.endDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="break-all"><span className="font-semibold text-gray-600">Details:</span> <ExpandableText value={skill.details || "N/A"} /></div>
            <div><span className="font-semibold text-gray-600">Certificate:</span> {renderFile(skill.certificateFile, capitalize(skill.certificateName))}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
              No Data Available
            </span>
          </div>
        )}
      </div>
    </div>,
    // Internships
    <div className="space-y-6" key="internships">
      <div className="flex items-center gap-3 mb-2">
        <BriefcaseIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Internships</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.internships && student.internships.length > 0 ? student.internships.map((intern: any) => (
          <div key={intern.id || intern.company} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(intern.company)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Role:</span> {capitalize(intern.role)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Start Date:</span> {intern.startDate ? new Date(intern.startDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">End Date:</span> {intern.endDate ? new Date(intern.endDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">State:</span> {capitalize(intern.state)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">District:</span> {capitalize(intern.district)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Block:</span> {capitalize(intern.block)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Mode:</span> {capitalize(intern.mode)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Company Email:</span> {intern.companyEmail || "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Stipend:</span> {intern.stipend || "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Supervisor Name:</span> {intern.supervisorName || "N/A"}</div>
            <div className="break-all text-sm"><span className="font-semibold text-gray-600">Responsibilities:</span> <ExpandableText value={capitalize(intern.responsibilities)} /></div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Certificate:</span> {renderFile(intern.certificate, capitalize(intern.certificateName))}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>,
    // Projects
    <div className="space-y-6" key="projects">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Projects</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.projects && student.projects.length > 0 ? student.projects.map((prj: any) => (
          <div key={prj.id || prj.title} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(prj.title)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Category:</span> {capitalize(prj.category)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Start Date:</span> {prj.startDate ? new Date(prj.startDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">End Date:</span> {prj.endDate ? new Date(prj.endDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Description:</span> {capitalize(prj.description)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">GitHub:</span> {prj.githubRepo ? <a href={prj.githubRepo} className="text-indigo-600 underline" target="_blank">Repo</a> : "N/A"}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>,
    // Enhancement Programs
    <div className="space-y-6" key="events">
      <div className="flex items-center gap-3 mb-2">
        <StarIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Enhancement Programs</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.events && student.events.length > 0 ? student.events.map((evt: any) => (
          <div key={evt.id || evt.name} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <StarIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(evt.name)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">District:</span> {capitalize(evt.district)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Block:</span> {capitalize(evt.block)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Start Date:</span> {evt.startDate ? new Date(evt.startDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">End Date:</span> {evt.endDate ? new Date(evt.endDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="break-all text-sm"><span className="font-semibold text-gray-600">Details:</span> <ExpandableText value={capitalize(evt.details)} /></div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Contribution:</span> <ExpandableText value={capitalize(evt.contribution)} /></div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>,
    // Social Profiles
    <div className="space-y-6" key="socialProfiles">
      <div className="flex items-center gap-3 mb-2">
        <UsersIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Social Profiles</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(() => {
          let profiles = student.socialProfiles;
          if (!profiles || (Array.isArray(profiles) && profiles.length === 0) || (typeof profiles === 'object' && Object.keys(profiles).length === 0)) {
            return <span className="text-gray-400">No data available</span>;
          }
          // If array, use first element
          if (Array.isArray(profiles)) profiles = profiles[0] || {};
          // Remove id, studentId, createdAt
          const filtered = Object.entries(profiles).filter(([k, v]) => !['id', 'studentId', 'createdAt'].includes(k) && v !== undefined && v !== null && v !== '');
          const createdAt = profiles.createdAt;
          if (filtered.length === 0) {
            return [
              <div key="no-data" className="col-span-full flex justify-center items-center py-12">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
                  No Data Available
                </span>
              </div>
            ];
          }
          return (
            <>
              {filtered.map(([k, v]) => (
                <div key={k} className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
                  <span className="font-semibold text-gray-700">{toLabel(k)}</span>
                  <span className="text-gray-900 font-medium">{v || "N/A"}</span>
                </div>
              ))}
              {createdAt && (
                <div className="flex flex-col bg-gray-50 rounded-lg p-3 shadow-sm">
                  <span className="font-semibold text-gray-700">Created At</span>
                  <span className="text-gray-900 font-medium">{formatDisplayDate(createdAt)}</span>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>,
    // Placements
    <div className="space-y-6" key="placements">
      <div className="flex items-center gap-3 mb-2">
        <BuildingOffice2Icon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Placements</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.placements && student.placements.length > 0 ? student.placements.map((pl: any) => (
          <div key={pl.id || pl.employer} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <BuildingOffice2Icon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(pl.employer)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Designation:</span> {capitalize(pl.designation)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">On Campus:</span> {pl.onCampus ? "Yes" : "No"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">CTC:</span> {capitalize(pl.ctc)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">State:</span> {capitalize(pl.state)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">District:</span> {capitalize(pl.district)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Block:</span> {capitalize(pl.block)}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>,
    // Work Experience
    <div className="space-y-6" key="workexp">
      <div className="flex items-center gap-3 mb-2">
        <BriefcaseIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Work Experience</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.workExperiences && student.workExperiences.length > 0 ? student.workExperiences.map((we: any) => (
          <div key={we.id || we.employer} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(we.employer)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Role:</span> {capitalize(we.role)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Start Date:</span> {we.startDate ? new Date(we.startDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">End Date:</span> {we.endDate ? new Date(we.endDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">State:</span> {capitalize(we.state)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">District:</span> {capitalize(we.district)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Block:</span> {capitalize(we.block)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Responsibilities:</span> {capitalize(we.responsibilities)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">CTC:</span> {capitalize(we.ctc)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Certificate:</span> {renderFile(we.certificate, capitalize(we.certificateName))}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>,
    // Publications
    <div className="space-y-6" key="publications">
      <div className="flex items-center gap-3 mb-2">
        <BookOpenIcon className="h-7 w-7 text-indigo-600" />
        <h2 className="text-xl font-bold">Publications</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {student.publications && student.publications.length > 0 ? student.publications.map((pub: any) => (
          <div key={pub.id || pub.title} className="bg-gradient-to-br from-white to-indigo-50 border border-gray-200 rounded-xl shadow-md p-4 max-w-md w-full mx-auto flex flex-col gap-2 transition-transform hover:scale-[1.01] hover:shadow-lg duration-200">
            <div className="flex items-center gap-2 mb-1">
              <BookOpenIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-base font-bold text-indigo-700">{capitalize(pub.title)}</span>
            </div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Abstract:</span> <ExpandableText value={capitalize(pub.abstract)} /></div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Publisher:</span> {capitalize(pub.publisher)}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Published Date:</span> {pub.publishedDate ? new Date(pub.publishedDate).toLocaleDateString("en-GB") : "N/A"}</div>
            <div className="text-sm"><span className="font-semibold text-gray-600">Link:</span> {pub.link ? <a href={pub.link} className="text-indigo-600 underline" target="_blank">View</a> : "N/A"}</div>
          </div>
        )) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow">No Data Available</span>
          </div>
        )}
      </div>
    </div>
  ];

  return createPortal(
    <>
      {/* Toaster for notifications */}
      <Toaster position="top-right" />
      {/* Remark Required Modal */}
      {remarkRequiredModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-red-700">Remark Required</h2>
            <p className="mb-6 text-gray-700 text-center">Remark Is Required To Reject a Student.</p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              onClick={() => setRemarkRequiredModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">{confirmModal.action === 'verify' ? 'Approve Student' : 'Reject Student'}</h2>
            <p className="mb-6 text-gray-700 text-center">
              {confirmModal.action === 'verify'
                ? 'Are You Sure You Want To Approve This Student?'
                : 'Are You Sure You Want To Reject This Student?'}
            </p>
            <div className="flex gap-4 mt-2 w-full justify-center">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                onClick={handleConfirmProceed}
              >
                Yes, {confirmModal.action === 'verify' ? 'Approve' : 'Reject'}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={handleConfirmCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Main Modal */}
    <div className="fixed inset-0 z-50 flex flex-col bg-white p-0 m-0" onClick={handleOverlayClick}>
      <div
          className="flex-1 overflow-y-auto w-full h-full flex flex-col"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={handleContentClick}
      >
        <style>
          {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}
        </style>
          <div className="bg-white p-6 rounded-none shadow-md w-full h-full border border-black hide-scrollbar flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-3">
              <h3 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-indigo-600">Student</span> Details
            </h3>
            <div className="flex items-center gap-3">
              {(() => {
                if (student.isSubmitted === false) {
                  return (
                    <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-gray-300 text-gray-800 font-bold text-base shadow border border-gray-400 animate-bounce">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /></svg>
                      Not Submitted
                    </span>
                  );
                } else if (student.isVerified === true) {
                  return (
                    <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-green-500 text-white font-bold text-base shadow border border-green-700 animate-bounce">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                      Verified
                    </span>
                  );
                } else if (student.isVerified === false) {
                  return (
                    <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-red-500 text-white font-bold text-base shadow border border-red-700 animate-bounce">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      Rejected
                    </span>
                  );
                } else if (student.isVerified === null) {
                  return (
                    <span className="flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400 text-yellow-900 font-bold text-base shadow border border-yellow-600 animate-bounce">
                      <svg className="w-5 h-5 text-yellow-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /></svg>
                      Not Verified
                    </span>
                  );
                }
                return null;
              })()}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-600 text-3xl font-bold px-2 focus:outline-none"
                aria-label="Close"
            >
                &times;
              </button>
            </div>
          </div>
          {/* Status Label */}
          {/* (Removed old status label location here) */}
          {/* Approved by and Verified at info */}
          {student.isVerified === true && (
            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">Approved by:</span>
              <span className="text-indigo-700 font-semibold">{student.faculty?.name || 'Faculty'}</span>
              {student.faculty?.user?.email && (
                <span className="text-gray-500">({student.faculty.user.email})</span>
              )}
              {student.verifiedAt && (
                <span className="text-gray-400 ml-2">on {new Date(student.verifiedAt).toLocaleString()}</span>
              )}
            </div>
          )}
            {/* Tabs */}
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex flex-wrap gap-2 border-b mb-4 bg-white sticky top-0 z-10">
                {tabs.map((tab, idx) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-full font-semibold focus:outline-none transition-all duration-150 ${selected ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-indigo-100"}`
                    }
                  >
                    <tab.icon className="h-5 w-5" />
                    {capitalize(tab.name)}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                {tabContents.map((content, idx) => (
                  <Tab.Panel key={tabs[idx].name}>{content}</Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          {/* Modal Footer */}
            <div className="flex flex-col gap-2 border-t border-gray-300 pt-3 mt-4 sticky bottom-0 bg-white z-20">
              {mode === "view" && student?.isSubmitted && student?.isVerified === null && (
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter remark (required for rejection)"
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    disabled={actionLoading}
                  />
              <Button
                    onClick={() => handleConfirm("verify")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg border border-green-600"
                    disabled={actionLoading}
              >
                    {actionLoading ? "Processing..." : "Approve"}
              </Button>
            <Button
                    onClick={() => handleConfirm("reject")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg border border-red-600"
                    disabled={actionLoading}
            >
                    {actionLoading ? "Processing..." : "Reject"}
            </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Preview Modal for images and PDFs */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full max-h-[90vh] flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setPreviewUrl(null)}>&times;</button>
            {previewType === 'image' && (
              <img src={previewUrl} alt="Preview" className="max-h-[70vh] max-w-full rounded" />
            )}
            {previewType === 'pdf' && (
              <iframe src={previewUrl} title="PDF Preview" className="w-full h-[70vh] rounded border" />
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};