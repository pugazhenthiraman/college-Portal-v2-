"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { assignmentSchema as facultyAssignmentSchema } from "@/lib/validation";
import { z } from "zod";

export type FacultyAdvisorFormData = z.infer<typeof facultyAssignmentSchema>;

interface FacultyAdvisorFormProps {
  onSubmit: (advisorData: FacultyAdvisorFormData) => Promise<void> | void;
  onCancel: () => void;
}

const FacultyAdvisorForm: React.FC<FacultyAdvisorFormProps> = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FacultyAdvisorFormData>({
    resolver: zodResolver(facultyAssignmentSchema),
  });

  const handleFormSubmit = async (data: FacultyAdvisorFormData) => {
    try {
      await onSubmit(data);
      toast.success("Faculty advisor created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create faculty advisor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold text-black flex-grow">
          Assign <span className="text-indigo-600">Faculty Advisor</span>
        </h2>
        <button
          onClick={onCancel}
          type="button"
          className="text-gray-500 hover:text-gray-700 ml-4"
          aria-label="Close form"
        >
          <X size={24} />
        </button>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="Enter name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter email"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          required
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Enter password"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          required
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <input
          id="mobileNumber"
          type="text"
          {...register("contactNo")}
          placeholder="Enter mobile number"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          required
        />
        {errors.contactNo && (
          <p className="mt-1 text-xs text-red-500">{errors.contactNo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">
          Aadhar Number
        </label>
        <input
          id="aadharNumber"
          type="text"
          {...register("aadhaarNo")}
          placeholder="Enter Aadhar number"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          required
        />
        {errors.aadhaarNo && (
          <p className="mt-1 text-xs text-red-500">{errors.aadhaarNo.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
          aria-label="Cancel"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "bg-green-400" : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-2 rounded-lg`}
          aria-label="Submit Faculty Advisor"
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </motion.button>
      </div>
    </form>
  );
};

export default FacultyAdvisorForm;
