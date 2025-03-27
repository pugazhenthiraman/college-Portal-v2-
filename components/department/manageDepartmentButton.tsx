"use client";

import React from "react";

type ManageDepartmentButtonProps = {
  onClick: () => void;
};

const ManageDepartmentButton: React.FC<ManageDepartmentButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-transform transform hover:scale-105 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Manage Department
      <svg
        className="w-5 h-5 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export default ManageDepartmentButton;

