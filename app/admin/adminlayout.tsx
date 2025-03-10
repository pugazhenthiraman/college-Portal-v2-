"use client"; // ✅ Ensure it's a Client Component

import { usePathname } from "next/navigation";
import LeftSidebar from "../../components/lefnavbar"; // ✅ Corrected Import

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // const {data : session, status} = useSession();

  // // Show Left Sidebar only for Admin Pages (except login)
  const showSidebar = pathname.startsWith("/admin") && pathname !== "/auth/login";


  // if(status === 'loading') {
  //   return <></>
  // }

  

  const Links = [
    
  { name: "Dashboard", path: "/admin/dashboard/adminHome" },
  { name: "College Onboarding", path: "/admin/dashboard/collegeOnboarding" },
  { name: "Subscription Status", path: "/admin/dashboard/subscriptionStatus" },
  { name: "Reports", path: "/admin/dashboard/report" },
];



  return (
    <div className="flex">
      {showSidebar && <LeftSidebar Links={Links} Header={"Admin Panel"} />} {/* ✅ Left Sidebar for Admin Pages */}
      <main className={`flex-grow ${showSidebar ? "ml-64" : ""}`}>{children}</main>
    </div>
  );
}
