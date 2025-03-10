"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration before rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect user only after client hydration
  useEffect(() => {
    if (isClient && (status === "unauthenticated")) {
      router.push("/auth/login");
    }
  }, [status, session, isClient, router]);

  if (!isClient || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
