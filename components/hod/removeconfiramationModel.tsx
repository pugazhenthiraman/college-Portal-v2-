"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export type RemoveConfirmationModalProps = {
  isOpen: boolean;
  advisor: { id: number; name: string };
  onConfirm: (password: string, action: "hod") => void;
  onCancel: () => void;
};

const RemoveConfirmationModal: React.FC<RemoveConfirmationModalProps> = ({
  isOpen,
  advisor,
  onConfirm,
  onCancel,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirmClick = () => {
    if (!password.trim()) {
      toast.error("Please enter your HOD password");
      return;
    }
    onConfirm(password, "hod");
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Remove Data for{" "}
              <span className="text-indigo-600">{advisor.name}</span>
            </h2>
            <p className="mb-4">
              Please enter your HOD password to confirm the removal.
            </p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={onCancel}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmClick}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Remove Faculty
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemoveConfirmationModal;
