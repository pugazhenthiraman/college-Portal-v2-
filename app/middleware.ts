import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Public routes (No authentication required)
  const publicRoutes = ["/", "/auth/login"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Define role-based access
  const rolePaths: Record<string, string> = {
    SUPER_ADMIN: "/admin",
    COLLEGE: "/college",
    DEPARTMENT: "/department",
    HOD: "/hod",
    FACULTY: "/faculty",
    STUDENT: "/student",
  };

  // Ensure user is accessing their allowed route
  const userRole = token.role; // Ensure your token contains the `role` field
  const allowedPath = rolePaths[userRole];

  if (!allowedPath || !pathname.startsWith(allowedPath)) {
    console.warn(`Unauthorized access attempt by role: ${userRole} to ${pathname}`);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
  matcher: Object.values({
    SUPER_ADMIN: "/admin/:path*",
    COLLEGE: "/college/:path*",
    DEPARTMENT: "/department/:path*",
    HOD: "/hod/:path*",
    FACULTY: "/faculty/:path*",
    STUDENT: "/student/:path*",
  }),
};
