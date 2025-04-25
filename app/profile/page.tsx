// File: app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

type ProfileData = {
  id: number;
  email: string;
  role: string;
  name?: string;
  phoneNo?: string;
  adhaarNo?: string;
  contactNo?: string;
  personalEmailId?: string;
  rollNo?: string;
  DOB?: string;
  collegeName?: string;
  departmentName?: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load profile");
        return res.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setForm(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!profile) return <p className="text-red-500">Couldn’t load profile</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Save failed");
    } else {
      setProfile({ ...profile, ...(form as any) });
      setEditMode(false);
      toast.success("Saved");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white shadow rounded p-6 space-y-4">
        {/* Name or rollNo */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          {editMode ? (
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="mt-1 w-full border rounded p-2"
            />
          ) : (
            <p>{profile.name || profile.rollNo}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <p>{profile.email}</p>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium">Role</label>
          <p>{profile.role}</p>
        </div>

        {/* Phone, Adhaar, etc. */}
        {profile.phoneNo && (
          <div>
            <label className="block text-sm font-medium">Phone</label>
            {editMode ? (
              <input
                name="phoneNo"
                value={form.phoneNo || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              />
            ) : (
              <p>{profile.phoneNo}</p>
            )}
          </div>
        )}
        {profile.adhaarNo && (
          <div>
            <label className="block text-sm font-medium">Aadhaar No</label>
            {editMode ? (
              <input
                name="adhaarNo"
                value={form.adhaarNo || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              />
            ) : (
              <p>{profile.adhaarNo}</p>
            )}
          </div>
        )}
        {profile.personalEmailId && (
          <div>
            <label className="block text-sm font-medium">Personal Email</label>
            {editMode ? (
              <input
                name="personalEmailId"
                value={form.personalEmailId || ""}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              />
            ) : (
              <p>{profile.personalEmailId}</p>
            )}
          </div>
        )}
        {profile.rollNo && (
          <div>
            <label className="block text-sm font-medium">Roll No</label>
            <p>{profile.rollNo}</p>
          </div>
        )}
        {profile.DOB && (
          <div>
            <label className="block text-sm font-medium">DOB</label>
            <p>{new Date(profile.DOB).toLocaleDateString()}</p>
          </div>
        )}

        {/* College & Department */}
        {profile.collegeName && (
          <div>
            <label className="block text-sm font-medium">College</label>
            <p>{profile.collegeName}</p>
          </div>
        )}
        {profile.departmentName && (
          <div>
            <label className="block text-sm font-medium">Department</label>
            <p>{profile.departmentName}</p>
          </div>
        )}

        {/* Joined On */}
        <div>
          <label className="block text-sm font-medium">Joined On</label>
          <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setForm(profile);
                  setEditMode(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
