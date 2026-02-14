"use client";

import type React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
  LayoutDashboard,
  Calendar,
  Heart,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  FileText,
  Wrench,
  HelpCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/contexts/auth-context";
import { NotificationCenter } from "@/components/notifications/notification-center";

// Navigation items configuration per role
const navigationConfig = {
  locataire: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/renter" },
    { icon: Calendar, label: "Mes reservations", href: "/dashboard/renter/bookings" },
    { icon: Heart, label: "Favoris", href: "/dashboard/renter/favorites" },
    { icon: CreditCard, label: "Paiements", href: "/dashboard/renter/payments" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: User, label: "Mon profil", href: "/dashboard/profile" },
    { icon: Settings, label: "Parametres", href: "/dashboard/settings" },
  ],
  proprietaire: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/owner" },
    { icon: Car, label: "Mes vehicules", href: "/dashboard/owner/vehicles" },
    { icon: Calendar, label: "Mes reservations", href: "/dashboard/bookings" },
    { icon: CreditCard, label: "Paiements", href: "/dashboard/owner/payments" },
    { icon: BarChart3, label: "Statistiques", href: "/dashboard/owner/analytics" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: User, label: "Mon profil", href: "/dashboard/owner/profile" },
    { icon: Settings, label: "Parametres", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/admin" },
    { icon: Car, label: "Mes vehicules", href: "/dashboard/admin/vehicles" },
    { icon: Calendar, label: "Mes reservations", href: "/dashboard/admin/bookings" },
    { icon: Shield, label: "Moderation", href: "/dashboard/admin/moderation" },
    { icon: FileText, label: "Signalements", href: "/dashboard/admin/reports" },
    { icon: BarChart3, label: "Statistiques", href: "/dashboard/admin/analytics" },
    { icon: Users, label: "Rapports", href: "/dashboard/admin/financial-reports" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: HelpCircle, label: "Support", href: "/dashboard/admin/support" },
    { icon: Settings, label: "Parametres", href: "/dashboard/admin/settings" },
  ],
};

// Breadcrumb labels mapping
const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  renter: "Locataire",
  owner: "Proprietaire",
  admin: "Administration",
  vehicles: "Vehicules",
  payments: "Paiements",
  bookings: "Reservations",
  users: "Utilisateurs",
  profile: "Profil",
  messages: "Messages",
  settings: "Parametres",
  favorites: "Favoris",
  analytics: "Statistiques",
  moderation: "Moderation",
  reports: "Signalements",
  support: "Support",
  new: "Nouveau",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, logout, isDemoUser } = useRequireAuth();

  // Get user role and navigation items
  const userRole = (user?.role || "locataire") as "admin" | "proprietaire" | "locataire";
  const navigation = navigationConfig[userRole] || navigationConfig.locataire;

  // Generate breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    let currentPath = "";

    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      // Skip ID segments
      if (!segment.match(/^[a-f0-9-]{20,}$/i)) {
        const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        crumbs.push({ label, href: currentPath });
      }
    });

    return crumbs;
  }, [pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Get user display info
  const userName = user?.name || "Utilisateur";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userRoleLabel =
    userRole === "admin"
      ? "Administrateur"
      : userRole === "proprietaire"
        ? "Proprietaire"
        : "Locataire";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[280px] bg-card border-r border-border transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AUTOLOCO</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userRoleLabel}
              </p>
            </div>
            {isDemoUser && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs">
                Demo
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Add vehicle CTA - Only for owners */}
        {userRole === "proprietaire" && (
          <div className="border-t border-border p-4 flex-shrink-0">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white gap-2"
              asChild
            >
              <Link href="/dashboard/vehicles/new">
                <Plus className="h-4 w-4" />
                Ajouter un vehicule
              </Link>
            </Button>
          </div>
        )}

        {/* Logout */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[280px] min-h-screen flex flex-col">
        {/* Top header - Single header, no duplicates */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-muted transition-colors lg:hidden flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumbs - Hidden on mobile, visible on tablet and up */}
          <nav className="hidden md:flex items-center gap-1 text-sm flex-1 min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground truncate">{crumb.label}</span>
                ) : (
                  <Link 
                    href={crumb.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile title */}
          <div className="md:hidden flex-1 min-w-0">
            <span className="font-medium text-sm truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />

            {/* Notifications */}
            <NotificationCenter />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium max-w-[100px] truncate">
                    {userName.split(" ")[0]}
                    {userName.split(" ")[1] ? ` ${userName.split(" ")[1][0]}.` : ""}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Parametres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Deconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content - Single content area, no nested layouts adding more headers */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
