"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Search,
  UserPlus,
  MoreVertical,
  Eye,
  CheckCircle,
  Ban,
  Mail,
  Star,
  Filter,
  Download,
  Shield,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

import { cn } from "@/lib/utils"
import { userStatusLabels, userStatusColors } from "@/lib/constants/admin"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type AdminUser = any

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [statsData, setStatsData] = useState<
    { total: number; newThisWeek: number; locataires: number; proprietaires: number } | null
  >(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/users")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setUsers(Array.isArray(data?.users) ? data.users : [])
        setStatsData(data?.stats || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.nom} ${user.prenom || ""}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.statut === statusFilter
    const matchesTab = activeTab === "all" || user.type === activeTab
    return matchesSearch && matchesStatus && matchesTab
  })

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user)
    setDetailsOpen(true)
  }

  const stats = [
    {
      title: "Total utilisateurs",
      value: (statsData?.total ?? users.length).toLocaleString("fr-FR"),
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Nouveaux (7j)",
      value: (statsData?.newThisWeek ?? 0).toLocaleString("fr-FR"),
      icon: UserPlus,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Locataires",
      value: (statsData?.locataires ?? users.filter((u) => u.type === "locataire").length).toLocaleString("fr-FR"),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Propriétaires",
      value: (statsData?.proprietaires ?? users.filter((u) => u.type === "proprietaire").length).toLocaleString("fr-FR"),
      icon: Shield,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gérez les comptes locataires et propriétaires</p>
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

      {/* Filters & Tabs */}
      <Card
        className={cn(
          "transition-all duration-500 overflow-hidden",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4">
              <TabsList className="w-full lg:w-auto">
                <TabsTrigger value="all" className="text-xs md:text-sm">Tous ({users.length})</TabsTrigger>
                <TabsTrigger value="locataire" className="text-xs md:text-sm">
                  Locataires ({users.filter((u) => u.type === "locataire").length})
                </TabsTrigger>
                <TabsTrigger value="proprietaire" className="text-xs md:text-sm">
                  Propriétaires ({users.filter((u) => u.type === "proprietaire").length})
                </TabsTrigger>
              </TabsList>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="verifie">Vérifié</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Inscription</TableHead>
                    <TableHead className="hidden lg:table-cell">Transactions</TableHead>
                    <TableHead className="hidden sm:table-cell">Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer" onClick={() => handleViewDetails(user)}>
                      <TableCell>
                        <div className="flex items-center gap-2 md:gap-3">
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.nom[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                              {user.nom} {user.prenom}
                            </p>
                            <p className="text-xs text-muted-foreground hidden sm:block">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">{user.type === "locataire" ? "Locataire" : "Propriétaire"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", userStatusColors[user.statut])}>{userStatusLabels[user.statut]}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs md:text-sm">
                        {format(new Date(user.dateInscription), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{user.totalTransactions}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.noteGlobale ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {user.noteGlobale}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Vérifier
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer un message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-muted-foreground">Aucun utilisateur ne correspond à vos critères.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de l'utilisateur</SheetTitle>
            <SheetDescription>Informations complètes et actions disponibles</SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="mt-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl md:text-2xl">{selectedUser.nom[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">
                    {selectedUser.nom} {selectedUser.prenom}
                  </h3>
                  <p className="text-muted-foreground text-sm">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {selectedUser.type === "locataire" ? "Locataire" : "Propriétaire"}
                    </Badge>
                    <Badge className={cn("text-xs", userStatusColors[selectedUser.statut])}>
                      {userStatusLabels[selectedUser.statut]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-xl md:text-2xl font-bold">{selectedUser.totalTransactions}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 md:h-5 md:w-5 fill-amber-400 text-amber-400" />
                      <span className="text-xl md:text-2xl font-bold">{selectedUser.noteGlobale || "-"}</span>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">Note moyenne</p>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h4 className="font-semibold">Informations</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span className="font-medium">{selectedUser.telephone}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Ville</span>
                    <span className="font-medium">{selectedUser.ville}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Inscription</span>
                    <span className="font-medium">
                      {format(new Date(selectedUser.dateInscription), "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Dernière activité</span>
                    <span className="font-medium">
                      {format(new Date(selectedUser.lastActivity), "dd/MM/yyyy HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h4 className="font-semibold">Actions</h4>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start bg-transparent">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Vérifier le compte
                  </Button>
                  <Button variant="outline" className="justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-destructive hover:text-destructive bg-transparent"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre le compte
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
