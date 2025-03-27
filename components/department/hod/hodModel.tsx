"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type HodDetails = {
  name: string;
  phoneNo?: string;
  adhaarNo?: string;
  // We include email from the related user object
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
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-6 rounded shadow-md max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-600" title="Close">
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4">HOD Details</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {hod.name}
            </p>
            {hod.user?.email && (
              <p>
                <strong>Email:</strong> {hod.user.email}
              </p>
            )}
            {hod.phoneNo && (
              <p>
                <strong>Phone:</strong> {hod.phoneNo}
              </p>
            )}
            {hod.adhaarNo && (
              <p>
                <strong>Aadhaar:</strong> {hod.adhaarNo}
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HodDetailsModal;
