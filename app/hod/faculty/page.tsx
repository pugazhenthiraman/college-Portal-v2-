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
        if (res.ok) {
          setCollegeId(data.collegeId);
          setDepartmentId(data.departmentId);
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
      try {
        const res = await fetch("/api/hod/faculty");
        const data = await res.json();
        if (res.ok && data.faculty) {
          setAdvisors(data.faculty);
        } else {
          toast.error(data.error || "Failed to fetch faculty advisors");
        }
      } catch (error: any) {
        console.error("Error fetching advisors:", error);
        toast.error("Error fetching faculty advisors");
      }
    }
    fetchAdvisors();
  }, []);

  const handleAdvisorSubmit = async (advisorData: FacultyAdvisorFormData) => {
    console.log("Submitting advisor data:", advisorData);
    try {
      const res = await fetch("/api/hod/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advisorData),
      });
      const data = await res.json();
      if (res.ok && data.faculty) {
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
    setSelectedAdvisor(advisor);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async (password: string) => {
    if (!selectedAdvisor) return;
    try {
      const res = await fetch(`/api/hod/faculty/${selectedAdvisor.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
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
    if (!selectedAdvisor) return;
    try {
      const res = await fetch(`/api/hod/faculty/${selectedAdvisor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (res.ok && data.updatedFaculty) {
        setAdvisors((prev) =>
          prev.map((advisor) =>
            advisor.id === selectedAdvisor.id ? data.updatedFaculty : advisor
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

  return (
    <div className="container mx-auto px-6 pt-28">
      <Toaster position="top-right" />

      <div className="flex flex-row gap-6">
        <div className="w-1/3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
            aria-label="Create Faculty Advisor"
          >
            Create Faculty Advisor
          </button>

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
        </div>

        <div className="w-2/3 flex justify-end">
          <div className="w-full max-w-lg">
            <FacultyAdvisorTable
              advisors={advisors}
              onRemove={handleRemoveClick}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>

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
