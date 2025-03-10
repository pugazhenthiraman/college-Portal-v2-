"use client"; // ✅ Must be a client component for SessionProvider

import { SessionProvider } from "next-auth/react";
import SessionWrapper from "@/components/SessionProvider"; // ✅ Manages session-based redirection

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionWrapper>{children}</SessionWrapper>
    </SessionProvider>
  );
}
