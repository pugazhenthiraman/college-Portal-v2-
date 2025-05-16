import React from "react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Utility component for displaying info items
function InfoItem({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="p-2 bg-blue-50 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value || "N/A"}</p>
      </div>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Please log in to view your dashboard.</h1>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Student record not found.</h1>
      </div>
    </div>
  );
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <NotLoggedIn />;
  }

  const studentInfo = await prisma.student.findUnique({
    where: { userId: Number(session.user.id) },
    include: { department: { include: { hod: true, faculty: true, college: true } } },
  });

  if (!studentInfo) {
    return <NotFound />;
  }

  const assignedFaculty = studentInfo.department?.faculty?.find(
    (f: { id: number }) => f.id === studentInfo.facultyId
  );

  const firstInitial = studentInfo.firstName?.[0] || "S";

  // Example: Show verification status
  const status = studentInfo.status; // e.g., "pending", "verified", "rejected"

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg p-6 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {studentInfo.firstName || "Student"}!</h1>
            <p className="mt-1 opacity-80">Your personalized student dashboard</p>
            <div className="mt-2">
              {status === "verified" ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Verified</span>
              ) : status === "pending" ? (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Pending Verification</span>
              ) : status === "rejected" ? (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Rejected</span>
              ) : null}
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-indigo-500 font-bold shadow">
            {firstInitial}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <InfoItem
            label="College"
            value={studentInfo.department?.college?.name}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l9-4 9 4-9 4-9-4z" />
            </svg>}
          />
          <InfoItem
            label="Department"
            value={studentInfo.department?.name}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M19 3v4M5 21v-6m14 6v-6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7h14M5 13h14" />
            </svg>}
          />
          <InfoItem
            label="Faculty"
            value={assignedFaculty?.name}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 1112 21a4 4 0 01-6.879-3.196z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a4 4 0 10-8 0 4 4 0 008 0z" />
            </svg>}
          />
          <InfoItem
            label="Head of Department"
            value={studentInfo.department?.hod?.name}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.668 6.28L12 21l-6.828-4.142a12.06 12.06 0 01.668-6.28L12 14z" />
            </svg>}
          />
        </div>
      </div>
    </div>
  );
}