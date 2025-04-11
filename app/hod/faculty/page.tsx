"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import FacultyAdvisorForm, { FacultyAdvisorFormData } from "@/components/hod/facultyAdvaisorModel";
import FacultyAdvisorTable, { FacultyAdvisor } from "@/components/hod/facultyAdvaisorTable";
import FacultyRemoveConfirmationModal from "@/components/hod/removeconfiramationModel";
import FacultyViewModal, { FacultyViewData } from "@/components/hod/facultyViewModal";
import toast from "react-hot-toast";

export default function FacultyAdvisorPage() {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [advisors, setAdvisors] = useState<FacultyAdvisor[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<FacultyAdvisor | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  // Fetch HOD context (collegeId, departmentId)
  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch("/api/hod/faculty");
        const data = await res.json();
        console.log("res: ", data);
        if (data) {
          setCollegeId(data.college.id);
          setDepartmentId(data.department.id);
        } else {
          toast.error("Failed to fetch HOD context");
        }
      } catch (err) {
        console.error("Error fetching HOD context", err);
        toast.error("Error fetching context");
      }
    }
    fetchContext();
  }, []);

  // Fetch existing faculty advisors
  useEffect(() => {
    async function fetchAdvisors() {
      if (!departmentId) return;
      try {
        const res = await fetch(`/api/hod/faculty/all?departmentId=${departmentId}`);
        const data = await res.json();
        console.log("data: ", data);
        if (data.facultyAdvisors) {
          setAdvisors(data.facultyAdvisors);
        } else {
          toast.error(data.error || "Failed to fetch faculty advisors");
        }
      } catch (error: any) {
        console.error("Error fetching advisors:", error);
        toast.error("Error fetching faculty advisors");
      }
    }
    fetchAdvisors();
  }, [departmentId]);

  const handleAdvisorSubmit = async (advisorData: FacultyAdvisorFormData) => {
    console.log("Submitting advisor data:", advisorData);
    try {
      const res = await fetch("/api/hod/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advisorData),
      });
      const data = await res.json();
      console.log("data: ", data);
      if (data) {
        setAdvisors((prev) => [...prev, data.faculty]);
        toast.success("Faculty advisor created successfully!");
        setIsFormOpen(false);
      } else {
        toast.error(data.error || "Failed to create faculty advisor");
      }
    } catch (error: any) {
      console.error("Error creating faculty advisor:", error);
      toast.error("Error creating faculty advisor");
    }
  };

  const handleRemoveClick = (advisor: FacultyAdvisor) => {
    console.log("Removing advisor:", advisor);
    setSelectedAdvisor(advisor);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async (password: string) => {
    if (!selectedAdvisor) return;
    try {
      const res = await fetch(`/api/hod/faculty/delete?facultyAdvisor=${selectedAdvisor.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      console.log("removed: ", data);
      if (res.ok) {
        setAdvisors((prev) => prev.filter((a) => a.id !== selectedAdvisor.id));
        toast.success("Faculty advisor removed successfully!");
      } else {
        toast.error(data.error || "Failed to remove faculty advisor");
      }
    } catch (error: any) {
      console.error("Error removing faculty advisor:", error);
      toast.error("Error removing faculty advisor");
    } finally {
      setIsRemoveModalOpen(false);
      setSelectedAdvisor(null);
    }
  };

  const handleViewDetails = (advisor: FacultyAdvisor) => {
    setSelectedAdvisor(advisor);
    setIsViewModalOpen(true);
  };

  const handleSaveFacultyChanges = async (updatedData: FacultyViewData) => {
    console.log("Saving faculty changes:", updatedData);
    if (!selectedAdvisor) return;
    try {
      const res = await fetch(`/api/hod/faculty/${selectedAdvisor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.faculty) {
        setAdvisors((prev) =>
          prev.map((advisor) =>
            advisor.id === selectedAdvisor.id ? data.faculty : advisor
          )
        );
        toast.success("Faculty advisor updated successfully!");
        setIsViewModalOpen(false);
        setSelectedAdvisor(null);
      } else {
        toast.error(data.error || "Failed to update faculty advisor");
      }
    } catch (error: any) {
      console.error("Error updating faculty advisor:", error);
      toast.error("Error updating faculty advisor");
    }
  };

  useEffect(() => {
    console.log("Advisors:", selectedAdvisor);
  }, [selectedAdvisor]);

  return (
    <div className="container mx-auto px-6 pt-28">
      <Toaster position="top-right" />

      {/* Place the button and table within a horizontal flex container */}
      <div className="flex justify-end items-center h-10 gap-[10vw] ml-[150px]">

        {/* Button on the left */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-transform transform hover:scale-105 text-white font-bold py-4 px-12 whitespace-nowrap rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Create Faculty Advisor"
        >
          Create Faculty Advisor
          <svg
            className="w-5 h-5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Table on the right (renders only if there are advisors) */}
        {advisors.length > 0 && (
          <div className="flex-grow flex justify-center">
            <FacultyAdvisorTable
              advisors={advisors}
              onRemove={handleRemoveClick}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && collegeId !== null && departmentId !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <FacultyAdvisorForm
                onSubmit={handleAdvisorSubmit}
                onCancel={() => setIsFormOpen(false)}
                collegeId={collegeId}
                departmentId={departmentId}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedAdvisor && (
        <FacultyRemoveConfirmationModal
          isOpen={isRemoveModalOpen}
          advisor={selectedAdvisor}
          onConfirm={handleConfirmRemove}
          onCancel={() => setIsRemoveModalOpen(false)}
        />
      )}

      {selectedAdvisor && isViewModalOpen && (
        <FacultyViewModal
          isOpen={isViewModalOpen}
          faculty={{
            name: selectedAdvisor.name,
            email: selectedAdvisor.email,
            contactNo: selectedAdvisor.contactNo,
            aadhaarNo: selectedAdvisor.aadhaarNo,
          }}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedAdvisor(null);
          }}
          onSave={handleSaveFacultyChanges}
        />
      )}
    </div>
  );
}
