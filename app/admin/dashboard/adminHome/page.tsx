

// export default function AdminHome() {


  

  
//   return (
//     <div className="p-6 mt-24"> {/* Added margin-top to prevent overlap with navbar */}
//       <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
//             Welcome to <span className="text-indigo-600">Admin Dashboard</span>
//           </h2>
      
//       {/* Grid for Dashboard Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-blue-100 text-blue-800 p-6 rounded-lg shadow-md text-center border border-blue-300">
//           <h2 className="text-xl font-semibold">Total Colleges</h2>
//           <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
//         </div>
        
//         <div className="bg-green-100 text-green-800 p-6 rounded-lg shadow-md text-center border border-green-300">
//           <h2 className="text-xl font-semibold">Approved Colleges</h2>
//           <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
//         </div>
        
//         <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg shadow-md text-center border border-yellow-300">
//           <h2 className="text-xl font-semibold">Pending Approvals</h2>
//           <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import useSWR from "swr";
import dynamic from "next/dynamic";
import { useState } from "react";

// ✅ Lazy Load Loading Spinner
const LoadingSpinner = dynamic(() => import("../../../../components/ui/loadingSpinner"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

// ✅ Fetch Data using SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function AdminHome() {
  // ✅ Fetch Dashboard Stats from Backend
  const { data, error } = useSWR("/api/admin/dashboard-stats", fetcher);

  // ✅ Error Handling & Loading State
  if (error) return <div className="text-red-500 text-center">Failed to load data!</div>;
  if (!data) return <LoadingSpinner />;

  return (
    <div className="p-6 mt-24">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Welcome to <span className="text-indigo-600">Admin Dashboard</span>
      </h2>

      {/* Grid for Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Colleges" value={data.totalColleges} color="blue" />
        <DashboardCard title="Approved Colleges" value={data.approvedColleges} color="green" />
        <DashboardCard title="Pending Approvals" value={data.pendingApprovals} color="yellow" />
      </div>
    </div>
  );
}

// ✅ Reusable Dashboard Card Component
function DashboardCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className={`bg-${color}-100 text-${color}-800 p-6 rounded-lg shadow-md text-center border border-${color}-300`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
