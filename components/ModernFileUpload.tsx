// components/ModernFileUpload.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ModernFileUploadProps {
  /** Name of the currently selected file (empty if none) */
  fileName: string;
  /** Whether an upload is in progress */
  loading: boolean;
  /** Called when the user selects (or drops) a file */
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when the user clicks “Upload” */
  onUpload: () => void;
  /** Called when the user wants to remove the selected file */
  onRemoveFile: () => void;
}

export default function ModernFileUpload({
  fileName,
  loading,
  onFileChange,
  onUpload,
  onRemoveFile,
}: ModernFileUploadProps) {
  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <label htmlFor="file-upload" className="block text-2xl font-bold mb-3">
          <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-shine">
            Upload Excel
          </span>{" "}
          File 📂
        </label>

        {/* Drop zone / file picker */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors duration-300 relative">
          {/* Hidden input */}
          <input
            id="file-upload"
            type="file"
            accept=".xls,.xlsx"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Icon + instructions */}
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          <p className="text-gray-600 text-sm mb-2">
            Drag & drop your file here, or click to select
          </p>

          {/* Choose File button */}
          <motion.label
            htmlFor="file-upload"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-4 rounded-lg transition transform cursor-pointer text-sm"
          >
            Choose File
          </motion.label>
        </div>

        {/* Selected file info + remove */}
        {fileName && (
          <div className="mt-3 flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm">
            <span className="text-gray-700 font-medium text-sm">
              {fileName}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Button
                variant="destructive"
                onClick={onRemoveFile}
                className="px-3 py-1 text-xs"
              >
                Remove
              </Button>
            </motion.div>
          </div>
        )}

        {/* Upload button */}
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Button
            onClick={onUpload}
            disabled={loading || !fileName}
            className="mt-4 w-full py-2 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition transform"
          >
            {loading ? "Uploading..." : "📤 Upload"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
