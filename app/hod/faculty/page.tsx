"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Faculty {
  id: number;
  name: string;
  email: string;
}

export default function FacultyAssignmentPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    // Fetch faculty data for the HOD's department
    const fetchFaculties = async () => {
      try {
        const { data } = await axios.get("/api/hod/faculty"); // Adjust endpoint as needed
        setFaculties(data.faculties);
      } catch (error) {
        console.error("Error fetching faculties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleAssign = async (facultyId: number) => {
    setAssigning(facultyId);
    try {
      const { data } = await axios.post("/api/hod/assign-faculty", { facultyId });
      if (data.success) {
        alert("Faculty assigned successfully!");
        // Optionally update local state to reflect the assignment
      } else {
        alert("Assignment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning faculty", error);
      alert("Failed to assign faculty.");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 mt-24 text-center">
        <p>Loading faculties...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mt-24">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
        Faculty Assignment
      </h2>
      {faculties.length === 0 ? (
        <p className="text-center">No faculty found for assignment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td className="py-2 px-4 border-b">{faculty.name}</td>
                  <td className="py-2 px-4 border-b">{faculty.email}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleAssign(faculty.id)}
                      disabled={assigning === faculty.id}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      {assigning === faculty.id ? "Assigning..." : "Assign as Advisor"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
