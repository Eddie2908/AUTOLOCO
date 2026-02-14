"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Fuel, Users, Star, Heart, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type FeaturedVehicle = {
  id: string
  name: string
  type: string
  price: number
  image: string
  fuel: string
  seats: number
  rating: number
  reviews: number
  location: string
  verified?: boolean
  featured?: boolean
}

export function VehicleShowcase() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [vehicles, setVehicles] = React.useState<FeaturedVehicle[]>([])
  const sectionRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/featured-vehicles")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !Array.isArray(data?.vehicles)) return
        setVehicles(data.vehicles)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])

  if (vehicles.length === 0) return null

  return (
    <section ref={sectionRef} className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 opacity-0",
            isVisible && "animate-slide-up opacity-100",
          )}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">
              Véhicules <span className="text-primary">populaires</span>
            </h2>
            <p className="text-muted-foreground">Découvrez les véhicules les mieux notés par notre communauté</p>
          </div>
          <Button variant="outline" asChild className="group bg-transparent">
            <Link href="/vehicles">
              Voir tous les véhicules
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className={cn(
                "group relative bg-card rounded-2xl overflow-hidden border border-border/50",
                "transition-all duration-500 hover:shadow-2xl hover:border-primary/20",
                "opacity-0",
                isVisible && "animate-scale-in opacity-100",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredId(String(vehicle.id))}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.name}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700",
                    hoveredId === String(vehicle.id) && "scale-110",
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {vehicle.featured && (
                    <Badge className="bg-accent text-accent-foreground">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                  {vehicle.verified && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Vérifié
                    </Badge>
                  )}
                </div>

                {/* Favorite button */}
                <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110">
                  <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                </button>

                {/* Type badge */}
                <Badge variant="secondary" className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm">
                  <Car className="h-3 w-3 mr-1" />
                  {vehicle.type}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Fuel className="h-4 w-4" />
                    {vehicle.fuel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {vehicle.seats} places
                  </span>
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{vehicle.rating}</span>
                    <span className="text-sm text-muted-foreground">({vehicle.reviews})</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{vehicle.price.toLocaleString()} FCFA</p>
                    <p className="text-xs text-muted-foreground">/jour</p>
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-300",
                  hoveredId === String(vehicle.id) && "opacity-100",
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
