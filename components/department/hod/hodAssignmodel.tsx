"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export type HodData = {
  hodName: string;
  hodEmail: string;
  password: string;
  contactNo: string;
  aadhaarNo: string;
};

type HodAssignmentModalProps = {
  isOpen: boolean;
  department: string;
  onClose: () => void;
  onSave: (hodData: HodData) => void;
};

const HodAssignmentModal: React.FC<HodAssignmentModalProps> = ({
  isOpen,
  department,
  onClose,
  onSave,
}) => {
  const [hodName, setHodName] = useState("");
  const [hodEmail, setHodEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");

  const handleSave = () => {
    onSave({ hodName, hodEmail, password, contactNo, aadhaarNo });
    // Reset fields after saving
    setHodName("");
    setHodEmail("");
    setPassword("");
    setContactNo("");
    setAadhaarNo("");
  };

  // Clear fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHodName("");
      setHodEmail("");
      setPassword("");
      setContactNo("");
      setAadhaarNo("");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Removed onClick here so clicking outside doesn't close the modal
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation()}
          >
            {/* Top-right Cancel Icon */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              Assign HOD for <span className="text-indigo-600">{department}</span>
            </h2>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="HOD Name"
                value={hodName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHodName(e.target.value)
                }
              />
              <Input
                type="email"
                placeholder="HOD Email"
                value={hodEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHodEmail(e.target.value)
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              <Input
                type="text"
                placeholder="Contact No"
                value={contactNo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContactNo(e.target.value)
                }
              />
              <Input
                type="text"
                placeholder="Aadhaar No"
                value={aadhaarNo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAadhaarNo(e.target.value)
                }
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={onClose}
                className="w-24 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="w-24 py-1 px-3 rounded">
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HodAssignmentModal;
