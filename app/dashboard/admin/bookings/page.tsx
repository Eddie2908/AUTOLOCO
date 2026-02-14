"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Search,
  MoreVertical,
  Eye,
  X,
  RefreshCw,
  AlertTriangle,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import { cn } from "@/lib/utils"
import {
  bookingStatusLabels,
  bookingStatusColors,
} from "@/lib/constants/admin"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type AdminBooking = any

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [statsData, setStatsData] = useState<
    { today: number; thisWeek: number; disputes: number; cancellationRate: number } | null
  >(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/bookings")
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
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renterName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesCity = cityFilter === "all" || booking.city === cityFilter
    return matchesSearch && matchesStatus && matchesCity
  })

  const handleViewDetails = (booking: AdminBooking) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
  }

  const stats = [
    {
      title: "Aujourd'hui",
      value: statsData?.today ?? 0,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Cette semaine",
      value: statsData?.thisWeek ?? 0,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Litiges en cours",
      value: statsData?.disputes ?? 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Taux annulation",
      value: `${statsData?.cancellationRate ?? 0}%`,
      icon: XCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  const cities = [...new Set(bookings.map((b) => b.city))]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestion des réservations</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Supervisez toutes les réservations de la plateforme</p>
        </div>
        <Button variant="outline" className="bg-transparent w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2 md:p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card
        className={cn(
          "transition-all duration-500 overflow-hidden",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base md:text-lg">Toutes les réservations</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmée</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                  <SelectItem value="dispute">Litige</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead className="hidden md:table-cell">Locataire</TableHead>
                <TableHead className="hidden lg:table-cell">Propriétaire</TableHead>
                <TableHead className="hidden sm:table-cell">Dates</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="cursor-pointer" onClick={() => handleViewDetails(booking)}>
                  <TableCell className="font-medium text-xs md:text-sm">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 md:gap-3">
                      <img
                        src={booking.vehicleImage || "/placeholder.jpg"}
                        alt={booking.vehicleName}
                        className="h-10 w-14 rounded-lg object-cover hidden sm:block"
                      />
                      <span className="text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{booking.vehicleName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.renterAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{booking.renterName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{booking.renterName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.ownerAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{booking.ownerName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{booking.ownerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs md:text-sm">
                    {format(new Date(booking.startDate), "dd/MM")} - {format(new Date(booking.endDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="font-medium text-xs md:text-sm">{booking.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", bookingStatusColors[booking.status])}>
                      {bookingStatusLabels[booking.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contacter les parties
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rembourser
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune réservation trouvée</h3>
              <p className="text-muted-foreground">Aucune réservation ne correspond à vos critères.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la réservation</SheetTitle>
            <SheetDescription>{selectedBooking?.id}</SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="mt-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge className={cn("text-sm", bookingStatusColors[selectedBooking.status])}>
                  {bookingStatusLabels[selectedBooking.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Créée le {format(new Date(selectedBooking.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>

              {/* Vehicle */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={selectedBooking.vehicleImage || "/placeholder.jpg"}
                      alt={selectedBooking.vehicleName}
                      className="h-20 w-28 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{selectedBooking.vehicleName}</h4>
                      <p className="text-sm text-muted-foreground">{selectedBooking.city}</p>
                      <p className="text-lg font-bold text-primary mt-2">
                        {selectedBooking.amount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parties */}
              <div className="space-y-4">
                <h4 className="font-semibold">Parties impliquées</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedBooking.renterAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{selectedBooking.renterName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedBooking.renterName}</p>
                        <p className="text-xs text-muted-foreground">Locataire</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedBooking.ownerAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback>{selectedBooking.ownerName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedBooking.ownerName}</p>
                        <p className="text-xs text-muted-foreground">Propriétaire</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold">Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Début</p>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.startDate), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Fin</p>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.endDate), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-semibold">Actions administrateur</h4>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start bg-transparent">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Confirmer manuellement
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                    Effectuer un remboursement
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ouvrir un ticket support
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-destructive hover:text-destructive bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler la réservation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
