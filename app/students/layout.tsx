import React from "react";
import LeftNavbar from "@/components/lefnavbar";
import TopNavbar from "@/components/navbar";

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-[64px]">
        <TopNavbar />
      </div>
      {/* Fixed Left Sidebar */}
      <div className="fixed top-[64px] left-0 h-[calc(100vh-64px)] z-40 bg-white border-r border-gray-200 w-[240px]">
        <LeftNavbar
          Links={[
            { name: "Dashboard", path: "/students/dashboard" },
            { name: "Creditor Area", path: "/students/studentsMultiSetForm" },
            {name: "Resume", path: "/students/resume" },
            { name: "Settings", path: "/students/settings" }
          ]}
          Header="Student Portal"
        />
      </div>
      {/* Main Content */}
      <main className="p-6 bg-gray-50 ml-[240px] mt-[64px] min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
} 