"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, MoreVertical, Send, Paperclip } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type SupportTicket = {
  id: string
  user: string
  userAvatar: string
  subject: string
  category: string
  priority: string
  status: string
  lastMessage: string
  date: string
  unread: boolean
}

type SupportStats = {
  opened: number
  inProgress: number
  resolvedToday: number
  urgent: number
}

export default function AdminSupportPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [statsData, setStatsData] = useState<SupportStats | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [message, setMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/support")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setSupportTickets(Array.isArray(data?.tickets) ? (data.tickets as SupportTicket[]) : [])
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
      title: "Tickets ouverts",
      value: (statsData?.opened ?? 0).toString(),
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "En cours",
      value: (statsData?.inProgress ?? 0).toString(),
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Résolus aujourd'hui",
      value: (statsData?.resolvedToday ?? 0).toString(),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Urgents",
      value: (statsData?.urgent ?? 0).toString(),
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "high":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "medium":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/10 text-green-600"
      case "in_progress":
        return "bg-amber-500/10 text-amber-600"
      case "resolved":
        return "bg-gray-500/10 text-gray-600"
      default:
        return "bg-gray-500/10 text-gray-600"
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      payment: "Paiement",
      insurance: "Assurance",
      account: "Compte",
      dispute: "Litige",
      technical: "Technique",
      other: "Autre",
    }
    return labels[category] || category
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Support client</h1>
          <p className="text-muted-foreground mt-1">Gérez les demandes d'assistance des utilisateurs</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Tickets</CardTitle>
            <div className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="open">Ouverts</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTicket?.id === ticket.id && "bg-muted",
                    ticket.unread && "border-l-4 border-l-primary",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ticket.userAvatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{ticket.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{ticket.user}</p>
                        {ticket.unread && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{ticket.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(ticket.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(ticket.date).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedTicket.userAvatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{selectedTicket.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTicket.user}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={cn("text-xs", getStatusColor(selectedTicket.status))}>
                          {selectedTicket.status === "open" && "Ouvert"}
                          {selectedTicket.status === "in_progress" && "En cours"}
                          {selectedTicket.status === "resolved" && "Résolu"}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-xs", getPriorityColor(selectedTicket.priority))}>
                          Priorité {selectedTicket.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{selectedTicket.id}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Marquer comme résolu</DropdownMenuItem>
                      <DropdownMenuItem>Escalader</DropdownMenuItem>
                      <DropdownMenuItem>Transférer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTicket.userAvatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{selectedTicket.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-1">{selectedTicket.user}</p>
                        <p className="text-sm">{selectedTicket.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-2">{selectedTicket.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 border-t pt-6">
                  <Textarea
                    placeholder="Écrire une réponse..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Joindre fichier
                    </Button>
                    <div className="flex gap-2">
                      <Select defaultValue="open">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Laisser ouvert</SelectItem>
                          <SelectItem value="in_progress">Marquer en cours</SelectItem>
                          <SelectItem value="resolved">Marquer résolu</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez un ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Choisissez un ticket dans la liste pour voir les détails
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
