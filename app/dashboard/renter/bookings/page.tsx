"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Search, ChevronRight, Star, MessageSquare, Download, AlertCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type RenterBooking = {
  id: string
  bookingDbId?: string
  vehicleId?: string
  vehicle: string
  vehicleImage: string
  owner: string
  ownerImage: string
  ownerPhone: string
  startDate: string
  endDate: string
  startDateDisplay: string
  endDateDisplay: string
  pickup: string
  dropoff: string
  amount: number
  status: "active" | "upcoming" | "completed"
  progress: number
  canReview: boolean
}

export default function RenterBookingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const [bookings, setBookings] = useState<RenterBooking[]>([])
  const [statsData, setStatsData] = useState<{ active: number; upcoming: number; completed: number; total: number } | null>(
    null,
  )
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancelBooking = async (booking: RenterBooking) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return
    const dbId = booking.bookingDbId || booking.id
    setCancellingId(booking.id)
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: dbId, motif: "Annulée par le locataire depuis le dashboard" }),
      })
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== booking.id))
      }
    } catch {
      // ignore
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/renter/bookings")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setBookings(Array.isArray(data?.bookings) ? data.bookings : [])
        setStatsData(data?.stats || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true
    return booking.status === activeTab
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "En cours", className: "bg-green-500/10 text-green-600 border-green-500/20" }
      case "upcoming":
        return { label: "À venir", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
      case "completed":
        return { label: "Terminée", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" }
      default:
        return { label: status, className: "bg-gray-500/10 text-gray-600" }
    }
  }

  const stats = {
    active: statsData?.active ?? bookings.filter((b) => b.status === "active").length,
    upcoming: statsData?.upcoming ?? bookings.filter((b) => b.status === "upcoming").length,
    completed: statsData?.completed ?? bookings.filter((b) => b.status === "completed").length,
    total: statsData?.total ?? bookings.length,
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes réservations</h1>
          <p className="text-muted-foreground mt-1">Gérez toutes vos locations en un seul endroit</p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
          asChild
        >
          <Link href="/vehicles">
            <Search className="h-4 w-4 mr-2" />
            Nouvelle location
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {[
          { label: "En cours", count: stats.active, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "À venir", count: stats.upcoming, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Terminées", count: stats.completed, color: "text-gray-500", bg: "bg-gray-500/10" },
          { label: "Total", count: stats.total, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <Card key={stat.label} className="transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-3", stat.bg)}>
                  <Calendar className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher une réservation..."
            className="w-full sm:w-64 h-10 rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Bookings list */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card
            className={cn(
              "transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: "300ms" }}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Vous n'avez pas encore de réservation. Explorez nos véhicules disponibles et réservez dès maintenant!
              </p>
              <Button className="mt-6" asChild>
                <Link href="/vehicles">Explorer les véhicules</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status)
            return (
              <Card
                key={booking.id}
                className={cn(
                  "overflow-hidden transition-all duration-500 hover:shadow-lg",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Vehicle image */}
                    <div className="relative lg:w-64 h-48 lg:h-auto rounded-xl overflow-hidden bg-muted">
                      <img
                        src={booking.vehicleImage || "/placeholder.jpg"}
                        alt={booking.vehicle}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className={cn("absolute top-3 left-3 text-xs border", statusConfig.className)}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{booking.vehicle}</h3>
                            <p className="text-sm text-muted-foreground font-mono">{booking.id}</p>
                          </div>
                          <p className="text-xl font-bold text-primary">{booking.amount.toLocaleString()} FCFA</p>
                        </div>

                        {/* Owner info */}
                        <Link
                          href="/dashboard/messages"
                          className="group inline-flex items-center gap-2 mt-2 hover:text-primary transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={booking.ownerImage || "/placeholder-user.jpg"} />
                            <AvatarFallback>{booking.owner[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{booking.owner}</span>
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>

                      {/* Dates & Location */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Période</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.startDateDisplay} - {booking.endDateDisplay}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Lieu de prise en charge</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{booking.pickup}</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress (for active bookings) */}
                      {booking.status === "active" && (
                        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Location en cours</span>
                            <span className="text-primary font-semibold">{booking.progress}%</span>
                          </div>
                          <Progress value={booking.progress} className="h-2" />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/messages">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Facture
                        </Button>
                        {booking.canReview && (
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                            <Star className="h-4 w-4 mr-2" />
                            Laisser un avis
                          </Button>
                        )}
                        {booking.status === "upcoming" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancellingId === booking.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {cancellingId === booking.id ? "Annulation..." : "Annuler"}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/vehicles/${booking.vehicleId || ""}`}>
                            Voir le véhicule
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
