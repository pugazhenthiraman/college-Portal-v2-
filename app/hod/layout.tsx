"use client";
import React from "react";
import Navbar from "@/components/navbar";
import LeftSidebar from "@/components/lefnavbar";

const hodLinks = [
  { name: "Dashboard", path: "/hod/dashboard" },
  { name: "Students", path: "/hod/students" },
  { name: "Faculty Advisor", path: "/hod/faculty" },
  { name: "Upload Faculty Details", path: "/hod/upload-faculty" },
];

export default function HodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <LeftSidebar Links={hodLinks} Header="HOD Dashboard" />
        <main className="ml-64 flex-1 min-h-screen flex flex-col p-0">
          {/* Remove extra padding, let children handle their own spacing */}
          {children}
        </main>
      </div>
    </div>
  );
}
