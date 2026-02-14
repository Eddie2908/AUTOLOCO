"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Car,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  CreditCard,
  Bell,
  Shield,
  Users,
  BarChart3,
  Flag,
  FileText,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const navigationMenus = {
  renter: [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard/renter" },
    { icon: Calendar, label: "Mes réservations", href: "/dashboard/renter/bookings" },
    { icon: Heart, label: "Favoris", href: "/dashboard/renter/favorites" },
    { icon: CreditCard, label: "Mes paiements", href: "/dashboard/renter/payments" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: User, label: "Mon profil", href: "/dashboard/profile?type=renter" },
    { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
  ],
  owner: [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard/owner" },
    { icon: Car, label: "Mes véhicules", href: "/dashboard/owner/vehicles" },
    { icon: Calendar, label: "Réservations", href: "/dashboard/bookings" },
    { icon: CreditCard, label: "Mes revenus", href: "/dashboard/owner/payments" },
    { icon: BarChart3, label: "Statistiques", href: "/dashboard/owner/analytics" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: User, label: "Mon profil", href: "/dashboard/profile?type=owner" },
    { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard/admin" },
    { icon: Users, label: "Utilisateurs", href: "/dashboard/admin/users" },
    { icon: Car, label: "Véhicules", href: "/dashboard/admin/vehicles" },
    { icon: Calendar, label: "Réservations", href: "/dashboard/admin/bookings" },
    { icon: Shield, label: "Modération", href: "/dashboard/admin/moderation" },
    { icon: Flag, label: "Signalements", href: "/dashboard/admin/reports" },
    { icon: BarChart3, label: "Analyses", href: "/dashboard/admin/analytics" },
    { icon: FileText, label: "Rapports", href: "/dashboard/admin/financial-reports" },
    { icon: MessageSquare, label: "Support", href: "/dashboard/admin/support" },
    { icon: Settings, label: "Configuration", href: "/dashboard/admin/settings" },
  ],
}

const userProfiles = {
  renter: {
    name: "Samuel Mbarga",
    email: "locataire@autoloco.cm",
    avatar: "/placeholder-user.jpg",
    role: "Locataire",
    badge: null,
  },
  owner: {
    name: "Jean-Pierre Kamga",
    email: "proprietaire@autoloco.cm",
    avatar: "/placeholder-user.jpg",
    role: "Propriétaire",
    badge: "Super Host",
  },
  admin: {
    name: "Admin AUTOLOCO",
    email: "admin@autoloco.cm",
    avatar: "/placeholder-user.jpg",
    role: "Administrateur",
    badge: null,
  },
}

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  renter: "Locataire",
  owner: "Propriétaire",
  admin: "Administration",
  vehicles: "Véhicules",
  payments: "Paiements",
  bookings: "Réservations",
  users: "Utilisateurs",
  profile: "Profil",
  messages: "Messages",
  settings: "Paramètres",
  favorites: "Favoris",
  analytics: "Statistiques",
  moderation: "Modération",
  reports: "Signalements",
  support: "Support",
  new: "Nouveau",
  edit: "Modifier",
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userType?: "renter" | "owner" | "admin"
}

export function DashboardLayout({ children, userType = "owner" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  const navigationMenus = {
    renter: [
      { icon: LayoutDashboard, label: t("dashboard.overview"), href: "/dashboard/renter" },
      { icon: Calendar, label: t("dashboard.myBookings"), href: "/dashboard/renter/bookings" },
      { icon: Heart, label: t("dashboard.favorites"), href: "/dashboard/renter/favorites" },
      { icon: CreditCard, label: t("dashboard.payments"), href: "/dashboard/renter/payments" },
      { icon: MessageSquare, label: t("dashboard.messages"), href: "/dashboard/messages" },
      { icon: User, label: t("nav.profile"), href: "/dashboard/profile?type=renter" },
      { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/settings" },
    ],
    owner: [
      { icon: LayoutDashboard, label: t("dashboard.overview"), href: "/dashboard/owner" },
      { icon: Car, label: t("dashboard.myVehicles"), href: "/dashboard/owner/vehicles" },
      { icon: Calendar, label: t("dashboard.myBookings"), href: "/dashboard/bookings" },
      { icon: CreditCard, label: t("dashboard.payments"), href: "/dashboard/owner/payments" },
      { icon: BarChart3, label: t("dashboard.analytics"), href: "/dashboard/owner/analytics" },
      { icon: MessageSquare, label: t("dashboard.messages"), href: "/dashboard/messages" },
      { icon: User, label: t("nav.profile"), href: "/dashboard/profile?type=owner" },
      { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/settings" },
    ],
    admin: [
      { icon: LayoutDashboard, label: t("dashboard.overview"), href: "/dashboard/admin" },
      { icon: Users, label: t("dashboard.admin.totalUsers"), href: "/dashboard/admin/users" },
      { icon: Car, label: t("dashboard.myVehicles"), href: "/dashboard/admin/vehicles" },
      { icon: Calendar, label: t("dashboard.myBookings"), href: "/dashboard/admin/bookings" },
      { icon: Shield, label: "Modération", href: "/dashboard/admin/moderation" },
      { icon: Flag, label: "Signalements", href: "/dashboard/admin/reports" },
      { icon: BarChart3, label: t("dashboard.analytics"), href: "/dashboard/admin/analytics" },
      { icon: FileText, label: "Rapports", href: "/dashboard/admin/financial-reports" },
      { icon: MessageSquare, label: "Support", href: "/dashboard/admin/support" },
      { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/admin/settings" },
    ],
  }

  const userProfiles = {
    renter: {
      name: "Samuel Mbarga",
      email: "locataire@autoloco.cm",
      avatar: "/placeholder-user.jpg",
      role: t("auth.register.renter"),
      badge: null,
    },
    owner: {
      name: "Jean-Pierre Kamga",
      email: "proprietaire@autoloco.cm",
      avatar: "/placeholder-user.jpg",
      role: t("auth.register.owner"),
      badge: "Super Host",
    },
    admin: {
      name: "Admin AUTOLOCO",
      email: "admin@autoloco.cm",
      avatar: "/placeholder-user.jpg",
      role: "Administrateur",
      badge: null,
    },
  }

  const breadcrumbLabels: Record<string, string> = {
    dashboard: "Dashboard",
    renter: t("auth.register.renter"),
    owner: t("auth.register.owner"),
    admin: "Administration",
    vehicles: t("nav.vehicles"),
    payments: t("dashboard.payments"),
    bookings: t("dashboard.myBookings"),
    users: t("dashboard.admin.totalUsers"),
    profile: t("nav.profile"),
    messages: t("dashboard.messages"),
    settings: t("dashboard.settings"),
    favorites: t("dashboard.favorites"),
    analytics: t("dashboard.analytics"),
    moderation: "Modération",
    reports: "Signalements",
    support: "Support",
    new: "Nouveau",
    edit: t("common.edit"),
  }

  const navigation = navigationMenus[userType]
  const user = userProfiles[userType]

  useEffect(() => {
    setMounted(true)
  }, [])

  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: { label: string; href: string }[] = []

    let currentPath = ""
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      // Skip ID segments (like [id])
      if (!segment.startsWith("[") && !segment.match(/^[a-f0-9-]{20,}$/i)) {
        const label = breadcrumbLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbs.push({
          label,
          href: currentPath,
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">AUTOLOCO</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                  {user.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                      {user.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-border p-4">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span>{t("nav.logout")}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <nav className="hidden md:flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className={cn("p-6 transition-opacity duration-500", mounted ? "opacity-100" : "opacity-0")}>
          {children}
        </main>
      </div>
    </div>
  )
}
