"use client";

/**
 * Role-Based Secure Navigation Component
 * ======================================
 *
 * This component provides navigation items for the dashboard sidebar.
 * It filters items based on user role to ensure users only see what they can access.
 * 
 * Note: The main navigation is now handled directly in /app/dashboard/layout.tsx
 * This component can be used for additional navigation needs.
 */

import type React from "react";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  MessageSquare,
  Heart,
  CreditCard,
  Settings,
  Users,
  BarChart3,
  Shield,
  FileText,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Navigation items per role - simplified version
const NAV_ITEMS_BY_ROLE = {
  locataire: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/renter" },
    { icon: Calendar, label: "Mes reservations", href: "/dashboard/renter/bookings" },
    { icon: Heart, label: "Favoris", href: "/dashboard/renter/favorites" },
    { icon: CreditCard, label: "Paiements", href: "/dashboard/renter/payments" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Settings, label: "Parametres", href: "/dashboard/settings" },
  ],
  proprietaire: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/owner" },
    { icon: Car, label: "Mes vehicules", href: "/dashboard/owner/vehicles" },
    { icon: Calendar, label: "Reservations", href: "/dashboard/bookings" },
    { icon: CreditCard, label: "Paiements", href: "/dashboard/owner/payments" },
    { icon: BarChart3, label: "Statistiques", href: "/dashboard/owner/analytics" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Settings, label: "Parametres", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/admin" },
    { icon: Users, label: "Utilisateurs", href: "/dashboard/admin/users" },
    { icon: Car, label: "Vehicules", href: "/dashboard/admin/vehicles" },
    { icon: Calendar, label: "Reservations", href: "/dashboard/admin/bookings" },
    { icon: Shield, label: "Moderation", href: "/dashboard/admin/moderation" },
    { icon: FileText, label: "Signalements", href: "/dashboard/admin/reports" },
    { icon: BarChart3, label: "Statistiques", href: "/dashboard/admin/analytics" },
    { icon: HelpCircle, label: "Support", href: "/dashboard/admin/support" },
    { icon: Settings, label: "Parametres", href: "/dashboard/admin/settings" },
  ],
};

interface RoleBasedNavProps {
  userRole: "admin" | "proprietaire" | "locataire";
  currentPath: string;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
  badgeCounts?: {
    messages?: number;
    notifications?: number;
    favoris?: number;
    reservations?: number;
  };
}

export function RoleBasedNavigation({
  userRole,
  currentPath,
  onLogout,
  onNavigate,
  badgeCounts = {},
}: RoleBasedNavProps) {
  const pathname = usePathname();

  // Get navigation items for the user role
  const navItems = useMemo(() => {
    return NAV_ITEMS_BY_ROLE[userRole] || NAV_ITEMS_BY_ROLE.locataire;
  }, [userRole]);

  return (
    <nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const badgeCount = item.label === "Messages" ? badgeCounts.messages : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {badgeCount && badgeCount > 0 && (
              <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </Link>
        );
      })}

      {/* Logout button */}
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Deconnexion</span>
        </Button>
      </div>
    </nav>
  );
}

// Export for use in other components
export { NAV_ITEMS_BY_ROLE };
