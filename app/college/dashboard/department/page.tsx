"use client";

import React, { useState, useEffect } from "react";
import ManageDepartmentButton from "../../../../components/department/manageDepartmentButton";
import DepartmentDropdown from "../../../../components/department/departmnetDropdown";
import DepartmentTable, { Department } from "../../../../components/department/departmentTabel";
import { departmentList } from "@/utils/departmentList";
import { useSession } from "next-auth/react";
import HodAssignmentModal, { HodData } from "../../../../components/department/hod/hodAssignmodel";
import HodDetailsModal, { HodDetails } from "../../../../components/department/hod/hodModel";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import RemoveConfirmationModal from "@/components/department/removeConfirmationModel";

/**
 * Adjust these types to your actual data shape if needed.
 * Department["hod"] is presumably the shape returned by your Prisma query.
 */
const DepartmentPage: React.FC = () => {
  const { data: session, status } = useSession();

  // State for departments and draft selections
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [draftSelected, setDraftSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [hodModalOpen, setHodModalOpen] = useState<boolean>(false);
  const [currentDepartmentForHOD, setCurrentDepartmentForHOD] = useState<Department | null>(null);
  const [removalModalOpen, setRemovalModalOpen] = useState<boolean>(false);
  const [removalDepartment, setRemovalDepartment] = useState<Department | null>(null);

  // State for viewing HOD details in a modal
  const [hodDetailsModalOpen, setHodDetailsModalOpen] = useState(false);
  const [currentHodDetails, setCurrentHodDetails] = useState<Department["hod"] | null>(null);

  // Fetch departments (which include HOD data) from the backend
  useEffect(() => {
    if (status === "loading" || !session) return;
    const user = session.user as {
      collegeType: "ENGINEERING" | "ARTS" | "MEDICAL";
      collegeId: number;
      id: string;
      email: string;
      role: string;
      departmentType: string;
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
    collegeType: "ENGINEERING" | "ARTS";
    collegeId: number;
    id: string;
    email: string;
    role: string;
    departmentType: string;
  };

  // Example: "BE,ME" -> ["BE", "ME"]
  const departmentTypes = user.departmentType.split(",");
  // Merge all department lists for those types
  const departmentsList = departmentTypes
    .map((type) => departmentList[type.trim()])
    .flat();

  // Handlers for draft management
  const handleAdd = (deptName: string) => setDraftSelected((prev) => [...prev, deptName]);
  const handleDraftRemove = (deptName: string) =>
    setDraftSelected((prev) => prev.filter((d) => d !== deptName));

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

  // Removal modal handler
  const handleOpenRemovalModal = (dept: Department) => {
    setRemovalDepartment(dept);
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
          action, // "all" or "hod"
          password,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        if (action === "all") {
          // Remove entire department row from state
          setSelectedDepartments((prev) =>
            prev.filter((dept) => dept.id !== removalDepartment.id)
          );
        } else if (action === "hod") {
          // Only remove the HOD details; update department's hod field to null
          setSelectedDepartments((prev) =>
            prev.map((dept) =>
              dept.id === removalDepartment.id ? { ...dept, hod: null } : dept
            )
          );
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
        // Update department's HOD details in state
        setSelectedDepartments((prev) =>
          prev.map((dept) =>
            dept.id === currentDepartmentForHOD?.id ? { ...dept, hod: result.hod } : dept
          )
        );
        setHodModalOpen(false);
      } else {
        toast.error(result.error || "Failed to assign HOD");
      }
    } catch (error) {
      console.error("Error assigning HOD:", error);
      toast.error("Error assigning HOD");
    }
  };

  // Handler for viewing HOD details
  const handleViewHODDetails = (dept: Department) => {
    if (dept.hod) {
      console.log("Opening HOD details modal for:", dept.hod.name);
      setCurrentHodDetails(dept.hod);
      setHodDetailsModalOpen(true);
    }
  };

  // Now we actually persist changes to the backend with a PUT request
  const handleUpdateHodDetails = async (updatedData: HodDetails) => {
    console.log("Updating HOD details (frontend) ->", updatedData);

    // Make sure we have the required fields to match your PUT schema:
    // { collegeId, departmentId, name, email, password?, contactNo?, aadhaarNo? }
    // Adjust these fields as needed to match your actual schema.
    try {
      const response = await fetch("/api/college/dashboard/hod", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Values required by your assignmentSchema
          collegeId: user.collegeId, // from session
          departmentId: currentHodDetails?.departmentId, // assuming dept ID is stored in HOD record
          name: updatedData.name,
          email: updatedData.user?.email,
          // password: "optionally pass if needed", 
          contactNo: updatedData.phoneNo, // your backend calls it contactNo
          aadhaarNo: updatedData.adhaarNo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("HOD updated from API:", result);

        // Update local state with new data
        setSelectedDepartments((prev) =>
          prev.map((dept) => {
            if (dept.hod?.id === result.hod.id) {
              return { ...dept, hod: result.hod };
            }
            return dept;
          })
        );
        toast.success("HOD details updated successfully (DB)!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update HOD details");
      }
    } catch (error: any) {
      console.error("Error updating HOD details:", error);
      toast.error(error.message || "Failed to update HOD details");
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
            onRemove={(dept: Department) => handleOpenRemovalModal(dept)}
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
      {removalDepartment && (
        <RemoveConfirmationModal
          isOpen={removalModalOpen}
          department={removalDepartment}
          onConfirm={handleConfirmRemoval}
          onCancel={() => {
            setRemovalModalOpen(false);
            setRemovalDepartment(null);
          }}
        />
      )}
      {/* HOD Details Modal */}
      {hodDetailsModalOpen && currentHodDetails && (
        <HodDetailsModal
          hod={currentHodDetails}
          onClose={() => setHodDetailsModalOpen(false)}
          onSave={handleUpdateHodDetails}
        />
      )}
    </div>
  );
};

export default DepartmentPage;
