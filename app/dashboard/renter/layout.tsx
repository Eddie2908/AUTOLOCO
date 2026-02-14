import type React from "react";
import { RenterPageGuard } from "@/components/security/renter-page-guard";

export default function RenterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RenterPageGuard>
      {children}
    </RenterPageGuard>
  );
}
