import { z } from "zod";

export const assignmentSchema = z
  .object({
    collegeId: z.number({ required_error: "College ID is required" }),
    departmentId: z.number({ required_error: "Department ID is required" }),
    // Accept either hodName or facultyName; they are optional inputs.
    hodName: z.string().optional(),
    facultyName: z.string().optional(),
    // Accept either hodEmail or facultyEmail.
    hodEmail: z.string().email("Invalid email address").optional(),
    facultyEmail: z.string().email("Invalid email address").optional(),
    password: z.string().nonempty("Password is required"),
    contactNo: z
      .string()
      .regex(/^\d+$/, "Contact number must contain only digits")
      .nonempty("Contact number is required"),
    aadhaarNo: z
      .string()
      .regex(/^\d{10,12}$/, "Aadhaar must be 10 to 12 digits")
      .nonempty("Aadhaar number is required"),
  })
  // Require that at least one name is provided.
  .refine((data) => data.hodName || data.facultyName, {
    message: "Either HOD name or Faculty name is required",
    path: ["hodName"],
  })
  // Require that at least one email is provided.
  .refine((data) => data.hodEmail || data.facultyEmail, {
    message: "Either HOD email or Faculty email is required",
    path: ["hodEmail"],
  })
  // Transform the input into the final shape used in your backend.
  .transform((data) => ({
    collegeId: data.collegeId,
    departmentId: data.departmentId,
    // Use hodName if provided; otherwise, use facultyName.
    name: data.hodName || data.facultyName || "",
    // Similarly for email.
    email: data.hodEmail || data.facultyEmail || "",
    password: data.password,
    contactNo: data.contactNo,
    aadhaarNo: data.aadhaarNo,
  }));
