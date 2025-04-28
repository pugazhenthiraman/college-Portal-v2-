"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    setEditedStudent(student);
    setMode("view");
  }, [student]);

  if (!isOpen || !student) return null;

  // Overlay click will close the modal.
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  // Prevent clicks inside modal content from closing the modal.
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEditedStudent((prev: any) =>
        prev ? { ...prev, user: { ...prev.user, email: value } } : null
      );
    } else {
      setEditedStudent((prev: any) =>
        prev ? { ...prev, [name]: value } : null
      );
    }
  };

  const handleSave = () => {
    if (editedStudent) {
      onSave(editedStudent);
      onClose();
      setMode("view");
    }
  };

  const toggleEditMode = () => {
    setMode(mode === "view" ? "edit" : "view");
  };

  // In view mode, display all fields
  const renderViewMode = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "First Name", value: student.firstName },
        { label: "Middle Name", value: student.middleName },
        { label: "Last Name", value: student.lastName },
        { label: "Email", value: student.email || student.user?.email },
        { label: "Personal Email", value: student.personalEmailId },
        { label: "Roll No", value: student.rollNo },
        { label: "Department", value: student.departmentName },
        { label: "DOB", value: student.DOB ? new Date(student.DOB).toLocaleDateString("en-GB") : null },
        { label: "Phone No", value: student.phoneNo },
        { label: "Secondary Phone", value: student.secondaryPhoneNo },
        { label: "Country", value: student.country },
        { label: "District", value: student.district },
        { label: "State", value: student.state },
        { label: "Adhaar No", value: student.adhaarNo },
        { label: "Passport No", value: student.passportNo },
        { label: "Passport Expiry", value: student.passportExpiryDate ? new Date(student.passportExpiryDate).toLocaleDateString("en-GB") : null },
        { label: "Last Login", value: student.lastLogin ? new Date(student.lastLogin).toLocaleString() : null },
        { label: "Created At", value: student.createdAt ? new Date(student.createdAt).toLocaleString() : null },
      ].map((field, idx) => (
        <div key={idx} className="flex flex-col">
          <span className="font-bold text-black">{field.label}:</span>
          <span className="text-black">{field.value || "N/A"}</span>
        </div>
      ))}
    </div>
  );

  // In edit mode, allow editing of updatable fields (excluding system-generated fields like Last Login and Created At).
  const renderEditMode = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* First Name */}
      <div>
        <label className="block text-sm font-bold text-black">First Name:</label>
        <input
          type="text"
          name="firstName"
          value={editedStudent?.firstName || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter first name"
          title="First Name"
        />
      </div>
      {/* Middle Name */}
      <div>
        <label className="block text-sm font-bold text-black">Middle Name:</label>
        <input
          type="text"
          name="middleName"
          value={editedStudent?.middleName || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter middle name"
          title="Middle Name"
        />
      </div>
      {/* Last Name */}
      <div>
        <label className="block text-sm font-bold text-black">Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={editedStudent?.lastName || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter last name"
          title="Last Name"
        />
      </div>
      {/* Email */}
      <div>
        <label className="block text-sm font-bold text-black">Email:</label>
        <input
          type="email"
          name="email"
          value={editedStudent?.email || editedStudent?.user?.email || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter email"
          title="Email"
        />
      </div>
      {/* Personal Email */}
      <div>
        <label className="block text-sm font-bold text-black">Personal Email:</label>
        <input
          type="email"
          name="personalEmailId"
          value={editedStudent?.personalEmailId || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter personal email"
          title="Personal Email"
        />
      </div>
      {/* Roll No */}
      <div>
        <label className="block text-sm font-bold text-black">Roll No:</label>
        <input
          type="text"
          name="rollNo"
          value={editedStudent?.rollNo || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter roll number"
          title="Roll Number"
        />
      </div>
      {/* Department */}
      <div>
        <label className="block text-sm font-bold text-black">Department:</label>
        <input
          type="text"
          name="departmentName"
          value={editedStudent?.departmentName || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter department name"
          title="Department"
        />
      </div>
      {/* DOB */}
      <div>
        <label className="block text-sm font-bold text-black">DOB:</label>
        <input
          type="date"
          name="DOB"
          value={editedStudent?.DOB ? new Date(editedStudent.DOB).toISOString().split("T")[0] : ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          title="Date of Birth"
        />
      </div>
      {/* Phone No */}
      <div>
        <label className="block text-sm font-bold text-black">Phone No:</label>
        <input
          type="text"
          name="phoneNo"
          value={editedStudent?.phoneNo || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter phone number"
          title="Phone Number"
        />
      </div>
      {/* Secondary Phone */}
      <div>
        <label className="block text-sm font-bold text-black">Secondary Phone:</label>
        <input
          type="text"
          name="secondaryPhoneNo"
          value={editedStudent?.secondaryPhoneNo || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter secondary phone"
          title="Secondary Phone"
        />
      </div>
      {/* Country */}
      <div>
        <label className="block text-sm font-bold text-black">Country:</label>
        <input
          type="text"
          name="country"
          value={editedStudent?.country || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter country"
          title="Country"
        />
      </div>
      {/* District */}
      <div>
        <label className="block text-sm font-bold text-black">District:</label>
        <input
          type="text"
          name="district"
          value={editedStudent?.district || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter district"
          title="District"
        />
      </div>
      {/* State */}
      <div>
        <label className="block text-sm font-bold text-black">State:</label>
        <input
          type="text"
          name="state"
          value={editedStudent?.state || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter state"
          title="State"
        />
      </div>
      {/* Additional fields for editing */}
      <div>
        <label className="block text-sm font-bold text-black">Adhaar No:</label>
        <input
          type="text"
          name="adhaarNo"
          value={editedStudent?.adhaarNo || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter adhaar number"
          title="Adhaar No"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-black">Passport No:</label>
        <input
          type="text"
          name="passportNo"
          value={editedStudent?.passportNo || ""}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter passport number"
          title="Passport No"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-black">Passport Expiry:</label>
        <input
          type="date"
          name="passportExpiryDate"
          value={
            editedStudent?.passportExpiryDate
              ? new Date(editedStudent.passportExpiryDate).toISOString().split("T")[0]
              : ""
          }
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          title="Passport Expiry"
        />
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleOverlayClick}>
      <div
        className="m-4 max-h-[70vh] overflow-y-auto rounded-xl"
        style={{
          scrollbarWidth: "none",        // Firefox
          msOverflowStyle: "none",       // IE 10+
        }}
        onClick={handleContentClick}
      >
        <style>
          {`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl border border-black hide-scrollbar">
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-3">
            <h3 className="text-3xl font-bold">
              <span className="text-indigo-600">Student</span> Details
            </h3>
            <Button
              onClick={toggleEditMode}
              className="bg-red-500 hover:bg-red-800 text-white px-4 py-2 rounded-lg border border-red-400"
            >
              {mode === "view" ? "Edit" : "Cancel"}
            </Button>
          </div>
          {/* Modal Content */}
          <div className="py-6">
            {mode === "view" ? renderViewMode() : renderEditMode()}
          </div>
          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 border-t border-gray-300 pt-3">
            {mode === "edit" && (
              <Button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg border border-green-500"
              >
                Save Changes
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg border border-red-500"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
