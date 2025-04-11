// File: components/hod/hodDetailsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export type HodDetails = {
  name: string;
  phoneNo?: string;
  adhaarNo?: string;
  // Include email from the related user object
  user?: {
    email?: string;
  };
};

export interface HodDetailsModalProps {
  hod: HodDetails;
  onClose: () => void;
  onSave: (updatedData: HodDetails) => Promise<void> | void;
}

const HodDetailsModal: React.FC<HodDetailsModalProps> = ({ hod, onClose, onSave }) => {
  const [formData, setFormData] = useState<HodDetails>(hod);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // When the hod prop changes, update the form data and reset edit mode.
  useEffect(() => {
    setFormData(hod);
    setIsEditing(false);
  }, [hod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(hod);
    setIsEditing(false);
    toast("Edits discarded", { icon: "🚫" });
  };

  const handleSave = async () => {
    // Basic client-side validation: ensure required fields are not empty.
    if (!formData.name || !formData.user?.email || !formData.phoneNo || !formData.adhaarNo) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await onSave(formData);
      toast.success("HOD details updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving HOD details:", error);
      toast.error(error.message || "Failed to update HOD details");
    }
  };
  console.log("onSave prop:", onSave);

  return (
    <AnimatePresence>
      {/** Modal overlay */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Close modal if clicking outside.
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside.
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">HOD Details</h2>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit HOD Details"
                >
                  <Edit size={20} />
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-red-700" title="Close">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black">Name</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter HOD name"
                />
              ) : (
                <p className="mt-1 text-gray-800">{formData.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  name="email"
                  value={formData.user?.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, user: { email: e.target.value } })
                  }
                  placeholder="Enter HOD email"
                />
              ) : (
                <p className="mt-1 text-gray-800">{formData.user?.email || "Not Provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Contact No</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo || ""}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              ) : (
                <p className="mt-1 text-gray-800">{formData.phoneNo || "Not Provided"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Aadhaar No</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="adhaarNo"
                  value={formData.adhaarNo || ""}
                  onChange={handleChange}
                  placeholder="Enter Aadhaar number"
                />
              ) : (
                <p className="mt-1 text-gray-800">{formData.adhaarNo || "Not Provided"}</p>
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
              <Button onClick={handleSave} className="w-24 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">
                Save
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HodDetailsModal;
