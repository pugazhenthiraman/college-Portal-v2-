import * as z from "zod";

// ✅ Faculty Advisor form and Excel upload validation
export const FacultyAdvisorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits" }).max(15),
  aadhaarNo: z.string().length(12, { message: "Aadhaar number must be 12 digits" }).regex(/^\d+$/, { message: "Aadhaar must be numeric" }),
  collegeId: z.number().int().nonnegative(),
  departmentId: z.number().int().nonnegative(),
});

export type FacultyAdvisorSchemaType = z.infer<typeof FacultyAdvisorSchema>;

// ✅ Student Upload validation (used for Excel upload)
export const StudentUploadSchema = z.object({
  firstName: z.string().min(1, { message: "firstName is required" }),
  lastName: z.string().min(1, { message: "lastName is required" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  personalEmailId: z.string().email({ message: "Invalid personalEmailId" }),
  rollNo: z.string().min(1, { message: "rollNo is required" }),
  departmentName: z.string().min(1, { message: "departmentName is required" }),
  DOB: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid DOB format" }),
  phoneNo: z.string().min(10, { message: "Invalid phoneNo" }).max(15),
  secondaryPhoneNo: z.string().optional(),
  country: z.string().min(1, { message: "country is required" }),
  district: z.string().min(1, { message: "district is required" }),
  state: z.string().min(1, { message: "state is required" })
});

export type StudentUploadSchemaType = z.infer<typeof StudentUploadSchema>;

// ✅ Assignment-related validation (for future use)
export const assignmentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contactNo: z.string().min(10),
  aadhaarNo: z.string().min(12),
  collegeId: z.number(),
  departmentId: z.number(),
});
