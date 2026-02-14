"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Car,
  DollarSign,
  AlertTriangle,
  Shield,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Flag,
  UserCheck,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type AdminStats = {
  total_users: number
  total_vehicles: number
  total_bookings: number
  total_revenue: number
  new_users_week: number
  new_bookings_week: number
  platform_commission: number
}

type ActivityItem = {
  id: string
  type: string
  user: string
  action: string
  status: string
  time: string
}

type ModerationItem = {
  id: string
  type: string
  title: string
  owner: string
  reason: string
  priority: string
}

type MetricItem = {
  label: string
  value: string
  total: string
  percentage: number
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([])
  const [topMetrics, setTopMetrics] = useState<MetricItem[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) return
        const data = (await res.json()) as Partial<AdminStats>
        if (cancelled) return
        if (
          typeof data.total_users === "number" &&
          typeof data.total_bookings === "number" &&
          typeof data.total_revenue === "number"
        ) {
          setAdminStats(data as AdminStats)
        }
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/dashboard")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (Array.isArray(data?.recentActivities)) setRecentActivities(data.recentActivities)
        if (Array.isArray(data?.moderationQueue)) setModerationQueue(data.moderationQueue)
        if (Array.isArray(data?.topMetrics)) setTopMetrics(data.topMetrics)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const platformStats = [
    {
      title: "Utilisateurs actifs",
      value: (adminStats?.total_users ?? 0).toLocaleString("fr-FR"),
      change: adminStats ? `+${adminStats.new_users_week.toLocaleString("fr-FR")}` : "",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      detail: "",
    },
    {
      title: "Revenus du mois",
      value: (adminStats?.total_revenue ?? 0).toLocaleString("fr-FR"),
      unit: "FCFA",
      change: "",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      detail: adminStats ? `Commission plateforme: ${adminStats.platform_commission.toLocaleString("fr-FR")} FCFA` : "",
    },
    {
      title: "Réservations",
      value: (adminStats?.total_bookings ?? 0).toLocaleString("fr-FR"),
      change: adminStats ? `+${adminStats.new_bookings_week.toLocaleString("fr-FR")}` : "",
      trend: "up",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      detail: "",
    },
    {
      title: "Véhicules",
      value: (adminStats?.total_vehicles ?? 0).toLocaleString("fr-FR"),
      change: "",
      trend: "neutral",
      icon: Car,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      detail: "",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration AUTOLOCO</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme • Décembre 2024</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Rapports
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            asChild
          >
            <Link href="/dashboard/admin/moderation">
              <Shield className="h-4 w-4 mr-2" />
              Modération
            </Link>
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {platformStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("rounded-xl p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                        ? "text-red-500"
                        : "text-muted-foreground",
                  )}
                >
                  {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {stat.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {stat.value}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{stat.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Activités récentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/activities" className="gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 cursor-pointer"
                >
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      activity.status === "pending" && "bg-amber-500/10",
                      activity.status === "urgent" && "bg-red-500/10",
                      activity.status === "success" && "bg-green-500/10",
                      activity.status === "review" && "bg-blue-500/10",
                    )}
                  >
                    {activity.type === "new_user" && <UserCheck className="h-5 w-5 text-amber-500" />}
                    {activity.type === "report" && <Flag className="h-5 w-5 text-red-500" />}
                    {activity.type === "payment" && <DollarSign className="h-5 w-5 text-green-500" />}
                    {activity.type === "vehicle" && <Car className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{activity.user}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          activity.status === "pending" && "bg-amber-500/10 text-amber-600",
                          activity.status === "urgent" && "bg-red-500/10 text-red-600",
                          activity.status === "success" && "bg-green-500/10 text-green-600",
                          activity.status === "review" && "bg-blue-500/10 text-blue-600",
                        )}
                      >
                        {activity.status === "pending" && "En attente"}
                        {activity.status === "urgent" && "Urgent"}
                        {activity.status === "success" && "Succès"}
                        {activity.status === "review" && "À vérifier"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Metrics */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Métriques clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topMetrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm font-bold text-primary">{metric.value}</span>
                  </div>
                  <Progress value={metric.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.total}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "400ms" }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">File de modération</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Éléments nécessitant votre attention</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/moderation">Voir tout ({moderationQueue.length})</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 cursor-pointer"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    item.priority === "urgent" && "bg-red-500/10",
                    item.priority === "high" && "bg-amber-500/10",
                    item.priority === "medium" && "bg-blue-500/10",
                  )}
                >
                  {item.type === "vehicle" && (
                    <Car
                      className={cn(
                        "h-5 w-5",
                        item.priority === "urgent" && "text-red-500",
                        item.priority === "high" && "text-amber-500",
                        item.priority === "medium" && "text-blue-500",
                      )}
                    />
                  )}
                  {item.type === "user" && (
                    <Users
                      className={cn(
                        "h-5 w-5",
                        item.priority === "urgent" && "text-red-500",
                        item.priority === "high" && "text-amber-500",
                        item.priority === "medium" && "text-blue-500",
                      )}
                    />
                  )}
                  {item.type === "report" && (
                    <Flag
                      className={cn(
                        "h-5 w-5",
                        item.priority === "urgent" && "text-red-500",
                        item.priority === "high" && "text-amber-500",
                        item.priority === "medium" && "text-blue-500",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{item.title}</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        item.priority === "urgent" && "bg-red-500/10 text-red-600",
                        item.priority === "high" && "bg-amber-500/10 text-amber-600",
                        item.priority === "medium" && "bg-blue-500/10 text-blue-600",
                      )}
                    >
                      {item.priority === "urgent" && "Urgent"}
                      {item.priority === "high" && "Priorité haute"}
                      {item.priority === "medium" && "Priorité moyenne"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.owner}</p>
                  <p className="text-xs text-muted-foreground mt-1">Raison: {item.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Examiner
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Approuver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "500ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions d'administration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, label: "Gérer utilisateurs", href: "/dashboard/admin/users", color: "bg-blue-500" },
              { icon: Car, label: "Gérer véhicules", href: "/dashboard/admin/vehicles", color: "bg-primary" },
              { icon: MessageSquare, label: "Support client", href: "/dashboard/admin/support", color: "bg-green-500" },
              {
                icon: BarChart3,
                label: "Rapports détaillés",
                href: "/dashboard/admin/analytics",
                color: "bg-purple-500",
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 hover:-translate-y-1"
              >
                <div
                  className={cn("rounded-xl p-3 text-white transition-transform group-hover:scale-110", action.color)}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium flex-1">{action.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
