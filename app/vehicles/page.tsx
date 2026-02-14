"use client"

import * as React from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { VehicleCard } from "@/components/vehicles/vehicle-card"
import { VehicleFilters, type Filters } from "@/components/vehicles/vehicle-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid3X3, List, MapPin, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVehicles } from "@/hooks/use-vehicles"
import { VehicleCardSkeleton, ErrorState } from "@/components/loading-states"

const defaultFilters: Filters = {
  type: "all",
  city: "all",
  fuel: "all",
  transmission: "all",
  priceRange: [0, 100000],
  seats: [],
  features: [],
  instantBooking: false,
  verified: false,
}

// Map UI sort values to server-side sort keys
const SORT_MAP: Record<string, string | undefined> = {
  recommended: undefined,
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  rating: "rating",
  newest: "newest",
}

export default function VehiclesPage() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [filters, setFilters] = React.useState<Filters>(defaultFilters)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState("recommended")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Debounce search input (400ms) to avoid hammering the API
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset to page 1 when filters or sort change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy])

  // All filtering, sorting and pagination is now done server-side
  const { vehicles, total, totalPages, isLoading, error, mutate } = useVehicles({
    type: filters.type,
    city: filters.city,
    fuel: filters.fuel,
    transmission: filters.transmission,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 100000 ? filters.priceRange[1] : undefined,
    seats: filters.seats.length > 0 ? Math.min(...filters.seats) : undefined,
    verified: filters.verified || undefined,
    search: debouncedSearch || undefined,
    sort: SORT_MAP[sortBy],
    page: currentPage,
  })

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.type !== "all") count++
    if (filters.city !== "all") count++
    if (filters.fuel !== "all") count++
    if (filters.transmission !== "all") count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++
    if (filters.seats.length > 0) count++
    if (filters.features.length > 0) count++
    if (filters.instantBooking) count++
    if (filters.verified) count++
    return count
  }, [filters])

  const removeFilter = (key: keyof Filters, value?: string | number) => {
    if (key === "features" && value) {
      setFilters((prev) => ({
        ...prev,
        features: prev.features.filter((f) => f !== value),
      }))
    } else if (key === "seats" && value) {
      setFilters((prev) => ({
        ...prev,
        seats: prev.seats.filter((s) => s !== value),
      }))
    } else if (key === "priceRange") {
      setFilters((prev) => ({ ...prev, priceRange: [0, 100000] }))
    } else if (key === "instantBooking" || key === "verified") {
      setFilters((prev) => ({ ...prev, [key]: false }))
    } else {
      setFilters((prev) => ({ ...prev, [key]: "all" }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn("text-center max-w-3xl mx-auto mb-12 opacity-0", isVisible && "animate-slide-up opacity-100")}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Trouvez le véhicule <span className="text-primary">parfait</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Des milliers de véhicules disponibles dans tout le Cameroun. Comparez, réservez et partez !
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par marque, modèle ou ville..."
                  className="pl-10 h-12 bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-12 px-8">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-wrap items-center gap-3 mb-8 opacity-0",
              isVisible && "animate-slide-up stagger-1 opacity-100",
            )}
          >
            <Button
              variant={filters.city === "Douala" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, city: prev.city === "Douala" ? "all" : "Douala" }))}
              className={cn(filters.city !== "Douala" && "bg-transparent")}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Douala
            </Button>
            <Button
              variant={filters.city === "Yaoundé" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, city: prev.city === "Yaoundé" ? "all" : "Yaoundé" }))}
              className={cn(filters.city !== "Yaoundé" && "bg-transparent")}
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Yaoundé
            </Button>
            <Button
              variant={filters.instantBooking ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, instantBooking: !prev.instantBooking }))}
              className={cn(!filters.instantBooking && "bg-transparent")}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Réservation instantanée
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-72 flex-shrink-0">
              <VehicleFilters filters={filters} onFiltersChange={setFilters} activeFiltersCount={activeFiltersCount} />
            </div>

            <div className="flex-1">
              <div
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 opacity-0",
                  isVisible && "animate-slide-up stagger-2 opacity-100",
                )}
              >
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{isLoading ? "..." : total}</span>{" "}
                    véhicules trouvés
                  </p>
                  <div className="lg:hidden">
                    <VehicleFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      activeFiltersCount={activeFiltersCount}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44 h-9">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommandes</SelectItem>
                      <SelectItem value="price-asc">Prix croissant</SelectItem>
                      <SelectItem value="price-desc">Prix decroissant</SelectItem>
                      <SelectItem value="rating">Mieux notes</SelectItem>
                      <SelectItem value="newest">Plus recents</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-9 w-9 rounded-none", view === "grid" && "bg-muted")}
                      onClick={() => setView("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-9 w-9 rounded-none", view === "list" && "bg-muted")}
                      onClick={() => setView("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.type !== "all" && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Type: {filters.type}
                      <button onClick={() => removeFilter("type")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.city !== "all" && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Ville: {filters.city}
                      <button onClick={() => removeFilter("city")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.fuel !== "all" && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Carburant: {filters.fuel}
                      <button onClick={() => removeFilter("fuel")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Prix: {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
                      <button
                        onClick={() => removeFilter("priceRange")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.instantBooking && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Réservation instantanée
                      <button
                        onClick={() => removeFilter("instantBooking")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.verified && (
                    <Badge variant="secondary" className="pl-2 pr-1 py-1">
                      Vérifiés uniquement
                      <button
                        onClick={() => removeFilter("verified")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="pl-2 pr-1 py-1">
                      {feature}
                      <button
                        onClick={() => removeFilter("features", feature)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {error ? (
                <ErrorState message="Impossible de charger les vehicules" onRetry={() => mutate()} />
              ) : isLoading ? (
                <div
                  className={cn(view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6")}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VehicleCardSkeleton key={i} />
                  ))}
                </div>
              ) : vehicles.length > 0 ? (
                <>
                  <div
                    className={cn(
                      view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6",
                      "opacity-0",
                      isVisible && "animate-fade-in stagger-3 opacity-100",
                    )}
                  >
                    {vehicles.map((vehicle: Record<string, unknown>, index: number) => (
                      <div
                        key={vehicle.id as string}
                        className="animate-scale-in opacity-0"
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                      >
                        <VehicleCard vehicle={vehicle as any} view={view} />
                      </div>
                    ))}
                  </div>

                  {/* Server-side pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        aria-label="Page precedente"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 7) {
                          pageNum = i + 1
                        } else if (currentPage <= 4) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-9 w-9"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Page suivante"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Aucun vehicule trouve</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos criteres de recherche ou de reinitialiser les filtres.
                  </p>
                  <Button onClick={() => setFilters(defaultFilters)}>Reinitialiser les filtres</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
