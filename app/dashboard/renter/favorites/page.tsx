"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MapPin, Star, Calendar, Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type FavoriteVehicle = {
  id: string
  name: string
  type: string
  price: number
  rating: number
  reviews: number
  image: string
  location: string
  owner: string
  available: boolean
}

export default function RenterFavoritesPage() {
  const [mounted, setMounted] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/renter/favorites")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setFavorites(Array.isArray(data?.vehicles) ? data.vehicles : [])
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleRemoveFavorite = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      setRemovingId(null)
    }, 500)
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
          <h1 className="text-3xl font-bold tracking-tight">Mes favoris</h1>
          <p className="text-muted-foreground mt-1">{favorites.length} véhicules sauvegardés</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            asChild
          >
            <Link href="/vehicles">
              <Search className="h-4 w-4 mr-2" />
              Explorer plus
            </Link>
          </Button>
        </div>
      </div>

      {/* Favorites grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((vehicle, index) => (
          <Card
            key={vehicle.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              removingId === vehicle.id && "opacity-0 scale-95",
            )}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.jpg"}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {!vehicle.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-white/90 text-foreground">
                      Non disponible
                    </Badge>
                  </div>
                )}
                {/* Remove button */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={() => handleRemoveFavorite(vehicle.id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
                <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 text-foreground">
                  {vehicle.type}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.owner}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{vehicle.rating}</span>
                    <span className="text-muted-foreground">({vehicle.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{vehicle.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xl font-bold text-primary">{vehicle.price.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">par jour</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                    asChild
                    disabled={!vehicle.available}
                  >
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Réserver
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Commencez à sauvegarder vos véhicules préférés pour les retrouver facilement plus tard
            </p>
            <Button asChild>
              <Link href="/vehicles">
                <Search className="h-4 w-4 mr-2" />
                Explorer les véhicules
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
