"use client";

/**
 * Protected Page Access Hook
 * =========================
 *
 * Implements strict access control for protected pages.
 * Redirects unauthorized users and prevents direct URL access.
 *
 * Usage:
 * - useRequireRole(['admin']) - Only admin
 * - useRequireRole(['proprietaire', 'admin']) - Owner or admin
 * - useRequireRole(['locataire']) - Only renter
 *
 * Convenience hooks:
 * - useIsAdmin() - Check if user is admin
 * - useIsOwner() - Check if user is proprietaire
 * - useIsRenter() - Check if user is locataire
 * - useCanManage() - Check if user is admin or proprietaire
 * - useCanViewAll() - Check if user is admin
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useRequireAuth } from "@/contexts/auth-context";
import type { AuthUser } from "@/contexts/auth-context";
import type { UserType } from "@/lib/auth/config";

type UserRole = "admin" | "proprietaire" | "locataire";

interface UseRequireRoleOptions {
  /** Roles that have access to this page */
  allowedRoles: UserRole[];
  /** Route to redirect to if unauthorized */
  redirectTo?: string;
  /** Allow access if authenticated but role not specified */
  allowAny?: boolean;
}

interface UseRequireRoleReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

/**
 * Hook: useRequireRole
 * Protects pages by checking user role before rendering
 *
 * @example
 * function AdminPage() {
 *   const { isAuthorized, isLoading } = useRequireRole({
 *     allowedRoles: ['admin'],
 *     redirectTo: '/dashboard'
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (!isAuthorized) return null
 *
 *   return <AdminContent />
 * }
 */
export function useRequireRole({
  allowedRoles,
  redirectTo = "/dashboard",
  allowAny = false,
}: UseRequireRoleOptions): UseRequireRoleReturn {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = user?.role as UserRole | undefined;
  const isLoading = authLoading || isChecking;

  // Check authorization
  const isAuthorized =
    isAuthenticated &&
    (allowAny ? true : allowedRoles.includes(userRole || "locataire"));

  useEffect(() => {
    setIsChecking(false);

    // Not authenticated
    if (!authLoading && !isAuthenticated) {
      setError("Authentification requise");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Authenticated but unauthorized (wrong role)
    if (!authLoading && isAuthenticated && !isAuthorized) {
      setError("Vous n'avez pas accès à cette page");
      router.push(redirectTo);
      return;
    }
  }, [authLoading, isAuthenticated, isAuthorized, router, pathname, redirectTo]);

  return {
    isAuthorized,
    isLoading,
    user: (user as AuthUser) || null,
    error,
  };
}

/**
 * Hook: useCanAccess
 * Check if user can access a specific resource/action
 * (without redirecting)
 *
 * @example
 * const canEdit = useCanAccess(['proprietaire', 'admin'])
 * if (canEdit) {
 *   return <EditButton />
 * }
 */
export function useCanAccess(allowedRoles: UserRole[]): boolean {
  const { user } = useAuth();
  const userRole = user?.role as UserRole | undefined;

  return userRole ? allowedRoles.includes(userRole) : false;
}

/**
 * Hook: useRoleBasedAction
 * Execute actions with role verification
 *
 * @example
 * const { can, execute } = useRoleBasedAction('admin', async () => {
 *   await deleteUser(id)
 * })
 *
 * if (can) {
 *   return <button onClick={execute}>Delete</button>
 * }
 */
export function useRoleBasedAction(
  allowedRoles: UserRole[],
  action: () => Promise<void> | void,
) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRole = user?.role as UserRole | undefined;
  const can = userRole ? allowedRoles.includes(userRole) : false;

  const execute = async () => {
    if (!can) {
      setError("Vous n'avez pas la permission d'effectuer cette action");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return { can, execute, isLoading, error };
}

/**
 * Hook: usePageAccessLog
 * Log page access attempts for security monitoring
 */
export function usePageAccessLog(pageName: string) {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      // Log access (in production, send to analytics/logging service)
      const logData = {
        userId: user.id,
        userRole: user.role,
        page: pageName,
        path: pathname,
        timestamp: new Date().toISOString(),
      };

      // Could be sent to logging service
      if (process.env.NODE_ENV === "development") {
        console.log("[Page Access]", logData);
      }
    }
  }, [user, pageName, pathname]);
}

/**
 * Access Control Matrix
 * Defines which roles can access which pages
 */
export const ACCESS_CONTROL_MATRIX = {
  // Admin pages
  "/dashboard/admin/users": ["admin"],
  "/dashboard/admin/analytics": ["admin"],
  "/dashboard/admin/moderation": ["admin"],
  "/dashboard/admin/reports": ["admin"],
  "/dashboard/admin/settings": ["admin"],

  // Owner pages
  "/dashboard/owner/vehicles": ["proprietaire"],
  "/dashboard/owner/analytics": ["proprietaire"],
  "/dashboard/owner/calendar": ["proprietaire"],
  "/dashboard/owner/clients": ["proprietaire"],
  "/dashboard/owner/payments": ["proprietaire"],
  "/dashboard/owner/profile": ["proprietaire"],

  // Renter pages
  "/dashboard/renter/bookings": ["locataire"],
  "/dashboard/renter/favorites": ["locataire"],
  "/dashboard/renter/payments": ["locataire"],
  "/dashboard/renter/profile": ["locataire"],
  "/dashboard/renter/rewards": ["locataire"],

  // Shared pages
  "/dashboard": ["admin", "proprietaire", "locataire"],
  "/dashboard/messages": ["admin", "proprietaire", "locataire"],
  "/dashboard/settings": ["admin", "proprietaire", "locataire"],
  "/dashboard/profile": ["admin", "proprietaire", "locataire"],
  "/dashboard/payments": ["admin", "proprietaire", "locataire"],
  "/dashboard/bookings": ["proprietaire", "locataire"],
} as const;

/**
 * Helper: Check if a path is protected
 */
export function isProtectedPath(path: string): boolean {
  return path in ACCESS_CONTROL_MATRIX;
}

/**
 * Convenience Hooks for Common Permission Checks
 */

/**
 * Check if user is admin
 * @returns true if user role is "admin"
 */
export function useIsAdmin(): boolean {
  const { user } = useRequireAuth();
  return user?.role === "admin";
}

/**
 * Check if user is owner (proprietaire)
 * @returns true if user role is "proprietaire"
 */
export function useIsOwner(): boolean {
  const { user } = useRequireAuth();
  return user?.role === "proprietaire";
}

/**
 * Check if user is renter (locataire)
 * @returns true if user role is "locataire"
 */
export function useIsRenter(): boolean {
  const { user } = useRequireAuth();
  return user?.role === "locataire";
}

/**
 * Check if user can manage resources (admin or owner)
 * @returns true if user is admin or proprietaire
 */
export function useCanManage(): boolean {
  const { user } = useRequireAuth();
  return user?.role === "admin" || user?.role === "proprietaire";
}

/**
 * Check if user can view all data (admin only)
 * @returns true if user is admin
 */
export function useCanViewAll(): boolean {
  const { user } = useRequireAuth();
  return user?.role === "admin";
}

/**
 * Get permission level as number (for comparisons)
 * admin: 3, proprietaire: 2, locataire: 1
 */
export function usePermissionLevel(): number {
  const { user } = useRequireAuth();
  const levels: Record<UserType, number> = {
    admin: 3,
    proprietaire: 2,
    locataire: 1,
  };
  return levels[user?.role || "locataire"];
}

/**
 * Check if user has higher or equal permission than required
 */
export function useHasPermissionLevel(requiredLevel: number): boolean {
  return usePermissionLevel() >= requiredLevel;
}

/**
 * Helper: Get allowed roles for a path
 */
export function getAllowedRolesForPath(path: string): UserRole[] | undefined {
  const roles =
    ACCESS_CONTROL_MATRIX[path as keyof typeof ACCESS_CONTROL_MATRIX];
  return roles ? [...roles] : undefined;
}
