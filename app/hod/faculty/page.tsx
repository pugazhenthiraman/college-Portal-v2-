// File: app/hod/faculty/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import FacultyAdvisorForm, { FacultyAdvisorFormData } from "@/components/hod/facultyAdvaisorModel";
import FacultyAdvisorTable, { FacultyAdvisor } from "@/components/hod/facultyAdvaisorTable";
import FacultyRemoveConfirmationModal from "@/components/hod/removeconfiramationModel";
import toast from "react-hot-toast";

export default function FacultyAdvisorPage() {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [advisors, setAdvisors] = useState<FacultyAdvisor[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<FacultyAdvisor | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

  // Fetch existing advisors from the backend on mount.
  useEffect(() => {
    async function fetchAdvisors() {
      try {
        const res = await fetch("/api/hod/faculty");
        const data = await res.json();
                console.log("Data from /api/hod/faculty:", data.faculty);

        if (res.ok && data.faculty) {
          setAdvisors(data.faculty);
        } else {
          const errMsg = data.error || "Failed to fetch faculty advisors";
          toast.error(errMsg);
          console.error("Fetch advisors error:", errMsg);
        }
      } catch (error: any) {
        console.error("Error fetching advisors:", error);
        toast.error("Error fetching faculty advisors");
      }
    }
    fetchAdvisors();
  }, []);

  // Handler for creating a new Faculty Advisor.
  const handleAdvisorSubmit = async (advisorData: FacultyAdvisorFormData) => {
    console.log("Submitting advisor data:", advisorData);
    try {
      const res = await fetch("/api/hod/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advisorData),
      });
      const data = await res.json();
      if (res.ok && data.facultyAdvisor) {
        setAdvisors((prev) => [...prev, data.facultyAdvisor]);
        toast.success("Faculty advisor created successfully!");
        setIsFormOpen(false);
      } else {
        const errMsg = data.error || "Failed to create faculty advisor";
        toast.error(errMsg);
        console.error("Error creating faculty advisor:", errMsg);
      }
    } catch (error: any) {
      console.error("Error creating faculty advisor:", error);
      toast.error("Error creating faculty advisor");
    }
  };

  // Open the removal confirmation modal.
  const handleRemoveClick = (advisor: FacultyAdvisor) => {
    setSelectedAdvisor(advisor);
    setIsRemoveModalOpen(true);
  };

  // Handler for confirming advisor removal.
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
        const errMsg = data.error || "Failed to remove faculty advisor";
        toast.error(errMsg);
        console.error("Error removing faculty advisor:", errMsg);
      }
    } catch (error: any) {
      console.error("Error removing faculty advisor:", error);
      toast.error("Error removing faculty advisor");
    } finally {
      setIsRemoveModalOpen(false);
      setSelectedAdvisor(null);
    }
  };

  // Handler for viewing advisor details (for future expansion).
  const handleViewDetails = (advisor: FacultyAdvisor) => {
    console.log("View details for:", advisor);
    // Optionally, you can open a modal to display and edit advisor details.
  };

  return (
    <div className="container mx-auto px-6 pt-28">
      <Toaster position="top-right" />

      <div className="flex flex-row gap-6">
        {/* Left Column: Create Advisor Button & Form */}
        <div className="w-1/3">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
            aria-label="Create Faculty Advisor"
          >
            Create Faculty Advisor
          </button>

          {isFormOpen && (
            <div className="mt-4 border border-black bg-white rounded-lg p-6">
              <FacultyAdvisorForm
                onSubmit={handleAdvisorSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Right Column: Faculty Advisor Table */}
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

      {/* Faculty Removal Confirmation Modal */}
      {selectedAdvisor && (
        <FacultyRemoveConfirmationModal
          isOpen={isRemoveModalOpen}
          advisor={selectedAdvisor}
          onConfirm={handleConfirmRemove}
          onCancel={() => setIsRemoveModalOpen(false)}
        />
      )}
    </div>
  );
}
