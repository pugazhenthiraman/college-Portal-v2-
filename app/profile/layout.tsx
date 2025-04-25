// File: app/profile/layout.tsx
"use client";

import LeftSidebar from "@/components/lefnavbar";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Role = "SUPER_ADMIN" | "COLLEGE" | "HOD" | "FACULTY" | "STUDENT" | string;

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);

  // Fetch profile once to get the role
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch profile");
        return r.json();
      })
      .then((data) => setRole(data.role))
      .catch((err) => {
        console.error(err);
        toast.error("Could not determine user role");
      });
  }, []);

  // Map each role to its dashboard route
  const dashboardRoute = (() => {
    switch (role) {
      case "SUPER_ADMIN":
        return "/admin/dashboard/adminHome";
      case "COLLEGE":
        return "/college/dashboard/collegeHome";
      case "HOD":
        return "/hod/dashboard";
      case "FACULTY":
        return "/faculty/dashboard";
      case "STUDENT":
        return "/students/dashboard";
      default:
        return "/";
    }
  })();

const menu = [
  { name: "Profile",  path: "/profile" },
  { name: "Security", path: "/profile/password" },
];


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex pt-20">
        <LeftSidebar Links={menu} Header="My Account" />

        <main className="ml-64 flex-1 p-6">
          {/* Back to dashboard link */}
          {role && (
            <Link
              href={dashboardRoute}
              className="inline-block mb-6 text-indigo-600 hover:underline"
            >
              ← Back to {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
            </Link>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
