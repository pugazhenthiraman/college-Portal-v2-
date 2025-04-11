"use client";

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className=" justify-end mt-1 flex items-center space-x-4">
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
        <Input
          type="text"
          placeholder="🔍 Search students..."
          value={value}
          onChange={onChange}
          className="w-64 h-10 px-4 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition transform"
        />
      </motion.div>
    </div>
  );
};

export default SearchBar;
