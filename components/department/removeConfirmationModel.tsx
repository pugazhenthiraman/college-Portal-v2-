"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export type RemoveConfirmationModalProps = {
  isOpen: boolean;
  department: { id: number; name: string };
  onConfirm: (password: string, action: "all" | "hod") => void;
  onCancel: () => void;
  action?: "all" | "hod"; // Optional prop to indicate a default or pre-selected removal action
};

const RemoveConfirmationModal: React.FC<RemoveConfirmationModalProps> = ({
  isOpen,
  department,
  onConfirm,
  onCancel, // currently not used in rendering, but available if needed
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
              <span className="text-indigo-600">{department.name}</span>
            </h2>
            <p className="mb-4">
              Please enter your college password to confirm one of the following actions:
            </p>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="College Password"
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
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    onConfirm(password, "hod");
                    setPassword("");
                  }}
                >
                  Remove HOD
                </Button>
                <Button
                  onClick={() => {
                    onConfirm(password, "all");
                    setPassword("");
                  }}
                >
                  Remove All Data
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RemoveConfirmationModal;
