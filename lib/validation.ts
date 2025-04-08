import { z } from "zod";

export const assignmentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  contactNo: z.string().min(10),
  aadhaarNo: z.string().min(12),
  collegeId: z.number(),
  departmentId: z.number(),
});
