"use client";

import React, { useState } from "react";

export type DepartmentDropdownProps = {
  departments: string[];
  draftSelected: string[];
  savedSelected: string[];
  onAdd: (department: string) => void;
  onDraftRemove: (department: string) => void;
  onSave: () => void;
  onClose: () => void;
};

const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({
  departments,
  draftSelected,
  savedSelected,
  onAdd,
  onDraftRemove,
  onSave,
  onClose,
}) => {
  // Fixed option for custom entry
  const customOption = "Other";

  // Combine already selected departments from draft and saved lists
  const alreadySelected = [...draftSelected, ...savedSelected];

  // Filter available departments (exclude those already selected)
  const availableDepartments = departments.filter(
    (dept) => !alreadySelected.includes(dept)
  );

  // Always include the "Other" option if not already selected
  const finalAvailableOptions = [...availableDepartments];
  if (!alreadySelected.includes(customOption)) {
    finalAvailableOptions.push(customOption);
  }

  // Disable save button if no department is selected in draft
  const isSaveDisabled = draftSelected.length === 0;

  // Local state for custom "Other" modal
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [customDeptName, setCustomDeptName] = useState("");

  const openOtherModal = () => {
    setCustomDeptName("");
    setShowOtherModal(true);
  };

  const closeOtherModal = () => {
    setShowOtherModal(false);
    setCustomDeptName("");
  };

  const handleOtherSave = () => {
    if (customDeptName.trim()) {
      onAdd(customDeptName.trim());
      closeOtherModal();
    }
  };

  return (
    <div className="bg-white border rounded shadow-md p-4 w-full md:w-96 min-h-[300px] transition-all duration-300">
      {finalAvailableOptions.length > 0 ? (
        <ul className="max-h-80 overflow-y-auto">
          {finalAvailableOptions.map((dept) => (
            <li
              key={dept}
              className="flex justify-between items-center py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
            >
              <span className="text-black">{dept}</span>
              {dept === customOption ? (
                <button
                  onClick={openOtherModal}
                  className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-transform transform hover:scale-110"
                >
                  +
                </button>
              ) : (
                <button
                  onClick={() => onAdd(dept)}
                  className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-transform transform hover:scale-110"
                >
                  +
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 my-2">
          No more departments available.
        </div>
      )}

      {/* Display selected draft items */}
      {draftSelected.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <span className="block mb-2 text-sm font-medium text-black">
            Selected Departments:
          </span>
          <div className="flex gap-2 flex-wrap">
            {draftSelected.map((dept) => (
              <div
                key={dept}
                className="flex items-center bg-gray-200 px-2 py-1 rounded"
              >
                <span className="text-sm text-black">{dept}</span>
                <button
                  onClick={() => onDraftRemove(dept)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="w-24 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaveDisabled}
          className={`w-24 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded transition-opacity ${
            isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save
        </button>
      </div>

      {/* Modal for entering custom department name */}
      {showOtherModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-black">
              Enter Department Name
            </h3>
            <input
              type="text"
              placeholder="Department Name"
              value={customDeptName}
              onChange={(e) => setCustomDeptName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeOtherModal}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleOtherSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDropdown;