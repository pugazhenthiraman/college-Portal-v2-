// next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user’s database ID */
      id: string;
      /** The user’s role */
      role: "SUPER_ADMIN" |
            "COLLEGE"   |
            "HOD"       |
            "FACULTY"   |
            "STUDENT";
      /** Optional extra fields */
      collegeId?: number;
      departmentId?: number;
    } & DefaultSession["user"];
  }
}
