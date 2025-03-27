"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  return (
    <Button onClick={handleLogout} className="text-red-500">
      Logout
    </Button>
  );
};

export default LogoutButton;
