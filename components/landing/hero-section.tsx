"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, ArrowRight, Shield, Star, Users, Car } from "lucide-react"
import { cn } from "@/lib/utils"

const defaultStats = [
  { value: "0", label: "Véhicules", icon: Car },
  { value: "0", label: "Utilisateurs", icon: Users },
  { value: "0", label: "Note moyenne", icon: Star },
]

const statIcons: Record<string, React.ElementType> = {
  "Véhicules": Car,
  "Utilisateurs": Users,
  "Note moyenne": Star,
}

export function HeroSection() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [stats, setStats] = React.useState(defaultStats)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/stats")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !Array.isArray(data?.stats)) return
        setStats(data.stats.map((s: any) => ({ ...s, icon: statIcons[s.label] || Car })))
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={cn("space-y-8 opacity-0", isVisible && "animate-slide-up opacity-100")}>
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm font-medium animate-pulse-glow bg-primary/10 text-primary border-primary/20"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Plateforme sécurisée 100%
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Louez votre{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent animate-gradient">
                    véhicule idéal
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path
                      d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-primary/30"
                    />
                  </svg>
                </span>{" "}
                au Cameroun
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
                Découvrez la première plateforme de location de véhicules entre particuliers et professionnels. Simple,
                sécurisée et accessible partout au Cameroun.
              </p>
            </div>

            {/* Search Card */}
            <div
              className={cn(
                "bg-card rounded-2xl p-6 shadow-xl border border-border/50 opacity-0",
                isVisible && "animate-slide-up stagger-2 opacity-100",
              )}
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Où ?" className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-primary/50" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Quand ?"
                    className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-primary/50"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 group"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div
              className={cn(
                "flex flex-wrap gap-8 pt-4 opacity-0",
                isVisible && "animate-slide-up stagger-3 opacity-100",
              )}
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-3 group cursor-default">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div
            className={cn(
              "relative lg:h-[600px] opacity-0",
              isVisible && "animate-slide-in-right stagger-2 opacity-100",
            )}
          >
            <div className="relative h-full">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 h-full">
                <img src="/modern-car-rental-platform-dashboard-with-vehicles.jpg" alt="AUTOLOCO Platform" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 animate-float">
                <div className="bg-card rounded-xl p-4 shadow-xl border border-border/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Paiement Sécurisé</p>
                      <p className="text-xs text-muted-foreground">Mobile Money & Carte</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/3 animate-float" style={{ animationDelay: "-2s" }}>
                <div className="bg-card rounded-xl p-4 shadow-xl border border-border/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">+1500 avis</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
