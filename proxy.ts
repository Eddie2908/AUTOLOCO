/**
 * Next.js Middleware (proxy.ts)
 * ==============================
 *
 * Handles authentication checks for protected routes and redirects.
 * Works in conjunction with NextAuth sessions and FastAPI backend tokens.
 *
 * Note: This is the primary middleware file for Next.js 16 Turbopack.
 * Do not create a separate middleware.ts file.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/booking",
  "/profile",
  "/vehicles",
  "/favorites",
  "/messages",
  "/notifications",
  "/settings",
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

// Admin-only routes
const ADMIN_ROUTES = ["/dashboard/admin"];

// Owner-only routes
const OWNER_ROUTES = ["/dashboard/owner"];

// Renter-only routes
const RENTER_ROUTES = ["/dashboard/renter"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth is based on backend token stored in httpOnly cookie
  const backendToken = request.cookies.get("autoloco_access_token")?.value;
  const isAuthenticated = !!backendToken;

  // Role is stored in a non-httpOnly cookie for routing/RBAC (no secrets)
  const userRole = request.cookies.get("autoloco_user_role")?.value;

  // Debug logging (disable in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] Processing route:", {
      pathname,
      isAuthenticated,
      userRole,
      backendTokenExists: !!backendToken,
      hasValidRole: !!userRole,
    });
  }

  // Check route types
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isOwnerRoute = OWNER_ROUTES.some((route) => pathname.startsWith(route));
  const isRenterRoute = RENTER_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    // Include the full path with query parameters for proper callback
    const callbackUrl =
      pathname + (request.nextUrl.search ? request.nextUrl.search : "");
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to appropriate dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = getDashboardUrlForRole(userRole);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based access control for specific dashboard routes
  if (isAuthenticated && userRole) {
    // Admin routes - only accessible by admin
    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard/unauthorized", request.url),
      );
    }

    // Owner routes - accessible by owner and admin
    if (isOwnerRoute && userRole !== "proprietaire" && userRole !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard/unauthorized", request.url),
      );
    }

    // Renter routes - accessible by renter and admin
    if (isRenterRoute && userRole !== "locataire" && userRole !== "admin") {
      return NextResponse.redirect(
        new URL("/dashboard/unauthorized", request.url),
      );
    }
  }

  // For authenticated requests to dashboard root, redirect to role-specific dashboard
  if (pathname === "/dashboard" && isAuthenticated && userRole) {
    const roleSpecificDashboard = getDashboardUrlForRole(userRole);
    if (roleSpecificDashboard !== "/dashboard") {
      return NextResponse.redirect(new URL(roleSpecificDashboard, request.url));
    }
  }

  // Add auth headers to the response for downstream use
  const response = NextResponse.next();

  // Pass authentication status to the request
  if (isAuthenticated) {
    response.headers.set("x-user-authenticated", "true");
    if (userRole) {
      response.headers.set("x-user-role", userRole);
    }
  }

  // Ajouter les headers de sécurité
  // Protection contre le clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Protection XSS
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Force HTTPS en production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || "") + ";"
  );
  
  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

/**
 * Get the appropriate dashboard URL based on user role
 */
function getDashboardUrlForRole(role?: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "proprietaire":
      return "/dashboard/owner";
    case "locataire":
      return "/dashboard/renter";
    default:
      return "/dashboard";
  }
}

export const config = {
  // Define which routes the middleware should apply to
  matcher: [
    // Protected dashboard routes
    "/dashboard/:path*",
    // Booking routes
    "/booking/:path*",
    // User profile routes
    "/profile/:path*",
    // Vehicle management
    "/vehicles/:path*",
    // Favorites
    "/favorites/:path*",
    // Messages
    "/messages/:path*",
    // Notifications
    "/notifications/:path*",
    // Settings
    "/settings/:path*",
    // Auth routes (to redirect authenticated users)
    "/auth/:path*",
  ],
};
