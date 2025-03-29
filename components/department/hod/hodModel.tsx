"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type HodDetails = {
  name: string;
  phoneNo?: string;
  adhaarNo?: string;
  // Include email from the related user object
  user?: {
    email?: string;
  };
};

type HodDetailsModalProps = {
  hod: HodDetails;
  onClose: () => void;
};

const HodDetailsModal: React.FC<HodDetailsModalProps> = ({ hod, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation()}
        >
          {/* Close Icon Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            <span className="text-indigo-600">HOD</span> Details
          </h2>
          <div className="flex flex-col space-y-3 text-left text-lg">
            <div className="flex items-center">
              <span className="font-bold w-24">Name:</span>
              <span>{hod.name}</span>
            </div>
            {hod.user?.email && (
              <div className="flex items-center">
                <span className="font-bold w-24">Email:</span>
                <span>{hod.user.email}</span>
              </div>
            )}
            {hod.phoneNo && (
              <div className="flex items-center">
                <span className="font-bold w-24">Phone:</span>
                <span>{hod.phoneNo}</span>
              </div>
            )}
            {hod.adhaarNo && (
              <div className="flex items-center">
                <span className="font-bold w-24">Aadhaar:</span>
                <span>{hod.adhaarNo}</span>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HodDetailsModal;
