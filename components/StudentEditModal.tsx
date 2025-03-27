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

export const StudentEditModal = ({ isOpen, onClose, student, onSave }: Props) => {
  const [editedStudent, setEditedStudent] = useState<any | null>(student);

  useEffect(() => {
    setEditedStudent(student);
  }, [student]);

  if (!isOpen || !student) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For the email field, update nested user.email if it exists
    if (name === "email") {
      setEditedStudent((prev: { user: any; }) =>
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
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Outer container with margin, reduced max height, and hidden scrollbar */}
      <div
        className="m-4 max-h-[70vh] overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style jsx>{`
          ::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md border border-indigo-600">
          {/* Modal Header */}
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-xl">
            <h3 className="text-lg font-semibold">Edit Student Details</h3>
          </div>
          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 text-gray-700">
              <label className="block">
                Name:
                <input
                  type="text"
                  name="name"
                  value={editedStudent?.name || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Email:
                <input
                  type="email"
                  name="email"
                  value={editedStudent?.user?.email || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Roll No:
                <input
                  type="text"
                  name="rollNo"
                  value={editedStudent?.rollNo || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Personal Email:
                <input
                  type="email"
                  name="personalEmail"
                  value={editedStudent?.personalEmail || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                DOB:
                <input
                  type="date"
                  name="DOB"
                  value={
                    editedStudent?.DOB
                      ? new Date(editedStudent.DOB).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Phone No:
                <input
                  type="text"
                  name="phoneNo"
                  value={editedStudent?.phoneNo || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Nationality:
                <input
                  type="text"
                  name="nationality"
                  value={editedStudent?.nationality || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
              <label className="block">
                Department Name:
                <input
                  type="text"
                  name="departmentName"
                  value={editedStudent?.departmentName || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </label>
            </div>
          </div>
          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
