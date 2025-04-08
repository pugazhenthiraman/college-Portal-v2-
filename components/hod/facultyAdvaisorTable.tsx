"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

// Type definition for a faculty advisor as expected by this table.
export type FacultyAdvisor = {
  aadhaarNo: string;
  contactNo: string;
  email: string;
  id: number;
  name: string;
  totalStudents: number;
  // If you need additional fields (e.g., email, contactNo, aadhaarNo) for other views/editing,
  // you can extend this type accordingly.
};

type FacultyAdvisorTableProps = {
  advisors: FacultyAdvisor[];
  onRemove: (advisor: FacultyAdvisor) => void;
  onViewDetails: (advisor: FacultyAdvisor) => void;
};

const FacultyAdvisorTable: React.FC<FacultyAdvisorTableProps> = ({
  advisors,
  onRemove,
  onViewDetails,
}) => {
  return (
    <table className="min-w-full border border-gray-200">
      <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase">
        <tr>
          <th className="py-2 px-4 border w-[50%] text-left">Faculty Name</th>
          <th className="py-2 px-4 border w-[20%] text-center">Total Students</th>
          <th className="py-2 px-4 border w-[30%] text-center">Action</th>
        </tr>
      </thead>
      <tbody>
      {advisors.length > 0 ? (
  advisors
    .filter((advisor): advisor is typeof advisor => advisor !== null && advisor !== undefined)
    .map((advisor, index) => (
      <motion.tr
        key={advisor.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="hover:bg-gray-50 transition-colors"
      >
        <td className="py-2 px-4 border flex items-center space-x-2">
          <span>{advisor.name}</span>
          <button
            onClick={() => onViewDetails(advisor)}
            title="View Faculty Info"
            className="text-blue-500 hover:text-blue-700"
          >
            <Info className="w-5 h-5" strokeWidth={2} />
          </button>
        </td>
        <td className="py-2 px-4 border text-center">{advisor.totalStudents}</td>
        <td className="py-2 px-4 border text-center">
          <button
            onClick={() => onRemove(advisor)}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </td>
      </motion.tr>
    ))
) : (
  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <td className="py-2 px-4 border text-center" colSpan={3}>
      No faculty advisors found.
    </td>
  </motion.tr>
)}

      </tbody>
    </table>
  );
};

export default FacultyAdvisorTable;
