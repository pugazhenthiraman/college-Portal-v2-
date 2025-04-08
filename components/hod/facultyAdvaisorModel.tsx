"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { assignmentSchema as facultyAssignmentSchema } from "@/lib/validation";
import { z } from "zod";

// The transformed output type of our assignmentSchema.
export type FacultyAdvisorFormData = z.infer<typeof facultyAssignmentSchema>;

interface FacultyAdvisorFormProps {
  // Pass the collegeId and departmentId from the parent.
  collegeId: number;
  departmentId: number;
  onSubmit: (advisorData: FacultyAdvisorFormData) => Promise<void> | void;
  onCancel: () => void;
}

const FacultyAdvisorForm: React.FC<FacultyAdvisorFormProps> = ({
  collegeId,
  departmentId,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FacultyAdvisorFormData>({
    // We cast the resolver to any to work around type conflicts caused by Zod transform.
    resolver: zodResolver(facultyAssignmentSchema) as any,
    defaultValues: {
      collegeId,
      departmentId,
      name: "",
      email: "",
      password: "",
      contactNo: "",
      aadhaarNo: "",
    },
  });

  const handleFormSubmit: SubmitHandler<FacultyAdvisorFormData> = async (data) => {
    console.log("Submitting advisor data:", data);
    try {
      await onSubmit(data);
      toast.success("Faculty advisor created successfully!");
      reset(); // Clear the form after successful submission.
    } catch (error: any) {
      console.error("Error in FacultyAdvisorForm:", error);
      toast.error(error.message || "Failed to create faculty advisor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold text-black flex-grow">
          Create <span className="text-indigo-600">Faculty Advisor</span>
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

      {/* Hidden fields for collegeId and departmentId */}
      <input type="hidden" {...register("collegeId", { valueAsNumber: true })} />
      <input type="hidden" {...register("departmentId", { valueAsNumber: true })} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-black">
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
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black">
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
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-black">
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
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contactNo" className="block text-sm font-medium text-black">
          Mobile Number
        </label>
        <input
          id="contactNo"
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
        <label htmlFor="aadhaarNo" className="block text-sm font-medium text-black">
          Aadhar Number
        </label>
        <input
          id="aadhaarNo"
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
