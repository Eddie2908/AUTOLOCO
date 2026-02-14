"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Car, Fuel, Users, Star, Heart, MapPin, Zap, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VehicleUI } from "@/lib/types/vehicle-ui"

interface VehicleCardProps {
  vehicle: VehicleUI
  view?: "grid" | "list"
}

export function VehicleCard({ vehicle, view = "grid" }: VehicleCardProps) {
  const [isLiked, setIsLiked] = React.useState(false)
  const [isTogglingFav, setIsTogglingFav] = React.useState(false)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const images = (vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.image || ""]).filter(Boolean)
  const features = vehicle.features || []
  const price = typeof vehicle.price === "number" ? vehicle.price : 0
  const owner = vehicle.owner || {}

  // Vérifier si le véhicule est en favori au chargement
  React.useEffect(() => {
    async function checkFav() {
      try {
        const res = await fetch(`/api/favorites/${vehicle.id}/check`)
        if (res.ok) {
          const data = await res.json()
          setIsLiked(data.is_favorite === true)
        }
      } catch {}
    }
    if (vehicle.id) checkFav()
  }, [vehicle.id])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isTogglingFav) return
    setIsTogglingFav(true)
    try {
      if (isLiked) {
        const res = await fetch(`/api/favorites/${vehicle.id}`, { method: "DELETE" })
        if (res.ok || res.status === 204) setIsLiked(false)
      } else {
        const res = await fetch(`/api/favorites/${vehicle.id}`, { method: "POST" })
        if (res.ok || res.status === 201) setIsLiked(true)
      }
    } catch {
      console.error("Erreur toggle favori")
    } finally {
      setIsTogglingFav(false)
    }
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (view === "list") {
    return (
      <Link href={`/vehicles/${vehicle.id}`}>
        <div
          className={cn(
            "group flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border/50",
            "transition-all duration-500 hover:shadow-xl hover:border-primary/20",
          )}
        >
          {/* Image */}
          <div className="relative w-full md:w-80 h-56 md:h-auto flex-shrink-0">
            <img
              src={vehicle.image || "/placeholder.svg"}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 md:bg-gradient-to-t md:from-background/50 md:to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {vehicle.featured && (
                <Badge className="bg-accent text-accent-foreground">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Populaire
                </Badge>
              )}
              {vehicle.instantBooking && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant
                </Badge>
              )}
            </div>

            {/* Favorite */}
            <button
              onClick={toggleFavorite}
              disabled={isTogglingFav}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-destructive text-destructive" : "text-muted-foreground",
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {vehicle.location}
                  </p>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  <Car className="h-3 w-3 mr-1" />
                  {vehicle.type}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{vehicle.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {features.slice(0, 4).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {features.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{features.length - 4}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Fuel className="h-4 w-4" />
                  {vehicle.fuel}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {vehicle.seats} places
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {vehicle.rating} ({vehicle.reviews})
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{price.toLocaleString()} FCFA</p>
                <p className="text-xs text-muted-foreground">/jour</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-2xl overflow-hidden border border-border/50",
          "transition-all duration-500 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={vehicle.name}
            className={cn("w-full h-full object-cover transition-transform duration-700", isHovered && "scale-110")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Image navigation */}
          {images.length > 1 && isHovered && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vehicle.featured && (
              <Badge className="bg-accent text-accent-foreground w-fit">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Populaire
              </Badge>
            )}
            {vehicle.verified && (
              <Badge variant="secondary" className="bg-primary/10 text-primary w-fit">
                <Shield className="h-3 w-3 mr-1" />
                Vérifié
              </Badge>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={toggleFavorite}
            disabled={isTogglingFav}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isLiked ? "fill-destructive text-destructive" : "text-muted-foreground",
              )}
            />
          </button>

          {/* Type badge */}
          <Badge variant="secondary" className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm">
            <Car className="h-3 w-3 mr-1" />
            {vehicle.type}
          </Badge>

          {/* Instant booking badge */}
          {vehicle.instantBooking && (
            <Badge className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm">
              <Zap className="h-3 w-3 mr-1" />
              Réservation instantanée
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {vehicle.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {vehicle.location}
            </p>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              {vehicle.fuel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {vehicle.seats}
            </span>
            <span className="capitalize">{vehicle.transmission}</span>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <img
              src={owner.avatar || "/placeholder.svg"}
              alt={owner.name}
              className="h-8 w-8 rounded-full object-cover border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{owner.name}</p>
              <p className="text-xs text-muted-foreground">Membre depuis {owner.memberSince}</p>
            </div>
            {owner.verified && <Shield className="h-4 w-4 text-primary flex-shrink-0" />}
          </div>

          {/* Rating & Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium">{vehicle.rating}</span>
              <span className="text-sm text-muted-foreground">({vehicle.reviews})</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{price.toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground">/jour</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
