"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Calendar,
  MapPin,
  Heart,
  CreditCard,
  Star,
  ChevronRight,
  MessageSquare,
  Bell,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type RenterOverview = {
  quickStats: {
    activeBookings: number
    favoris: number
    points: number
    unreadMessages: number
    firstName: string
  }
  recentActivity?: {
    type: string
    text: string
    time: string
  }[]
  activeBookings: {
    id: string
    vehicle: string
    image: string
    owner: string
    dates: string
    location: string
    amount: string
    status: "confirmed" | "upcoming" | "pending" | "cancelled" | "completed"
  }[]
  recommendations: {
    id: string
    name: string
    type: string
    price: string
    rating: number
    image: string
    location: string
  }[]
}

export default function RenterDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [overview, setOverview] = useState<RenterOverview | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/dashboard/renter/overview")
        if (!res.ok) return
        const data = (await res.json()) as RenterOverview
        if (cancelled) return
        setOverview(data)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const quickStats = [
    {
      title: "Réservations actives",
      value: String(overview?.quickStats.activeBookings ?? 0),
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/dashboard/renter/bookings",
    },
    {
      title: "Favoris",
      value: String(overview?.quickStats.favoris ?? 0),
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      href: "/dashboard/renter/favorites",
    },
    {
      title: "Points fidélité",
      value: String(overview?.quickStats.points ?? 0),
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      href: "/dashboard/renter/rewards",
    },
    {
      title: "Messages",
      value: String(overview?.quickStats.unreadMessages ?? 0),
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/dashboard/messages",
    },
  ]

  const activeBookings = overview?.activeBookings ?? []
  const recommendations = overview?.recommendations ?? []

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue{overview?.quickStats.firstName ? `, ${overview.quickStats.firstName}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1">Prêt à partir à l'aventure?</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {overview?.quickStats.unreadMessages ?? 0}
            </span>
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            asChild
          >
            <Link href="/vehicles">
              <Search className="h-4 w-4 mr-2" />
              Rechercher un véhicule
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {quickStats.map((stat, index) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("rounded-xl p-3", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Search */}
      <Card
        className={cn(
          "border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Recherche rapide
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ville ou quartier" className="pl-10 h-12 bg-background" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="date" className="pl-10 h-12 bg-background" />
            </div>
            <Button className="h-12 bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Bookings */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Mes réservations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/renter/bookings" className="gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex gap-4 rounded-xl border border-border p-4 transition-all duration-300 hover:bg-muted/50 hover:border-primary/30 cursor-pointer"
                >
                  <img
                    src={booking.image || "/placeholder.jpg"}
                    alt={booking.vehicle}
                    className="h-24 w-32 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-base">{booking.vehicle}</h4>
                        <p className="text-sm text-muted-foreground">{booking.owner}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          booking.status === "confirmed" && "bg-green-500/10 text-green-600",
                          booking.status === "upcoming" && "bg-blue-500/10 text-blue-600",
                          booking.status === "pending" && "bg-amber-500/10 text-amber-600",
                          booking.status === "completed" && "bg-gray-500/10 text-gray-600",
                          booking.status === "cancelled" && "bg-red-500/10 text-red-600",
                        )}
                      >
                        {booking.status === "confirmed" && "En cours"}
                        {booking.status === "upcoming" && "À venir"}
                        {booking.status === "pending" && "En attente"}
                        {booking.status === "completed" && "Terminée"}
                        {booking.status === "cancelled" && "Annulée"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.dates}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.location}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{booking.amount}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href="/dashboard/renter/bookings">
                          Détails
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(overview?.recentActivity || []).map((activity, index) => {
                const type = (activity.type || "").toLowerCase()

                const config =
                  type.includes("payment")
                    ? { icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" }
                    : type.includes("message")
                      ? { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" }
                      : type.includes("favori")
                        ? { icon: Heart, color: "text-red-500", bg: "bg-red-500/10" }
                        : { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" }

                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn("rounded-lg p-2", config.bg)}>
                      <config.icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "500ms" }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recommandations pour vous</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Véhicules populaires dans votre région</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/vehicles">Voir plus</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.id}`}
                className="group rounded-xl border border-border p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
              >
                <img
                  src={vehicle.image || "/placeholder.jpg"}
                  alt={vehicle.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold">{vehicle.name}</h4>
                    <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{vehicle.price} FCFA/jour</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{vehicle.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {vehicle.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
