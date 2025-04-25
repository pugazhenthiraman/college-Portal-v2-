// File: lib/generateInitialPassword.ts

import { UserRole } from "@prisma/client";

/**
 * Generate a “first-login” password based on role:
 * - STUDENT: firstName + YYYYMMDD
 * - FACULTY: fullName (no spaces) + last 5 digits of mobile
 */
export function generateInitialPassword(options: {
  role: UserRole;
  firstName?: string;
  dob?: Date;
  fullName?: string;
  contactNo?: string | number;
}): string {
  switch (options.role) {
    case "STUDENT":
      if (!options.firstName || !options.dob) {
        throw new Error("STUDENT requires firstName and dob");
      }
      const fn = options.firstName.trim().replace(/\s+/g, "");
      const y  = options.dob.getFullYear();
      const m  = String(options.dob.getMonth() + 1).padStart(2, "0");
      const d  = String(options.dob.getDate()).padStart(2, "0");
      return `${fn}${y}${m}${d}`;

    case "FACULTY":
      if (!options.fullName || options.contactNo == null) {
        throw new Error("FACULTY requires fullName and contactNo");
      }
      const namePart = options.fullName.trim().replace(/\s+/g, "");
      // ensure contactNo is a string, strip non-digits, then take last 5
      const digits   = String(options.contactNo).replace(/\D/g, "");
      return `${namePart}${digits.slice(-5)}`;

    default:
      throw new Error(`No generator implemented for role ${options.role}`);
  }
}
