"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type BookingItem = {
  id: string
  vehicle: string
  vehicleImage: string
  client: string
  clientImage: string
  clientPhone: string
  startDate: string
  endDate: string
  pickup: string
  dropoff: string
  amount: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  createdAt: string
  startDateIso: string
  endDateIso: string
}

type BookingsResponse = {
  bookings: BookingItem[]
  stats: {
    pending: number
    confirmed: number
    inProgress: number
    thisMonth: number
  }
  calendar: {
    monthLabel: string
    year: number
    month: number
    calendarDays: number[]
    offset: number
    highlightedDays: number[]
    today: number | null
    upcomingBookings: BookingItem[]
  }
}

export default function BookingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<BookingsResponse | null>(null)

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/dashboard/bookings?year=${calendarMonth.year}&month=${calendarMonth.month}`)
        if (!res.ok) return
        const json = (await res.json()) as BookingsResponse
        if (cancelled) return
        setData(json)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [calendarMonth.year, calendarMonth.month])

  const bookings = data?.bookings || []

  const filteredBookings = bookings.filter((booking) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const hay = `${booking.id} ${booking.vehicle} ${booking.client}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (activeTab === "all") return true
    return booking.status === activeTab
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmée", className: "bg-green-500/10 text-green-600 border-green-500/20" }
      case "pending":
        return { label: "En attente", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
      case "completed":
        return { label: "Terminée", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" }
      case "cancelled":
        return { label: "Annulée", className: "bg-red-500/10 text-red-600 border-red-500/20" }
      default:
        return { label: status, className: "bg-gray-500/10 text-gray-600" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Réservations</h1>
          <p className="text-muted-foreground">Gérez toutes vos réservations en un seul endroit.</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "En attente", count: data?.stats?.pending ?? 0, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Confirmées", count: data?.stats?.confirmed ?? 0, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "En cours", count: data?.stats?.inProgress ?? 0, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Ce mois", count: data?.stats?.thisMonth ?? 0, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, index) => (
          <Card
            key={stat.label}
            className={cn(
              "transition-all duration-500 hover:shadow-md",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", stat.bg)}>
                  <Calendar className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bookings list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4 sm:w-auto">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmées</TabsTrigger>
                <TabsTrigger value="completed">Terminées</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 h-9 rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Bookings */}
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status)
              return (
                <Card
                  key={booking.id}
                  className={cn(
                    "overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Vehicle image */}
                      <div className="relative w-full md:w-40 h-32 md:h-auto bg-muted">
                        <img
                          src={booking.vehicleImage || "/placeholder.jpg"}
                          alt={booking.vehicle}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          variant="secondary"
                          className={cn("absolute top-2 left-2 text-xs border", statusConfig.className)}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground font-mono">{booking.id}</span>
                              <span className="text-xs text-muted-foreground">{booking.createdAt}</span>
                            </div>
                            <h3 className="font-semibold">{booking.vehicle}</h3>

                            {/* Client info */}
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={booking.clientImage || "/placeholder-user.jpg"} />
                                <AvatarFallback>{booking.client[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{booking.client}</span>
                            </div>

                            {/* Dates & Location */}
                            <div className="grid gap-2 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {booking.startDate} - {booking.endDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.pickup}</span>
                              </div>
                            </div>
                          </div>

                          {/* Amount & Actions */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">{booking.amount.toLocaleString()} FCFA</p>

                            <div className="flex items-center gap-2 mt-3 justify-end">
                              {booking.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-red-500 hover:text-red-600 bg-transparent"
                                  >
                                    <X className="h-3 w-3" />
                                    Refuser
                                  </Button>
                                  <Button size="sm" className="gap-1 bg-green-500 hover:bg-green-600 text-white">
                                    <Check className="h-3 w-3" />
                                    Accepter
                                  </Button>
                                </>
                              )}
                              {booking.status === "confirmed" && (
                                <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                                  <MessageSquare className="h-3 w-3" />
                                  Contacter
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                  <DropdownMenuItem>Voir le contrat</DropdownMenuItem>
                                  <DropdownMenuItem>Télécharger la facture</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Calendar sidebar */}
        <Card
          className={cn(
            "h-fit transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Calendrier</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setCalendarMonth((prev) => {
                      const d = new Date(prev.year, prev.month, 1)
                      d.setMonth(d.getMonth() - 1)
                      return { year: d.getFullYear(), month: d.getMonth() }
                    })
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setCalendarMonth((prev) => {
                      const d = new Date(prev.year, prev.month, 1)
                      d.setMonth(d.getMonth() + 1)
                      return { year: d.getFullYear(), month: d.getMonth() }
                    })
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{data?.calendar?.monthLabel || ""}</p>
          </CardHeader>
          <CardContent>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                <div key={i} className="p-2 font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: data?.calendar?.offset ?? 0 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {(data?.calendar?.calendarDays || []).map((day) => {
                const hasBooking = (data?.calendar?.highlightedDays || []).includes(day)
                const isToday = day === data?.calendar?.today
                return (
                  <button
                    key={day}
                    className={cn(
                      "p-2 rounded-lg text-sm transition-all hover:bg-muted",
                      isToday && "bg-amber-500 text-white hover:bg-amber-600",
                      hasBooking && !isToday && "bg-amber-500/10 text-amber-600",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Upcoming bookings */}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-medium text-sm mb-3">Prochaines réservations</h4>
              <div className="space-y-3">
                {(data?.calendar?.upcomingBookings || []).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{booking.vehicle}</p>
                      <p className="text-xs text-muted-foreground">{booking.startDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
