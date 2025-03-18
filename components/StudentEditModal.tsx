"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";


interface Student {
    name : string,
    personalEmail : string,
    DOB : string,
    phoneNo : string


}
type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (updatedStudent: Student) => void;
};

export function StudentEditModal({ isOpen, onClose, student, onSave }: Props) {
  const [editedStudent, setEditedStudent] = useState<Student | null>(student);

  if (!student) return null; // Don't render if no student is selected

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = () => {
    if (editedStudent) {
      onSave(editedStudent);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Details">
      <div className="p-4 bg-white rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">
          Edit Student Information
        </h3>

        <div className="grid grid-cols-1 gap-4 text-gray-600">
          <label className="block">
            Name:
            <input
              type="text"
              name="name"
              value={student?.name || ""}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>

          <label className="block">
            Email:
            <input
              type="email"
              name="email"
              value={student?.personalEmail || ""}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>

          <label className="block">
            DOB:
            <input
              type="date"
              name="DOB"
              value={student?.DOB ? new Date(student.DOB).toISOString().split("T")[0] : ""}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>

          <label className="block">
            Phone No:
            <input
              type="text"
              name="phoneNo"
              value={student?.phoneNo || ""}
              onChange={handleInputChange}
              className="w-full mt-1 p-2 border rounded-md"
            />
          </label>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
