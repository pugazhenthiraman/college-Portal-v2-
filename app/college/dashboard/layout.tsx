"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LeftSidebar from "../../../components/lefnavbar";

export default function CollegeAuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [loading, setLoading] = useState(false);

  // Show sidebar only on specific routes
  const showSidebar = pathname.startsWith("/college/dashboard");
  const Links = [
    { name: "Dashboard", path: "/college/dashboard/collegeHome" },
    { name: "Department", path: "/college/dashboard/department" },
    { name: "Upload Candidates Details", path: "/college/dashboard/uploadDetailsCandidates" },
    { name: "Role and Page Access", path: "/college/dashboard/roleAndPageAccess" },
    { name: "Reports", path: "/college/dashboard/reports" },
  ];

  useEffect(() => {
    if (pathname !== prevPathname) {
      setLoading(true);
      setPrevPathname(pathname);
      // Simulate loading duration (replace with your actual logic)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPathname]);

  return (
    <div className="flex">
      {showSidebar && <LeftSidebar Links={Links} Header={"College Panel"} />}
      <main className={`flex-grow ${showSidebar ? "ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
}
