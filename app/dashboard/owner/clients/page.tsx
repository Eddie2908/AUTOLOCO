"use client"

import { useState, useEffect } from "react"
import { Users, Star, Calendar, DollarSign, Search, Filter, MoreVertical, MessageSquare, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ClientRow = {
  id: string
  name: string
  avatar: string
  email: string
  phone: string
  totalBookings: number
  totalSpent: number
  lastBooking: string
  rating: number
  status: "excellent" | "good" | "new"
  memberSince: string
}

export default function OwnerClientsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<ClientRow[]>([])
  const [statsData, setStatsData] = useState<
    { totalClients: number; loyalClients: number; newThisMonth: number; totalRevenue: number } | null
  >(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/dashboard/owner/clients")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setClients(Array.isArray(data?.clients) ? data.clients : [])
        setStatsData(data?.stats || null)
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
      title: "Total clients",
      value: (statsData?.totalClients ?? clients.length).toString(),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Clients fidèles",
      value: (statsData?.loyalClients ?? clients.filter((c) => c.totalBookings >= 5).length).toString(),
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Nouveaux ce mois",
      value: (statsData?.newThisMonth ?? 0).toString(),
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Revenus totaux",
      value: `${((statsData?.totalRevenue ?? clients.reduce((sum, c) => sum + c.totalSpent, 0)) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "excellent":
        return { label: "Excellent", className: "bg-green-500/10 text-green-600" }
      case "good":
        return { label: "Bon", className: "bg-blue-500/10 text-blue-600" }
      case "new":
        return { label: "Nouveau", className: "bg-amber-500/10 text-amber-600" }
      default:
        return { label: status, className: "bg-gray-500/10 text-gray-600" }
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold tracking-tight">Mes clients</h1>
          <p className="text-muted-foreground mt-1">Gérez vos relations avec vos locataires</p>
        </div>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("rounded-xl p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "200ms" }}
      >
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "300ms" }}
      >
        <CardHeader>
          <CardTitle>Clients ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Réservations</TableHead>
                <TableHead>Dépenses totales</TableHead>
                <TableHead>Dernière location</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const statusConfig = getStatusConfig(client.status)
                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={client.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback>{client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Membre depuis{" "}
                            {new Date(client.memberSince).toLocaleDateString("fr-FR", {
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{client.email}</p>
                        <p className="text-muted-foreground">{client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{client.totalBookings}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {client.totalSpent.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(client.lastBooking).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{client.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir profil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Envoyer message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Historique
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
