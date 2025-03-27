"use client";

import React, { useEffect, useState } from "react";
import ManageDepartmentButton from "../../../../components/department/manageDepartmentButton";
import DepartmentDropdown from "../../../../components/department/departmnetDropdown";
import DepartmentTable, { Department } from "../../../../components/department/departmentTabel";
import { departmentList } from "@/utils/departmentList";
import { useSession } from "next-auth/react";
import HodAssignmentModal, { HodData } from "../../../../components/department/hod/hodAssignmodel";
// Import HodDetailsModal from its dedicated file
import HodDetailsModal from "../../../../components/department/hod/hodModel";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import RemoveConfirmationModal from "@/components/department/removeConfirmationModel";



const DepartmentPage: React.FC = () => {
  const { data: session, status } = useSession();

  // State for departments and draft selections
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [draftSelected, setDraftSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [hodModalOpen, setHodModalOpen] = useState<boolean>(false);
  const [currentDepartmentForHOD, setCurrentDepartmentForHOD] = useState<Department | null>(null);
  const [removalModalOpen, setRemovalModalOpen] = useState<boolean>(false);
  const [removalAction, setRemovalAction] = useState<"all" | "hod" | null>(null);
  const [removalDepartment, setRemovalDepartment] = useState<Department | null>(null);

  // State for viewing HOD details in a modal
  const [hodDetailsModalOpen, setHodDetailsModalOpen] = useState(false);
  const [currentHodDetails, setCurrentHodDetails] = useState<Department["hod"] | null>(null);

  // Fetch departments from backend (which include HOD data)
  useEffect(() => {
    if (status === "loading" || !session) return;
    const user = session.user as {
      collegeType: "ENGINEERING" | "ARTS" | "MEDICAL";
      collegeId: number;
      id: string;
      email: string;
      role: string;
    };

    const fetchDepartments = async () => {
      try {
        const response = await fetch(`/api/college/dashboard?collegeId=${user.collegeId}`);
        const result = await response.json();
        if (response.ok && result.departments) {
          setSelectedDepartments(result.departments);
        } else {
          toast.error("Failed to load departments");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Error fetching departments");
      }
    };

    fetchDepartments();
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Please sign in.</p>;

  const user = session.user as {
    collegeType: "ENGINEERING" | "ARTS" | "MEDICAL";
    collegeId: number;
    id: string;
    email: string;
    role: string;
  };

  // Options for the dropdown based on college type
  const departmentsList = departmentList[user.collegeType];

  // Handlers for draft management
  const handleAdd = (deptName: string) => {
    setDraftSelected((prev) => [...prev, deptName]);
  };

  const handleDraftRemove = (deptName: string) => {
    setDraftSelected((prev) => prev.filter((d) => d !== deptName));
  };

  const handleSaveDepartments = async () => {
    try {
      const response = await fetch("/api/college/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: user.collegeId,
          departments: draftSelected,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Departments saved successfully!");
        setSelectedDepartments((prev) => [...prev, ...result.departments]);
        setDraftSelected([]);
        setDropdownOpen(false);
      } else {
        toast.error(result.error || "Failed to save departments");
      }
    } catch (error) {
      console.error("Error saving departments:", error);
      toast.error("Error saving departments");
    }
  };

  // Handler for opening removal modal
  const handleOpenRemovalModal = (dept: Department, action: "all" | "hod") => {
    setRemovalDepartment(dept);
    setRemovalAction(action);
    setRemovalModalOpen(true);
  };

  const handleConfirmRemoval = async (password: string, action: "all" | "hod") => {
    if (!removalDepartment) return;
    try {
      const response = await fetch("/api/college/dashboard/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: user.collegeId,
          departmentId: removalDepartment.id,
          action: removalAction,
          password,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(
          action === "all"
            ? `Department ${removalDepartment.name} removed successfully!`
            : `HOD removed for ${removalDepartment.name}`
        );
        if (action === "all") {
          setSelectedDepartments((prev) =>
            prev.filter((dept) => dept.id !== removalDepartment.id)
          );
        } else if (action === "hod") {
          const refreshedResponse = await fetch(`/api/college/dashboard?collegeId=${user.collegeId}`);
          const refreshedResult = await refreshedResponse.json();
          if (refreshedResponse.ok) {
            setSelectedDepartments(refreshedResult.departments);
          }
        }
      } else {
        toast.error(result.error || "Failed to remove data");
      }
    } catch (error) {
      console.error("Error during removal:", error);
      toast.error("Error during removal");
    } finally {
      setRemovalModalOpen(false);
      setRemovalDepartment(null);
      setRemovalAction(null);
    }
  };

  // Handler for opening HOD assignment modal
  const handleAddHOD = (dept: Department) => {
    setCurrentDepartmentForHOD(dept);
    setHodModalOpen(true);
  };

  const handleHODSave = async (hodData: HodData) => {
    try {
      const response = await fetch("/api/college/dashboard/hod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: user.collegeId,
          departmentId: currentDepartmentForHOD?.id,
          ...hodData,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(`HOD assigned for ${currentDepartmentForHOD?.name}`);
        setHodModalOpen(false);
      } else {
        toast.error(result.error || "Failed to assign HOD");
      }
    } catch (error) {
      console.error("Error assigning HOD:", error);
      toast.error("Error assigning HOD");
    }
  };

  // Handler for viewing HOD details in a modal
  const handleViewHODDetails = (dept: Department) => {
    if (dept.hod) {
      console.log("Opening HOD details modal for:", dept.hod.name);
      setCurrentHodDetails(dept.hod);
      setHodDetailsModalOpen(true);
    }
  };

  return (
    <div className="p-6 mt-24">
      <Toaster position="top-right" />
      <div className="flex gap-6">
        {/* Left: Department management with dropdown */}
        <div className="w-1/3 relative">
          <ManageDepartmentButton onClick={() => setDropdownOpen(!dropdownOpen)} />
          {dropdownOpen && (
            <DepartmentDropdown
              departments={departmentsList}
              draftSelected={draftSelected}
              savedSelected={selectedDepartments.map((dept) => dept.name)}
              onAdd={handleAdd}
              onDraftRemove={handleDraftRemove}
              onSave={handleSaveDepartments}
              onClose={() => {
                setDraftSelected([]);
                setDropdownOpen(false);
              }}
            />
          )}
        </div>
        {/* Right: Department Table */}
        <div className="w-2/3">
          <DepartmentTable
            selectedDepartments={selectedDepartments}
            onRemove={(dept: Department) => handleOpenRemovalModal(dept, "all")}
            onAddHOD={(dept: Department) => handleAddHOD(dept)}
            onViewHODDetails={handleViewHODDetails}
          />
        </div>
      </div>
      {/* HOD Assignment Modal */}
      <HodAssignmentModal
        isOpen={hodModalOpen}
        department={currentDepartmentForHOD ? currentDepartmentForHOD.name : ""}
        onClose={() => {
          setHodModalOpen(false);
          setCurrentDepartmentForHOD(null);
        }}
        onSave={handleHODSave}
      />
      {/* Removal Confirmation Modal */}
      {removalDepartment && removalAction && (
        <RemoveConfirmationModal
          isOpen={removalModalOpen}
          department={removalDepartment}
          onConfirm={handleConfirmRemoval}
          onCancel={() => {
            setRemovalModalOpen(false);
            setRemovalDepartment(null);
            setRemovalAction(null);
          }}
        />
      )}
      {/* HOD Details Modal */}
      {hodDetailsModalOpen && currentHodDetails && (
        <HodDetailsModal
          hod={currentHodDetails}
          onClose={() => setHodDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DepartmentPage;
