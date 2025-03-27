"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that should be accessible without a session
  const publicRoutes = useMemo(() => ["/", "/home", "/auth/login"], []);

  useEffect(() => {
    // If the current route is public, don't force a redirect
    if (publicRoutes.includes(pathname)) return;

    // Otherwise, if unauthenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, pathname, publicRoutes]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Return children even if session is null when on a public route
  return <>{children}</>;
}
