"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Field = {
  key: string;
  label: string;
};

type FilterSidebarProps = {
  fields: Field[];
  onFilterChange: (filters: { [key: string]: string }) => void;
  onClose: () => void;
};

export default function FilterSidebar({
  fields,
  onFilterChange,
  onClose,
}: FilterSidebarProps) {
  // Initialize filters – one per field, starting empty.
  const initialFilters = fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as { [key: string]: string });

  const [filters, setFilters] = useState(initialFilters);

  // Notify parent whenever filters change.
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters.
  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="p-4">
      {/* Sticky header with animation, black bottom border */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4 border-b border-black pb-2"
      >
        <span className="text-indigo-600 text-2xl font-semibold">
          Filters
        </span>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onClick={handleClearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-md"
          >
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg shadow-md"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
      {/* Status dropdown filter */}
      <div className="flex flex-col mb-4">
        <label className="text-sm font-medium mb-1">Status</label>
        <select
          value={filters.status || ""}
          onChange={e => handleInputChange("status", e.target.value)}
          className="border border-black rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
          <option value="Not Submitted">Not Submitted</option>
        </select>
      </div>
      {/* Filter input fields */}
      <div className="space-y-4">
        {fields.filter(field => field.key !== "status").map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{field.label}</label>
            <input
              type="text"
              value={filters[field.key]}
              placeholder={`Filter by ${field.label}`}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="border border-black rounded p-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
