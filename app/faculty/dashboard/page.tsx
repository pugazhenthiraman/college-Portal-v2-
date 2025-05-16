// app/hod/dashboard/page.tsx
"use client";
import React from "react";
import DashboardCard from "@/components/ui/departmentCard";

export default function HodHome() {
  // Replace these values with dynamic data fetched from your backend
  const studentCount = 0;
  const facultyCount = 0;
  const pendingTasks = 0;

  return (
    <div className="p-6 ">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Welcome to <span className="text-indigo-600">Faculty Dashboard</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Students"
          count={studentCount}
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
          borderColor="border-yellow-300"
        />
        <DashboardCard
          title="Faculty"
          count={facultyCount}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
          borderColor="border-blue-300"
        />
        <DashboardCard
          title="Pending Tasks"
          count={pendingTasks}
          bgColor="bg-green-100"
          textColor="text-green-800"
          borderColor="border-green-300"
        />
      </div>
    </div>
  );
}
