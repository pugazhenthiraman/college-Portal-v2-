"use client";

import { useState } from "react";
import Image from "next/image"; // ✅ Import Next.js Image component
import {  usePathname, useRouter } from "next/navigation";
import { User,  Home,  } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Hide profile icon on Home, Login, and Register pages
  const hideProfileIcon = ["/", "/home", "/auth/login"].includes(pathname);

  // ✅ Show Home button ONLY on login pages
  const showHomeButton = ["/auth/login"].includes(pathname);

  // ✅ Show "Back to Login" button ONLY on college register page
  // const showBackToLoginButton = pathname === "/college/register";

  const handleLogout = () => {
    signOut({callbackUrl: '/auth/login'});
  };

  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md h-20 fixed top-0 left-0 w-full z-50">
      {/* ✅ Logo on the left side */}
      <div className="flex items-center space-x-3">
        <Image
          src="/logo.png" // ✅ Path to your logo inside `public` folder
          alt="Education Master Logo"
          width={50} // Adjust width as needed
          height={50} // Adjust height as needed
          className="cursor-pointer "
          onClick={() => router.push("/")} // Redirect to home when clicked
        />
        <h1 className="text-3xl font-bold">Education Master</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* ✅ Show Home button ONLY on login pages */}
        {showHomeButton && (
          <button
            onClick={() => router.push("/home")}
            className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-md shadow-md hover:bg-gray-200"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        )}

        {/* ✅ Profile and Logout functionality (No Changes) */}
        {!hideProfileIcon && (
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2">
              <User className="w-8 h-8 text-white cursor-pointer" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2">
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 text-left">Profile</button>
                <button onClick={handleLogout} className="w-full px-4 py-2 text-red-500 hover:bg-gray-100 text-left">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
