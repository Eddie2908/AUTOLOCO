import type React from "react";
import { OwnerPageGuard } from "@/components/security/owner-page-guard";

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OwnerPageGuard>
      {children}
    </OwnerPageGuard>
  );
}
