import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("Middleware executed for:", req.nextUrl.pathname);

  const { pathname } = req.nextUrl;

  // ✅ Exclude Next.js static assets, images, and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ✅ Use `getToken()` for authentication (Ensures compatibility with Node.js runtime)
  const token: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  console.log("Token:", token);

  // ✅ Fix token expiration check (convert `exp` from seconds to milliseconds)
  if (!token || (token.exp && token.exp * 1000 <= Date.now())) {
    console.warn("🔴 No valid token found, redirecting to login...");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const publicRoutes = ["/", "/auth/login"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Define role-based access paths
  const rolePaths: Record<string, string> = {
    SUPER_ADMIN: "/admin",
    COLLEGE: "/college",
    DEPARTMENT: "/department",
    HOD: "/hod",
    FACULTY: "/faculty",
    STUDENT: "/student",
  };

  // ✅ Ensure user is accessing their allowed route
  const userRole = token.role;
  const allowedPath = rolePaths[userRole];

  console.log("UserRole:", userRole, "AllowedPath:", allowedPath);

  if (!allowedPath || !pathname.startsWith(allowedPath)) {
    console.warn(`🔴 Unauthorized access attempt by role: ${userRole} to ${pathname}`);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// ✅ **Explicitly set `runtime: "nodejs"` in the config**
export const config = {
  matcher: [
    "/admin/:path*",
    "/college/:path*",
    "/department/:path*",
    "/hod/:path*",
    "/faculty/:path*",
    "/student/:path*",
  ],
};
