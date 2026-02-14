"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type CalendarBooking = {
  id: string
  vehicle: string
  renter: string
  renterAvatar: string
  startDate: string
  endDate: string
  pickup: string
  amount: number
  status: "confirmed" | "pending" | "cancelled" | "dispute"
}

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export default function OwnerCalendarPage() {
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookingsData, setBookingsData] = useState<CalendarBooking[]>([])
  const [statsData, setStatsData] = useState<{ bookingsThisMonth: number; occupancyRate: number; uniqueClients: number } | null>(
    null,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()

    ;(async () => {
      try {
        const res = await fetch(`/api/dashboard/owner/calendar?year=${y}&month=${m}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setBookingsData(Array.isArray(data?.bookings) ? data.bookings : [])
        setStatsData(data?.stats || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [currentDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return bookingsData.filter((booking) => {
      return dateStr >= booking.startDate && dateStr <= booking.endDate
    })
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const days = getDaysInMonth(currentDate)
  const bookingsForSelectedDate = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendrier des réservations</h1>
          <p className="text-muted-foreground mt-1">Visualisez toutes vos réservations en un coup d'œil</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Bloquer des dates
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "100ms" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }
                const bookings = getBookingsForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-2 rounded-lg border border-border hover:border-primary/50 transition-all relative",
                      isToday && "border-primary bg-primary/5",
                      isSelected && "bg-primary text-primary-foreground border-primary",
                      bookings.length > 0 && !isSelected && "bg-green-500/10 border-green-500/30",
                    )}
                  >
                    <span className={cn("text-sm font-medium", isSelected && "text-primary-foreground")}>
                      {day.getDate()}
                    </span>
                    {bookings.length > 0 && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {bookings.slice(0, 3).map((_, i) => (
                          <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bookings for selected date */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`
                : "Sélectionnez une date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Cliquez sur une date dans le calendrier pour voir les réservations
                </p>
              </div>
            ) : bookingsForSelectedDate.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Aucune réservation pour cette date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsForSelectedDate.map((booking) => (
                  <Card key={booking.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            Confirmée
                          </Badge>
                          <p className="text-xs text-muted-foreground font-mono">{booking.id}</p>
                        </div>
                        <div>
                          <p className="font-semibold">{booking.vehicle}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.startDate).toLocaleDateString("fr-FR")} -{" "}
                            {new Date(booking.endDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={booking.renterAvatar || "/placeholder-user.jpg"} />
                            <AvatarFallback>{booking.renter[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{booking.renter}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {booking.pickup}
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-primary">{booking.amount.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-3 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "300ms" }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-3 bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookingsData.length}</p>
                <p className="text-sm text-muted-foreground">Réservations ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-3 bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(statsData?.occupancyRate ?? 0).toString()}%</p>
                <p className="text-sm text-muted-foreground">Taux d'occupation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-3 bg-blue-500/10">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(statsData?.uniqueClients ?? 0).toString()}</p>
                <p className="text-sm text-muted-foreground">Clients uniques</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
