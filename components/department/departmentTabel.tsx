// components/department/departmentTabel.tsx
import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export type Department = {
  id: number;
  name: string;
  collegeId: number;
  hod?: {
    name: string;
    phoneNo?: string;
    email?: string;
    adhaarNo?: string;
  } | null;
};

type DepartmentTableProps = {
  selectedDepartments: Department[];
  onRemove: (department: Department) => void;
  onAddHOD: (department: Department) => void;
  onViewHODDetails: (department: Department) => void;
};

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  selectedDepartments,
  onRemove,
  onAddHOD,
  onViewHODDetails,
}) => {
  return (
    <table className="min-w-full border border-gray-200">
      <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white uppercase">
        <tr>
          <th className="py-2 px-4 border w-[40%]">Department Name</th>
          <th className="py-2 px-4 border w-[40%] text-center">HOD</th>
          <th className="py-2 px-4 border w-[20%] text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {selectedDepartments.length > 0 ? (
          selectedDepartments.map((dept, index) => (
            <motion.tr
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 px-4 border w-[40%]">{dept.name}</td>
              <td className="py-2 px-4 border w-[40%] text-center">
                {dept.hod ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-gray-700">{dept.hod.name}</span>
                    <button
                      onClick={() => onViewHODDetails(dept)}
                      title="View HOD Details"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onAddHOD(dept)}
                      title="Assign HOD"
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-gray-500 text-xs">Not Assigned</span>
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border w-[20%] text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onRemove(dept)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </motion.button>
              </td>
            </motion.tr>
          ))
        ) : (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <td className="py-2 px-4 border text-center" colSpan={3}>
              No departments selected.
            </td>
          </motion.tr>
        )}
      </tbody>
    </table>
  );
};

export default DepartmentTable;
