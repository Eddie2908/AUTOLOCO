"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Car,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Star,
  Wrench,
  CheckCircle,
  Grid3X3,
  List,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { cn } from "@/lib/utils"
import { useOwnerVehicles, vehicleTypes } from "@/hooks/use-vehicles"
import { VehicleCardSkeleton, ErrorState, TableSkeleton } from "@/components/loading-states"
import { vehicleStatusLabels, vehicleStatusColors, vehicleStatusOptions } from "@/lib/constants/owner-vehicles"

type OwnerVehicle = any

export default function OwnerVehiclesPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<OwnerVehicle | null>(null)

  const { vehicles, stats, isLoading, error, mutate } = useOwnerVehicles()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredVehicles = (vehicles || []).filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleDeleteClick = (vehicle: OwnerVehicle) => {
    setSelectedVehicle(vehicle)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false)
    setSelectedVehicle(null)
    mutate()
  }

  const statsData = stats || {
    totalVehicles: 0,
    availableVehicles: 0,
    rentedVehicles: 0,
    maintenanceVehicles: 0,
  }

  const statsCards = [
    {
      title: "Total véhicules",
      value: statsData.totalVehicles,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Disponibles",
      value: statsData.availableVehicles,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "En location",
      value: statsData.rentedVehicles,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "En maintenance",
      value: statsData.maintenanceVehicles,
      icon: Wrench,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mes véhicules</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gérez votre flotte de véhicules</p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/vehicles/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un véhicule
          </Link>
        </Button>
      </div>

      <div
        className={cn(
          "grid gap-4 grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {statsCards.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2 md:p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg md:text-2xl font-bold">{isLoading ? "..." : stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row flex-1 gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un véhicule..."
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
                    {vehicleStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "" : "bg-transparent"}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "" : "bg-transparent"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "300ms" }}
      >
        {error ? (
          <ErrorState message="Impossible de charger vos véhicules" onRetry={() => mutate()} />
        ) : isLoading ? (
          viewMode === "grid" ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Card>
              <TableSkeleton rows={6} />
            </Card>
          )
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className={cn("absolute top-3 left-3 text-xs", vehicleStatusColors[vehicle.status])}>
                    {vehicleStatusLabels[vehicle.status]}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/vehicles/${vehicle.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/owner/vehicles/${vehicle.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(vehicle)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm md:text-lg">{vehicle.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{vehicle.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm md:text-base">{vehicle.price.toLocaleString()} FCFA</p>
                      <p className="text-xs text-muted-foreground">/jour</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm md:text-lg font-bold">{vehicle.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Locations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm md:text-lg font-bold">{vehicle.occupancyRate}%</p>
                      <p className="text-xs text-muted-foreground">Occupation</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-amber-400 text-amber-400" />
                        <p className="text-sm md:text-lg font-bold">{vehicle.rating}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Note</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">Revenus totaux</span>
                      <span className="font-semibold text-green-600">
                        {(vehicle.totalRevenue ?? 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden sm:table-cell">Prix/jour</TableHead>
                    <TableHead className="hidden md:table-cell">Locations</TableHead>
                    <TableHead className="hidden lg:table-cell">Occupation</TableHead>
                    <TableHead className="hidden md:table-cell">Revenus</TableHead>
                    <TableHead className="hidden sm:table-cell">Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 md:gap-3">
                          <img
                            src={vehicle.image || "/placeholder.svg"}
                            alt={vehicle.name}
                            className="h-10 w-14 md:h-12 md:w-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-xs md:text-sm">{vehicle.name}</p>
                            <p className="text-xs text-muted-foreground hidden sm:block">{vehicle.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", vehicleStatusColors[vehicle.status])}>
                          {vehicleStatusLabels[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs md:text-sm">{vehicle.price.toLocaleString()} FCFA</TableCell>
                      <TableCell className="hidden md:table-cell">{vehicle.totalBookings}</TableCell>
                      <TableCell className="hidden lg:table-cell">{vehicle.occupancyRate}%</TableCell>
                      <TableCell className="hidden md:table-cell text-green-600 font-medium text-xs md:text-sm">
                        {(vehicle.totalRevenue ?? 0).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {vehicle.rating}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/vehicles/${vehicle.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/owner/vehicles/${vehicle.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(vehicle)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {!isLoading && filteredVehicles.length === 0 && (
          <Card className="p-8 md:p-12 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground mb-4 text-sm">Aucun véhicule ne correspond à vos critères de recherche.</p>
            <Button asChild>
              <Link href="/dashboard/vehicles/new">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un véhicule
              </Link>
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce véhicule ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{selectedVehicle?.name}</span> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-transparent">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
