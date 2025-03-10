"use client";

import { usePathname } from "next/navigation";
import LeftSidebar from "../../../components/lefnavbar";

export default function CollegeAuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Sidebar visible only on paths starting with "/college/dashboard"
  const showSidebar = pathname.startsWith("/college/dashboard");

  const Links = [
    { name: "Dashboard", path: "/college/dashboard/collegeHome" },
     { name: "Department", path: "/college/dashboard/department" },
    { name: "Upload Candidates Details ", path: "/college/dashboard/uploadDetailsCandidates" },
    { name: "Role and Page Access", path: "/college/dashboard/roleAndPageAccess" },
    { name: "Reports", path: "/college/dashboard/reports" },
  ];

  return (
    <div className="flex">
       {showSidebar && <LeftSidebar Links={Links} Header={"College Panel"} />} {/* ✅ Left Sidebar for College Pages */}
      <main className={`flex-grow ${showSidebar ? "ml-64" : ""}`}>{children}</main>
    </div>
  );
}
