"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  User2,
  Mail,
  Phone,
  Calendar,
  School,
  Building2,
  BadgeCheck,
  IdCard,
  BookOpen,
  UserCheck,
  Edit2,
  Save,
  X,
} from "lucide-react";

type ProfileData = {
  id: number;
  name?: string;
  email: string;
  role: string;
  phoneNo?: string;
  adhaarNo?: string;
  contactNo?: string;
  personalEmailId?: string;
  rollNo?: string;
  DOB?: string;
  createdAt: string;
  college?: { name: string; collegeType?: string };
  department?: { name: string; departmentType?: string; hod?: { name: string } };
  faculty?: { name: string }[];
  status?: string;
  image?: string | null;
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <span className="text-lg text-gray-600">Loading…</span>
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <span className="text-red-500">Couldn’t load profile</span>
      </div>
    );

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-2">
      <Toaster />
      <div className="w-full max-w-2xl bg-white/80 rounded-3xl shadow-2xl border border-blue-100 p-8 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-full p-4 mb-3 shadow-lg">
            {profile.image ? (
              <img
                src={profile.image}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <User2 className="h-16 w-16 text-indigo-600" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-1 tracking-tight">
            {profile.name || profile.rollNo || "Student"}
          </h1>
          <div className="flex items-center space-x-2">
            <BadgeCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-500 capitalize">
              {profile.status || "Active"}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Email */}
          <ProfileField
            icon={<Mail className="w-5 h-5 text-indigo-400" />}
            label="Email"
            value={profile.email}
          />
          {/* Role */}
          <ProfileField
            icon={<IdCard className="w-5 h-5 text-indigo-400" />}
            label="Role"
            value={profile.role}
          />
          {/* Phone */}
          <ProfileField
            icon={<Phone className="w-5 h-5 text-indigo-400" />}
            label="Phone"
            value={profile.phoneNo}
            editable={editMode}
            name="phoneNo"
            form={form}
            onChange={handleChange}
          />
          {/* Aadhaar */}
          <ProfileField
            icon={<IdCard className="w-5 h-5 text-indigo-400" />}
            label="Aadhaar No"
            value={profile.adhaarNo}
            editable={editMode}
            name="adhaarNo"
            form={form}
            onChange={handleChange}
          />
          {/* Personal Email */}
          <ProfileField
            icon={<Mail className="w-5 h-5 text-indigo-400" />}
            label="Personal Email"
            value={profile.personalEmailId}
            editable={editMode}
            name="personalEmailId"
            form={form}
            onChange={handleChange}
          />
          {/* Roll No */}
          <ProfileField
            icon={<BookOpen className="w-5 h-5 text-indigo-400" />}
            label="Roll No"
            value={profile.rollNo}
          />
          {/* DOB */}
          <ProfileField
            icon={<Calendar className="w-5 h-5 text-indigo-400" />}
            label="DOB"
            value={profile.DOB ? new Date(profile.DOB).toLocaleDateString() : ""}
          />
          {/* Joined On */}
          <ProfileField
            icon={<Calendar className="w-5 h-5 text-indigo-400" />}
            label="Joined On"
            value={new Date(profile.createdAt).toLocaleDateString()}
          />
        </div>

        {/* Relational Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* College */}
          <ProfileField
            icon={<School className="w-5 h-5 text-indigo-400" />}
            label="College"
            value={profile.college?.name}
            sub={profile.college?.collegeType}
          />
          {/* Department */}
          <ProfileField
            icon={<Building2 className="w-5 h-5 text-indigo-400" />}
            label="Department"
            value={profile.department?.name}
            sub={profile.department?.departmentType}
          />
          {/* HOD */}
          <ProfileField
            icon={<UserCheck className="w-5 h-5 text-indigo-400" />}
            label="Head of Department"
            value={profile.department?.hod?.name}
          />
          {/* Faculty */}
          <ProfileField
            icon={<User2 className="w-5 h-5 text-indigo-400" />}
            label="Faculty"
            value={
              profile.faculty && profile.faculty.length > 0
                ? profile.faculty.map((f) => f.name).join(", ")
                : undefined
            }
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setForm(profile);
                  setEditMode(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded flex items-center"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
              >
                <Save className="w-4 h-4 mr-1" /> Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ProfileField component for reusability and clarity
function ProfileField({
  icon,
  label,
  value,
  sub,
  editable,
  name,
  form,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  sub?: string | null;
  editable?: boolean;
  name?: string;
  form?: Partial<ProfileData>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="flex items-center text-xs font-semibold text-gray-500 mb-1">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      {editable && name && form && onChange ? (
        <input
          name={name}
          value={form[name] || ""}
          onChange={onChange}
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <div>
          <span className="text-base font-medium text-gray-800">{value || <span className="text-gray-400">N/A</span>}</span>
          {sub && (
            <span className="ml-2 text-xs text-gray-400 bg-indigo-50 px-2 py-0.5 rounded-full">
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}