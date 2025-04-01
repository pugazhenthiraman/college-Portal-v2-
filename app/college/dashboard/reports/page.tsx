"use client"

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportPage() {


    const pathname = usePathname();
    const [prevPathname, setPrevPathname] = useState(pathname);
    const [loading, setLoading] = useState(false);
  
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
    <div className="p-6 mt-24 flex justify-center items-center h-screen">

      {loading && <div className="loading-indicator">Loading...</div>}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center">
        Welcome to <span className="text-indigo-600">College Reports</span>
      </h2>
    </div>
  );
}