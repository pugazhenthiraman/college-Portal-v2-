import { z } from "zod";

export const hodAssignmentSchema = z.object({
  collegeId: z.number({
    required_error: "College ID is required",
  }),
  departmentId: z.number({
    required_error: "Department ID is required",
  }),
  hodName: z.string().nonempty("HOD name is required"),
  hodEmail: z.string().email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
  contactNo: z
    .string()
    .regex(/^\d+$/, "Contact number must contain only digits")
    .nonempty("Contact number is required"),
  aadhaarNo: z
    .string()
    .regex(/^\d{10,12}$/, "Aadhaar must be 10 to 12 digits")
    .nonempty("Aadhaar number is required"),
});
