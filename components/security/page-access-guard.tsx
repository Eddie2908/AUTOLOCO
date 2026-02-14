"use client";

/**
 * Page Access Control Guard
 * ==========================
 *
 * Ensures strict role-based access control at page level.
 * Prevents unauthorized users from viewing restricted content.
 *
 * Usage:
 * <PageAccessGuard requiredRole="admin">
 *   <AdminDashboard />
 * </PageAccessGuard>
 */

import { useRequireAuth } from "@/contexts/auth-context";
import type { UserType } from "@/lib/auth/config";
import { UnauthorizedPage } from "./unauthorized-page";

interface PageAccessGuardProps {
  children: React.ReactNode;
  requiredRole: UserType | UserType[];
  fallback?: React.ReactNode;
}

/**
 * Component: PageAccessGuard
 * Wraps pages to enforce role-based access control
 */
export function PageAccessGuard({
  children,
  requiredRole,
  fallback,
}: PageAccessGuardProps) {
  const { user, isLoading } = useRequireAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Vérification d'accès...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  const hasAccess =
    user &&
    (Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole);

  // No access
  if (!hasAccess) {
    return fallback || <UnauthorizedPage userRole={user?.role} />;
  }

  // Has access - render children
  return <>{children}</>;
}

/**
 * Hook: usePageAccess
 * Check if current user has access to a page
 */
export function usePageAccess(requiredRole: UserType | UserType[]) {
  const { user, isLoading } = useRequireAuth();

  const canAccess =
    !isLoading &&
    user &&
    (Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole);

  const currentRole = user?.role;
  const hasRequiredRole =
    currentRole &&
    (Array.isArray(requiredRole)
      ? requiredRole.includes(currentRole)
      : currentRole === requiredRole);

  return {
    canAccess,
    currentRole,
    hasRequiredRole,
    isLoading,
    isChecking: isLoading,
  };
}
