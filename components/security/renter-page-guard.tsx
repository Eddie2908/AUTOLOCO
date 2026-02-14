"use client";

/**
 * Dashboard Renter Page Guard
 * =============================
 * Ensures only renters (locataire) can access this page
 */

import { PageAccessGuard } from "@/components/security/page-access-guard";
import { UnauthorizedPage } from "@/components/security/unauthorized-page";

interface RenterPageGuardProps {
  children: React.ReactNode;
}

export function RenterPageGuard({ children }: RenterPageGuardProps) {
  return (
    <PageAccessGuard requiredRole="locataire" fallback={<UnauthorizedPage />}>
      {children}
    </PageAccessGuard>
  );
}
