"use client";

import React from "react";

type DepartmentDropdownProps = {
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
  // Combine already selected departments from draft and saved lists
  const alreadySelected = [...draftSelected, ...savedSelected];
  // Filter available departments so that selected ones don't appear again
  const availableDepartments = departments.filter(
    (dept) => !alreadySelected.includes(dept)
  );

  // Disable save button if no department is selected in draft
  const isSaveDisabled = draftSelected.length === 0;

  return (
    <div className="bg-white border rounded shadow-md p-4 w-full md:w-96 min-h-[300px] transition-all duration-300">
      {availableDepartments.length > 0 ? (
        <ul className="max-h-60 overflow-y-auto scrollbar-hide">
          {availableDepartments.map((dept) => (
            <li
              key={dept}
              className="flex justify-between items-center py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
            >
              <span>{dept}</span>
              <button
                onClick={() => onAdd(dept)}
                className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-transform transform hover:scale-110"
              >
                +
              </button>
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
          <span className="block mb-2 text-sm font-medium">
            Selected Departments:
          </span>
          <div className="flex gap-2 flex-wrap">
            {draftSelected.map((dept) => (
              <div
                key={dept}
                className="flex items-center bg-gray-200 px-2 py-1 rounded"
              >
                <span className="text-sm">{dept}</span>
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
    </div>
  );
};

export default DepartmentDropdown;
