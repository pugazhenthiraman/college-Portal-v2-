// File: components/hod/facultyDetailsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Define the FacultyDetails type that includes data from both User and Faculty
export interface FacultyDetails {
  id: number;
  name: string;
  email: string;
  contactNo: string;
  aadhaarNo: string;
}

interface FacultyDetailsModalProps {
  isOpen: boolean;
  faculty: FacultyDetails;
  onClose: () => void;
  onSave: (updatedFaculty: FacultyDetails) => Promise<void> | void;
}

const FacultyDetailsModal: React.FC<FacultyDetailsModalProps> = ({
  isOpen,
  faculty,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<FacultyDetails>(faculty);

  // When the modal opens or the faculty prop changes, update the form data.
  useEffect(() => {
    setFormData(faculty);
  }, [faculty]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // You can add additional validation here if needed.
    await onSave(formData);
    toast.success("Faculty details updated successfully!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Faculty Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <Input
              type="text"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aadhaar Number
            </label>
            <Input
              type="text"
              name="aadhaarNo"
              value={formData.aadhaarNo}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetailsModal;
