"use client";
import React from "react";
import Navbar from "@/components/navbar";
import LeftSidebar from "@/components/lefnavbar";

const hodLinks = [
  { name: "Dashboard", path: "/hod/dashboard" },
  { name: "Students", path: "/hod/students" },
  { name: "Faculty Advisor", path: "/hod/faculty" },
];

export default function HodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <LeftSidebar Links={hodLinks} Header="HOD Dashboard" />
        <main className="ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
