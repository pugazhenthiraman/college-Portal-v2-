// app/college/dashboard/collegeHome/page.tsx
import React from "react";
import DashboardCard from "@/components/ui/departmentCard";

export default function CollegeHome() {
  // Replace these with dynamic values as needed
  const hodCount = 0;
  const facultyAdvisorCount = 0;
  const studentCount = 0;

  return (
    <div className="p-6 mt-24"> {/* Margin-top to prevent overlap with navbar */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Welcome to <span className="text-indigo-600">College Dashboard</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Head Of Department"
          count={hodCount}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
          borderColor="border-blue-300"
        />
        <DashboardCard
          title="Faculty Advisor"
          count={facultyAdvisorCount}
          bgColor="bg-green-100"
          textColor="text-green-800"
          borderColor="border-green-300"
        />
        <DashboardCard
          title="Students"
          count={studentCount}
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
          borderColor="border-yellow-300"
        />
      </div>
    </div>
  );
}
