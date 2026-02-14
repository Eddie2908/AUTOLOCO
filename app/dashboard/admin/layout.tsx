import type React from "react";
import { AdminPageGuard } from "@/components/security/admin-page-guard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageGuard>
      {children}
    </AdminPageGuard>
  );
}
