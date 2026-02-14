"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Car,
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock,
  Plus,
  Users,
  Activity,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type OwnerOverviewResponse = {
  stats: {
    monthRevenue: number
    monthBookings: number
    occupancyRate: number
    avgRating: number
  }
  performanceTips?: {
    icon: string
    title: string
    description: string
    color: string
    bg: string
  }[]
  quickActions?: {
    icon: string
    label: string
    href: string
    color: string
  }[]
  recentBookings: {
    id: string
    vehicle: string
    client: string
    clientImage: string
    dates: string
    amount: string
    status: "confirmed" | "pending" | "cancelled" | "dispute"
  }[]
  vehiclePerformance: {
    name: string
    bookings: number
    revenue: number
    rating: number
    views: number
    occupancy: number
  }[]
}

export default function OwnerDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [overview, setOverview] = useState<OwnerOverviewResponse | null>(null)

  const iconMap: Record<string, any> = {
    trending_up: TrendingUp,
    star: Star,
    eye: Eye,
    clock: Clock,
    plus: Plus,
    calendar: Calendar,
    users: Users,
    dollar_sign: DollarSign,
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/dashboard/owner/overview")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setOverview(data || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      title: "Revenus du mois",
      value: (overview?.stats?.monthRevenue || 0).toLocaleString(),
      unit: "FCFA",
      change: "+0%",
      trend: "neutral",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Réservations",
      value: (overview?.stats?.monthBookings || 0).toString(),
      unit: "",
      change: "+0",
      trend: "neutral",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Taux d'occupation",
      value: (overview?.stats?.occupancyRate || 0).toString(),
      unit: "%",
      change: "+0%",
      trend: "neutral",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Note moyenne",
      value: (overview?.stats?.avgRating || 0).toString(),
      unit: "",
      change: "+0",
      trend: "neutral",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  const recentBookings = overview?.recentBookings || []
  const vehiclePerformance = overview?.vehiclePerformance || []

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
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord propriétaire</h1>
          <p className="text-muted-foreground mt-1">Gérez vos véhicules et suivez vos performances</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/vehicles">
              <Car className="h-4 w-4 mr-2" />
              Mes véhicules
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            asChild
          >
            <Link href="/dashboard/vehicles/new">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">
                  {stat.value}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Réservations récentes</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/bookings">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 cursor-pointer"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-border">
                    <AvatarImage src={booking.clientImage || "/placeholder-user.jpg"} />
                    <AvatarFallback>{booking.client[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{booking.client}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          booking.status === "confirmed" && "bg-green-500/10 text-green-600",
                          booking.status === "pending" && "bg-amber-500/10 text-amber-600",
                          booking.status === "cancelled" && "bg-red-500/10 text-red-600",
                          booking.status === "dispute" && "bg-purple-500/10 text-purple-600",
                        )}
                      >
                        {booking.status === "confirmed" && "Confirmée"}
                        {booking.status === "pending" && "En attente"}
                        {booking.status === "cancelled" && "Annulée"}
                        {booking.status === "dispute" && "Litige"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{booking.vehicle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.dates}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{booking.amount}</p>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Conseils performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(overview?.performanceTips || []).map((tip, index) => {
                const TipIcon = iconMap[tip.icon] || Activity
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn("rounded-lg p-2 flex-shrink-0", tip.bg)}>
                      <TipIcon className={cn("h-4 w-4", tip.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tip.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Performance */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "400ms" }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Performance de vos véhicules</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Statistiques détaillées de ce mois</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques détaillées
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {vehiclePerformance.map((vehicle) => (
              <div
                key={vehicle.name}
                className="space-y-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{vehicle.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {vehicle.bookings} réservations
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {vehicle.views} vues
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {vehicle.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{vehicle.revenue.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">Revenu total</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taux d'occupation</span>
                    <span className="font-medium">{vehicle.occupancy}%</span>
                  </div>
                  <Progress value={vehicle.occupancy} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "500ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(overview?.quickActions || []).map((action) => {
              const ActionIcon = iconMap[action.icon] || ChevronRight
              return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 hover:-translate-y-1"
              >
                <div
                  className={cn("rounded-xl p-3 text-white transition-transform group-hover:scale-110", action.color)}
                >
                  <ActionIcon className="h-5 w-5" />
                </div>
                <span className="font-medium">{action.label}</span>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
