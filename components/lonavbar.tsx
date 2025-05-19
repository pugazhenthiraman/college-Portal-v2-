"use client";
import {signOut} from "next-auth/react"

export default function Navbar() {

  const handleSignOut = () => {
    signOut();
    window.location.href = "/home";
  }
 

  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <button onClick={handleSignOut} className="bg-red-500 px-4 py-2 rounded-lg">
        Logout
      </button>
    </nav>
  );
}
