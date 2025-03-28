"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/home" });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Button onClick={handleLogout} className="w-full px-4 py-2 text-red-500">
      Logout
    </Button>
  );
};

export default LogoutButton;
