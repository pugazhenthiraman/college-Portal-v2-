"use client";

import React from "react";
import { motion } from "framer-motion";

export type Student = {
  userId: number;
  firstName: string;
  lastName: string;
  user?: { email: string };
  personalEmailId: string;
  rollNo: string;
  facultyName?: string;
  DOB: string;
  phoneNo: string;
  isSubmitted: boolean;
  isVerified: boolean | null;
};

type StudentsTableProps = {
  students: Student[];
  columns: { key: string; label: string }[];
  onView: (student: Student) => void;
  sortColumn: string;
  sortDirection: string;
  onSort: (column: string) => void;
  showCheckbox?: boolean;
};

const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  columns,
  onView,
  sortColumn,
  sortDirection,
  onSort,
  showCheckbox = false,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg border p-5 w-full">
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full border-collapse table-auto text-sm">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase">
            <tr>
              {showCheckbox && (
                <motion.th
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 whitespace-nowrap"
                >
                  Select
                </motion.th>
              )}
              {columns.map(({ key, label }) => (
                <motion.th
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 cursor-pointer whitespace-nowrap"
                  onClick={() => onSort(key)}
                >
                  {label}{" "}
                  {sortColumn === key
                    ? sortDirection === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </motion.th>
              ))}
              <motion.th
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 whitespace-nowrap"
              >
                Status
              </motion.th>
              <motion.th
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="px-2 py-2 text-center font-semibold tracking-wide border-b border-blue-300 whitespace-nowrap"
              >
                Actions
              </motion.th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {students.length > 0 ? (
              students.map((student, index) => {
                let status = "Not Submitted";
                let badgeClass = "bg-gray-300 text-gray-800";
                if (student.isSubmitted) {
                  if (student.isVerified === null) {
                    status = "Pending";
                    badgeClass = "bg-yellow-200 text-yellow-800";
                  } else if (student.isVerified === true) {
                    status = "Verified";
                    badgeClass = "bg-green-200 text-green-800";
                  } else if (student.isVerified === false) {
                    status = "Rejected";
                    badgeClass = "bg-red-200 text-red-800";
                  }
                }
                return (
                  <motion.tr
                    key={student.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b hover:bg-indigo-50 transition duration-200"
                  >
                    {showCheckbox && (
                      <td className="px-2 py-2 border text-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-indigo-600"
                          title="Select student"
                        />
                      </td>
                    )}
                    {columns.map(({ key }) => {
                      let value = (student as any)[key];
                      if (key === "DOB" && value) {
                        value = new Date(value).toLocaleDateString("en-GB");
                      } else if (key === "email") {
                        value = (student as any).email ?? student.user?.email ?? "N/A";
                      } else {
                        value = value ?? "N/A";
                      }
                      return (
                        <td
                          key={key}
                          className="px-2 py-2 border text-center break-words whitespace-normal"
                        >
                          {value}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 border text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{status}</span>
                    </td>
                    <td className="px-2 py-2 border text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onView(student)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })
            ) : (
              <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td
                  className="px-2 py-2 border text-center"
                  colSpan={columns.length + (showCheckbox ? 3 : 2)}
                >
                  No Record's Found Currently.
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;
