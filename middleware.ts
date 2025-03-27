import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("Middleware executed for:", pathname);

  // Exclude static assets, images, and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow public routes without token validation
  const publicRoutes = ["/", "/auth/login", "/home"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Validate token for protected routes
  const token: any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("Token:", token);

  if (!token || (token.exp && token.exp * 1000 <= Date.now())) {
    console.warn("No valid token found, redirecting to /auth/login...");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Role-based route protection
  const rolePaths: Record<string, string> = {
    SUPER_ADMIN: "/admin",
    COLLEGE: "/college",
    DEPARTMENT: "/department",
    HOD: "/hod",
    FACULTY: "/faculty",
    STUDENT: "/student",
  };

  const userRole = token.role;
  const allowedPath = rolePaths[userRole];
  console.log("UserRole:", userRole, "AllowedPath:", allowedPath);

  if (!allowedPath || !pathname.startsWith(allowedPath)) {
    console.warn(`Unauthorized access attempt by role: ${userRole} to ${pathname}`);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

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
