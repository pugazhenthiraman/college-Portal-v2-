"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Next.js Image component
import { useRouter, usePathname } from "next/navigation";
import { User, Home } from "lucide-react";
import LogoutButton from "../components/logoutButton";
// Remove or comment out the NotificationBell import and its usage in the top nav for faculty and students.

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hide profile icon on Home, Login, and Register pages
  const hideProfileIcon = ["/", "/home", "/auth/login"].includes(pathname);

  // Show Home button ONLY on login pages
  const showHomeButton = ["/auth/login"].includes(pathname);

  // Click outside to close dropdown
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md h-20 fixed top-0 left-0 w-full z-50">
      {/* Logo on the left side */}
      <div className="flex items-center space-x-3">
        <Image
          src="/logo.png" // Path to your logo in `public`
          alt="Education Master Logo"
          width={50}
          height={50}
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />
        <h1 className="text-3xl font-bold">Education Master</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Show Home button ONLY on login pages */}
        {showHomeButton && (
          <button
            onClick={() => router.push("/home")}
            className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-md shadow-md hover:bg-gray-200"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        )}

        {/* Profile and Logout functionality */}
        {!hideProfileIcon && (
          <div className="relative flex items-center gap-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="Open user menu"
            >
              <User className="w-8 h-8 text-white cursor-pointer" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-full mt-2 w-56 bg-white shadow-2xl rounded-2xl p-4 z-50 border border-gray-100 flex flex-col items-start gap-2"
              >
                {/* Modern avatar/icon at the top */}
                <div className="flex items-center gap-3 mb-2 w-full border-b border-gray-100 pb-3">
                  <div className="bg-indigo-100 text-indigo-700 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-gray-800 text-base">Profile</span>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/profile");
                  }}
                  className="w-full px-4 py-2 my-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium rounded-lg text-left shadow-sm hover:bg-indigo-600 hover:text-white transition-colors duration-150"
                  aria-label="View profile"
                >
                  View Profile
                </button>
                <div className="w-full h-px bg-gray-100 my-1" />
                <div className="w-full">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
