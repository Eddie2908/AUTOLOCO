"use client";

/**
 * Dashboard Admin Page Guard
 * ===========================
 * Ensures only admins can access this page
 */

import { PageAccessGuard } from "@/components/security/page-access-guard";
import { UnauthorizedPage } from "@/components/security/unauthorized-page";

interface AdminPageGuardProps {
  children: React.ReactNode;
}

export function AdminPageGuard({ children }: AdminPageGuardProps) {
  return (
    <PageAccessGuard requiredRole="admin" fallback={<UnauthorizedPage />}>
      {children}
    </PageAccessGuard>
  );
}
