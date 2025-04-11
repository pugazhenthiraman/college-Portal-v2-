"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export type FacultyViewData = {
  name: string;
  email: string;
  contactNo: string;
  aadhaarNo: string;
};

export interface FacultyViewModalProps {
  isOpen: boolean;
  faculty: FacultyViewData;
  onClose: () => void;
  onSave: (updatedData: FacultyViewData) => Promise<void> | void;
}

const FacultyViewModal: React.FC<FacultyViewModalProps> = ({
  isOpen,
  faculty,
  onClose,
  onSave,
}) => {
  // Local state for form data and edit mode
  const [formData, setFormData] = useState<FacultyViewData>(faculty);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // When faculty prop changes, update local formData and reset edit mode.
  useEffect(() => {
    setFormData(faculty);
    setIsEditing(false);
  }, [faculty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Discard changes by resetting formData to the initial faculty prop.
    setFormData(faculty);
    setIsEditing(false);
    toast("Changes discarded", { icon: "🚫" });
  };

  const handleSave = async () => {
    // Basic client-side check: ensure fields are not empty.
    if (!formData.name || !formData.email || !formData.contactNo || !formData.aadhaarNo) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await onSave(formData);
      toast.success("Faculty details updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving faculty details:", error);
      toast.error(error.message || "Failed to update faculty details");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal if clicking outside.
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 text-black">
              <h2 className="text-xl font-bold">Faculty Details</h2>
              <div className="flex items-center gap-2">
                {/* Show Edit button only in view mode */}
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Faculty Details"
                  >
                    <Edit size={20} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-red-700"
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter faculty name"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter faculty email"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact No
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.contactNo}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aadhaar No
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="aadhaarNo"
                    value={formData.aadhaarNo}
                    onChange={handleChange}
                    placeholder="Enter Aadhaar number"
                  />
                ) : (
                  <p className="mt-1 text-gray-800">{formData.aadhaarNo}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  onClick={handleCancelEdit}
                  className="w-24 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="w-24 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
                >
                  Save
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FacultyViewModal;
