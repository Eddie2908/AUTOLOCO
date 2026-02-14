"use client";

/**
 * Dashboard Owner Page Guard
 * ============================
 * Ensures only owners (proprietaire) can access this page
 */

import { PageAccessGuard } from "@/components/security/page-access-guard";
import { UnauthorizedPage } from "@/components/security/unauthorized-page";

interface OwnerPageGuardProps {
  children: React.ReactNode;
}

export function OwnerPageGuard({ children }: OwnerPageGuardProps) {
  return (
    <PageAccessGuard
      requiredRole="proprietaire"
      fallback={<UnauthorizedPage />}
    >
      {children}
    </PageAccessGuard>
  );
}
