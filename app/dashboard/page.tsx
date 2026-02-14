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
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type DashboardSummary = {
  user: { firstName: string; userType: string }
  stats: { monthRevenue: number; activeBookings: number; vehiclesListed: number; viewsThisMonth: number }
  recentBookings: {
    id: number
    bookingId: string
    vehicle: string
    client: string
    clientImage: string
    dates: string
    amount: number
    status: "confirmed" | "pending" | "completed" | "cancelled"
  }[]
  topVehicles: { name: string; bookings: number; revenue: number; rating: number }[]
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/dashboard/summary")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setSummary(data || null)
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
      value: (summary?.stats?.monthRevenue || 0).toLocaleString(),
      unit: "FCFA",
      change: "+0%",
      trend: "neutral",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Réservations actives",
      value: (summary?.stats?.activeBookings || 0).toString(),
      unit: "",
      change: "+0",
      trend: "neutral",
      icon: Calendar,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Véhicules listés",
      value: (summary?.stats?.vehiclesListed || 0).toString(),
      unit: "",
      change: "0",
      trend: "neutral",
      icon: Car,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Vues ce mois",
      value: (summary?.stats?.viewsThisMonth || 0).toLocaleString(),
      unit: "",
      change: "+0%",
      trend: "neutral",
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  const recentBookings = summary?.recentBookings || []
  const topVehicles = summary?.topVehicles || []

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue{summary?.user?.firstName ? `, ${summary.user.firstName}` : ""}! Voici un aperçu de votre activité.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/owner/vehicles">Gérer mes véhicules</Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            asChild
          >
            <Link href="/dashboard/vehicles/new">Ajouter un véhicule</Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className={cn(
              "relative overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
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
          style={{ transitionDelay: "400ms" }}
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
              {recentBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50",
                    mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                  )}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
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
                          booking.status === "completed" && "bg-blue-500/10 text-blue-600",
                        )}
                      >
                        {booking.status === "confirmed" && "Confirmée"}
                        {booking.status === "pending" && "En attente"}
                        {booking.status === "completed" && "Terminée"}
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
                    <p className="font-semibold text-amber-600">{booking.amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top vehicles */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "500ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Véhicules populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.name}
                  className={cn(
                    "space-y-3 transition-all duration-300",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{vehicle.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{vehicle.bookings} réservations</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {vehicle.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-amber-600">{vehicle.revenue.toLocaleString()} FCFA</p>
                  </div>
                  <Progress value={(vehicle.revenue / 500000) * 100} className="h-2 bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "700ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Car, label: "Ajouter un véhicule", href: "/dashboard/vehicles/new", color: "bg-amber-500" },
              { icon: Calendar, label: "Voir le calendrier", href: "/dashboard/bookings", color: "bg-blue-500" },
              { icon: TrendingUp, label: "Statistiques", href: "/dashboard/analytics", color: "bg-green-500" },
              { icon: MapPin, label: "Géolocalisation", href: "/dashboard/tracking", color: "bg-purple-500" },
            ].map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-amber-500/30 hover:-translate-y-1",
                  mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
                )}
                style={{ transitionDelay: `${800 + index * 50}ms` }}
              >
                <div
                  className={cn("rounded-xl p-3 text-white transition-transform group-hover:scale-110", action.color)}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{action.label}</span>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
